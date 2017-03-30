#!/usr/bin/env python

## Last update: 20/3/2017
## Author: T.F. Jesus
## This script runs MASH in plasmid databases making a parwise diagonal matrix for each pairwise comparison between libraries
## Note: each header in fasta is considered a reference

import argparse
import os
from subprocess import Popen, PIPE
import shutil
from multiprocessing import Pool
from functools import partial
import tqdm
import operator	
from utils.hist_util import plot_histogram
#import utils.family_fetch
from operator import itemgetter
import json

## function to create output directories tree
def output_tree(infile, tag):
	mother_directory = out_folder = os.path.join(os.path.dirname(os.path.abspath(infile)), tag)
	dirs = ["", "tmp", "results", "reference_sketch", "genome_sketchs", os.path.join("genome_sketchs","dist_files")]
	for d in dirs:
		try:
			os.mkdir(os.path.join(mother_directory, d))
		except OSError:
			pass
	return mother_directory

## Removes keys from dictionary that are present in another list
## Currently this functions is not being used
#def key_removal(temporary_dict, comparisons_made):
#	for key in temporary_dict.keys():
#		if key in comparisons_made:
#			del temporary_dict[key]
#	return temporary_dict

## Checks if a directory exists and if not creates one.
def folderexist(directory):
	if not directory.endswith("/"):
		directory = directory + "/"
	if not os.path.exists(os.path.join(directory)):		
		os.makedirs(os.path.join(directory))

## Function to fix several issues that fasta header names can have with some programs 
def header_fix(input_header):
	problematic_characters = ["|", " ", ",", ".", "(", ")", "'", "/","[","]",":","{","}"]
	for char in problematic_characters:
		input_header=input_header.replace(char, '_')
	return input_header

## Function to create a master fasta file from several fasta databases. One fasta is enought though
def master_fasta(fastas, output_tag, mother_directory):
	out_file = os.path.join(mother_directory, "master_fasta_{}.fas".format(output_tag))
	master_fasta = open(out_file, "w")
	sequence_info = {}
	## creates a list file, listing all genera in input sequences
	genus_out = os.path.join(mother_directory, "genera_list_{}.lst".format(output_tag))
	genus_output = open(genus_out, "w")
	genera =[]
	for filename in fastas:
		fasta = open(filename,"r")
		for x,line in enumerate(fasta):
			if line.startswith(">"):
				if x != 0:
					sequence_info[sequence] = (species, length)	#outputs dict at the beggining of each new entry
				length = 0 	# resets sequence length for every > found
				line = header_fix(line)
				linesplit = line.strip().split("_") ## splits fasta headers by _ character
				sequence = "_".join(linesplit[0:2]).replace(">","")
				species = "_".join(linesplit[7:9])
			    ## genus related functions
				genus = linesplit[7]
				genera.append(genus)
			else:
				length += len(line)	## necessary since fasta sequences may be spread in multiple lines
			master_fasta.write(line)
		sequence_info[sequence] = (species, str(length))	## adds to dict last entry of each input file
	master_fasta.close()
	## writes genera list to output file
	genus_output.write('\n'.join(str(i) for i in list(set(genera))))
	genus_output.close()
	return out_file, sequence_info

