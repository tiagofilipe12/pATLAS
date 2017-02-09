#!/usr/bin/env python

## Last update: 8/2/2017
## Author: T.F. Jesus
## This script runs MASH in plasmid databases making a parwise diagonal matrix for each pairwise comparison between libraries
## Note: each header in fasta is considered a reference

import argparse
import os
from subprocess import Popen, PIPE
import shutil
from multiprocessing import Pool
from functools import partial
from collections import OrderedDict
import tqdm
import operator	
import csv

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
def key_removal(temporary_dict, comparisons_made):
	for key in temporary_dict.keys():
		if key in comparisons_made:
			del temporary_dict[key]
	return temporary_dict

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
	for filename in fastas:
		fasta = open(filename,"r")
		for line in fasta:
			if line.startswith(">"):
				line = header_fix(line)
			master_fasta.write(line)
	master_fasta.close()
	return out_file

# Creates temporary fasta files in a tmp directory in order to give to mash the file as a unique genome to compare against all genomes
def genomes_parser(main_fasta, output_tag, mother_directory):
	out_folder = os.path.join(mother_directory, "tmp")
	out_file = os.path.join(out_folder, os.path.basename(main_fasta) + "_seq" )
	if_handle=open(main_fasta,'r')
	list_genomes_files = []
	out_handle = None
	for x, line in enumerate(if_handle):		## x coupled with enumerate creates a counter for every loop
		if line.startswith(">"):
			if out_handle:
				out_handle.close()
			out_handle = open(os.path.join(out_file + str(x)), "w")
			list_genomes_files.append(os.path.join(out_file + str(x)))
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
## According to mash turorial it is useful to provide the -m 2 option in order to remove single-copy k-mers
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
#	stdout,stderr= p.communicate()
	return out_file + ".msh"

## Executes mash dist
def masher(ref_sketch, genome_sketch, output_tag, mother_directory):
	out_folder = os.path.join(mother_directory, "genome_sketchs", "dist_files")
	out_file = os.path.join(out_folder, "".join(os.path.basename(genome_sketch).split(".")[:-1])+"_distances.txt")
	mash_command = "mash dist -p 1 {} {} > {}".format(ref_sketch,genome_sketch,out_file)
	print mash_command
	p=Popen(mash_command, stdout = PIPE, stderr = PIPE, shell=True)
	p.wait()
	stdout,stderr= p.communicate()
	print stderr
	return out_file

def multiprocess_mash(ref_sketch, main_fasta, output_tag, kmer_size, mother_directory, genome):	
	genome_sketch = sketch_genomes(genome, mother_directory, output_tag, kmer_size)
	mash_output = masher(ref_sketch, genome_sketch, output_tag, mother_directory)

## calculates ths distances between pairwise genomes
def mash_distance_matrix(mother_directory, output_tag):
	## read all infiles
	in_folder = os.path.join(mother_directory, "genome_sketchs", "dist_files")
	list_mash_files = [f for f in os.listdir(in_folder) if f.endswith("distances.txt")]
	## creates output directory and opens csv module
	out_folder = os.path.join(mother_directory, "results")
	matrix = open(os.path.join(out_folder, output_tag + ".csv"), 'wb') 
	writer=csv.writer(matrix ,delimiter=';', quotechar='"', quoting=csv.QUOTE_NONE, escapechar='\\')

	comparisons_made = [] 		## A list to store all the comparisons already made
	master_dict = {}			## A dictionary to store all distances to all references of each sequence/genome
	for infile in list_mash_files:
		input_f = open(os.path.join(in_folder, infile),'r')
		temporary_dict = OrderedDict()		
		for line in input_f:
			tab_split = line.split("\t")
			reference = tab_split[0].strip()
			sequence = tab_split[1].strip()
			mash_dist = tab_split[2].strip()
			p_value = tab_split[3].strip()
			if float(p_value) < 0.05:
				temporary_dict[reference] = mash_dist
			else:
				temporary_dict[reference] = "1"

		comparisons_made.append(sequence)		## lists all the sequence or genomes for which all comparisons were already made
		master_dict[sequence] = temporary_dict	## creates a master dictionary storing all dictionaries with distances for each sequence or genome
	## Outputs a csv with a diagonal with the values of distances between genomes
	## first line
	writer.writerow([" "]+comparisons_made)
	## writes all other lines
	for row_length, k in enumerate(comparisons_made):
		list_dist=[]
		for dist in master_dict[k].values():
			list_dist.append(dist) 		
 		row = [k] + list_dist[0:row_length]
		writer.writerow(row)
	return os.path.join(out_folder, output_tag + ".csv")

##MAIN##

def main():
	parser = argparse.ArgumentParser(description="Compares all entries in a fasta file using MASH")
	parser.add_argument('-i','--input_references', dest='inputfile', nargs='+', required=True, help='Provide the input fasta files to parse.')
	parser.add_argument('-o','--output', dest='output_tag', required=True, help='Provide an output tag.')
	parser.add_argument('-t', '--threads', dest='threads', default="1", help='Provide the number of threads to be used. Default: 1.')
	parser.add_argument('-k', '--kmers', dest='kmer_size', default="21", help='Provide the number of k-mers to be provided to mash sketch. Default: 21.')
	parser.add_argument('-rm', '--remove', dest='remove', action='store_true', help='Remove any temporary files and folders not needed (not present in results subdirectory).')
	args = parser.parse_args()

	threads = args.threads
	kmer_size = args.kmer_size
	
	## lists all fastas given to argparser
	fastas = [f for f in args.inputfile if f.endswith((".fas",".fasta",".fna",".fsa", ".fa"))]

	## creates output directory tree
	mother_directory=output_tree(fastas[0], args.output_tag)

	## checks if multiple fastas are provided or not avoiding master_fasta function
	print "***********************************"
	print "Creating main database..."
	print
	main_fasta = master_fasta(fastas, args.output_tag, mother_directory)

	## runs mash related functions
	print "***********************************"
	print "Sketching reference..."
	print 
	ref_sketch=sketch_references(main_fasta,args.output_tag,threads,kmer_size, mother_directory)

	## breaks master fasta into multiple fastas with one genome each
	print "***********************************"
	print "Making temporary files for each genome in fasta..."
	print 
	genomes = genomes_parser(main_fasta, args.output_tag, mother_directory)

	## This must be multiprocessed since it is extremely fast to do mash against one plasmid sequence
	print "***********************************"
	print "Sketching genomes and running mash distances..."
	print 

	pool = Pool(int(threads)) 		# Create a multiprocessing Pool
	mp=pool.imap_unordered(partial(multiprocess_mash, ref_sketch, main_fasta, args.output_tag, kmer_size, mother_directory), genomes)   # process genomes iterable with pool
	
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
	mdm = mash_distance_matrix(mother_directory, args.output_tag)

	## remove master_fasta

	if args.remove:
		print "***********************************"
		print "Removing temporary files and folders..."
		print
		os.remove(main_fasta)
		for d in os.listdir(mother_directory):
			if d != "results":
				shutil.rmtree(os.path.join(mother_directory, d))

if __name__ == "__main__":
	main()