# Creates temporary fasta files in a tmp directory in order to give to mash the file as a unique genome to compare against all genomes
def genomes_parser(main_fasta, output_tag, mother_directory):
	out_folder = os.path.join(mother_directory, "tmp")
	out_file = os.path.join(out_folder, os.path.basename(main_fasta) + "_seq" )
	if_handle=open(main_fasta,'r')
	list_genomes_files = []
	out_handle = None
	for x, line in enumerate(if_handle):		## x coupled with enumerate creates a counter for every loop
		if line.startswith(">"):
			gi = "_".join(tab_split[0].strip().split("_")[0:2])
			if out_handle:
				out_handle.close()
			out_handle = open(os.path.join(out_file + gi, "w")
			list_genomes_files.append(os.path.join(out_file + gi))
			out_handle.write(line)
		else:
			out_handle.write(line)

	out_handle.close()
	if_handle.close()
	return list_genomes_files

## Makes the sketch command of mash for the reference
def sketch_references(inputfile, output_tag, threads, kmer_size, mother_directory):
	out_folder = os.path.join(mother_directory, "reference_sketch")
	out_file = os.path.join(out_folder, output_tag +"_reference")
	sketcher_command = ["mash", 
						"sketch", 
						"-o", 
						out_file, 
						"-k", 
						kmer_size, 
						"-p", 
						threads, 
						"-i", 
						inputfile]
	p=Popen(sketcher_command, stdout = PIPE, stderr = PIPE)
	p.wait()
#	stdout,stderr= p.communicate()
	return out_file + ".msh"

## Makes the sketch command of mash for the reads to be compare to the reference.
def sketch_genomes(genome, mother_directory, output_tag, kmer_size):
	out_folder = os.path.join(mother_directory, "genome_sketchs")
	out_file = os.path.join(out_folder, os.path.basename(genome))
	sketcher_command = ["mash",
						"sketch",
						"-o",
						out_file,
						"-k",
						kmer_size,
						"-p", 
						"1",		## threads are 1 here because multiprocessing is faster 
						"-i",
						genome]
	p=Popen(sketcher_command, stdout = PIPE, stderr = PIPE)
	p.wait()
	return out_file + ".msh"

## Executes mash dist
def masher(ref_sketch, genome_sketch, output_tag, mother_directory):
	out_folder = os.path.join(mother_directory, "genome_sketchs", "dist_files")
	out_file = os.path.join(out_folder, "".join(os.path.basename(genome_sketch).split(".")[:-1])+"_distances.txt")
	mash_command = "mash dist -p 1 {} {} > {}".format(ref_sketch,genome_sketch,out_file)
	p=Popen(mash_command, stdout = PIPE, stderr = PIPE, shell=True)
	p.wait()
	return out_file

def multiprocess_mash(ref_sketch, main_fasta, output_tag, kmer_size, mother_directory, genome):	
	genome_sketch = sketch_genomes(genome, mother_directory, output_tag, kmer_size)
	mash_output = masher(ref_sketch, genome_sketch, output_tag, mother_directory)

## calculates ths distances between pairwise genomes
## This function should be multiprocessed in order to retrieve several output files (as many as the specified cores specified?)
def mash_distance_matrix(mother_directory, sequence_info):
	## read all infiles
	in_folder = os.path.join(mother_directory, "genome_sketchs", "dist_files")
	out_file = open(os.path.join(mother_directory, "results", "import_to_vivagraph.json"), "w")
	master_dict={}	## A dictionary to store all distances to all references of each sequence/genome
	list_mash_files = [f for f in os.listdir(in_folder) if f.endswith("distances.txt")]
	lists_traces=[]		## list that lists all trace_lists generated
	x=0

	for infile in list_mash_files:
		input_f = open(os.path.join(in_folder, infile),'r')
		temporary_list = []
		trace_list=[]	## list to append every distance value with p-value>0.05 in each sequence/genome	
		for line in input_f:
			tab_split = line.split("\t")
			reference = "_".join(tab_split[0].strip().split("_")[0:2])
			sequence = "_".join(tab_split[1].strip().split("_")[0:2])
			mash_dist = tab_split[2].strip()
			p_value = tab_split[3].strip()
			## Added new reference string in order to parse easier within visualization_functions.js
			string_reference = "{}_{}_{}".format(reference, sequence_info[reference][0], sequence_info[reference][1])
			## there is no need to store all values since we are only interested in representing the significant ones 
			## and those that correlate well with ANI (mashdist<=0.1)
			if float(p_value) < 0.05 and reference != sequence and float(mash_dist) < 0.1:
				temporary_list.append([string_reference,mash_dist])
				trace_list.append(float(mash_dist))
		if temporary_list:
			x += len(temporary_list)
			## Added new sequence string in order to parse easier within visualization_functions.js
			string_sequence = "{}_{}_{}".format(sequence, sequence_info[sequence][0], sequence_info[sequence][1])
			master_dict[string_sequence]=temporary_list
		lists_traces.append(trace_list)

	out_file.write(json.dumps(master_dict))
	out_file.close()
	print "total number of nodes = {}".format(len(master_dict.keys()))
	print "total number of links = {}".format(x)
	return lists_traces

##MAIN##

def main():
	parser = argparse.ArgumentParser(description="Compares all entries in a fasta file using MASH")
	parser.add_argument('-i','--input_references', dest='inputfile', nargs='+', required=True, help='Provide the input fasta files to parse.')
	parser.add_argument('-o','--output', dest='output_tag', required=True, help='Provide an output tag.')
	parser.add_argument('-t', '--threads', dest='threads', default="1", help='Provide the number of threads to be used. Default: 1.')
	parser.add_argument('-k', '--kmers', dest='kmer_size', default="21", help='Provide the number of k-mers to be provided to mash sketch. Default: 21.')
	parser.add_argument('-rm', '--remove', dest='remove', action='store_true', help='Remove any temporary files and folders not needed (not present in results subdirectory).')
	parser.add_argument('-hist', '--histograms', dest='histograms', action='store_true', help='Checks the distribution of distances values ploting histograms')
	args = parser.parse_args()

	threads = args.threads
	kmer_size = args.kmer_size

	## lists all fastas given to argparser
	fastas = [f for f in args.inputfile if f.endswith((".fas",".fasta",".fna",".fsa", ".fa"))]

	## creates output directory tree
	output_tag = args.output_tag.replace("/","")	## if the user gives and input tag that is already a folder
	mother_directory=output_tree(fastas[0], output_tag)

	## checks if multiple fastas are provided or not avoiding master_fasta function
	print "***********************************"
	print "Creating main database..."
	print
	main_fasta, sequence_info = master_fasta(fastas, output_tag, mother_directory)

	#########################
	### genera block here ###
	#########################

	## runs mash related functions
	print "***********************************"
	print "Sketching reference..."
	print 
	ref_sketch=sketch_references(main_fasta,output_tag,threads,kmer_size, mother_directory)

	## breaks master fasta into multiple fastas with one genome each
	print "***********************************"
	print "Making temporary files for each genome in fasta..."
	print 
	genomes = genomes_parser(main_fasta, output_tag, mother_directory)

	## This must be multiprocessed since it is extremely fast to do mash against one plasmid sequence
	print "***********************************"
	print "Sketching genomes and running mash distances..."
	print 

	pool = Pool(int(threads)) 		# Create a multiprocessing Pool
	mp=pool.imap_unordered(partial(multiprocess_mash, ref_sketch, main_fasta, output_tag, kmer_size, mother_directory), genomes)   # process genomes iterable with pool
	
	## loop to print a nice progress bar
	try:
		for _ in tqdm.tqdm(mp, total=len(genomes)):
			pass
	except:
		print "progress will not be tracked because of 'reasons'... check if you have tqdm package installed."
	pool.close()
	pool.join()		## needed in order for the process to end before the remaining options are triggered
	print
	print "Finished MASH... uf uf uf!"

	## Makes distances matrix csv file
	print
	print "***********************************"
	print "Creating distance matrix..."
	print 
	lists_traces=mash_distance_matrix(mother_directory, sequence_info)

	## remove master_fasta
	if args.remove:
		print "***********************************"
		print "Removing temporary files and folders..."
		print
		os.remove(main_fasta)
		for d in os.listdir(mother_directory):
			if d != "results":
				shutil.rmtree(os.path.join(mother_directory, d))

	## Histograms  
	if args.histograms:
		print "***********************************"
		print "Outputing histograms..."
		print
		plot_histogram(lists_traces, output_tag, mother_directory)

if __name__ == "__main__":
	main()
	print "***********************************"