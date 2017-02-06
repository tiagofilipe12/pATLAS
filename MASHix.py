#!/usr/bin/env python

## Last update: 6/2/2017
## Author: T.F. Jesus
## This script runs MASH in plasmid databases making a parwise diagonal matrix for each pairwise comparison between libraries
## Note: each header in fasta is considered a reference

import argparse
import os
from subprocess import Popen, PIPE
from shutil import copyfile
from multiprocessing import Pool
from functools import partial
import tqdm			# dependency to be documented

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
def master_fasta(fastas, output_tag):
	out_folder = os.path.join(os.path.dirname(os.path.abspath(fastas[0])), output_tag)
	folderexist(out_folder)
	out_file = os.path.join(out_folder, "master_fasta_" + output_tag + ".fas")
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
def genomes_parser(main_fasta, output_tag):
	out_folder = os.path.join(os.path.dirname(os.path.abspath(main_fasta)), "tmp")
	folderexist(out_folder)
	out_file = os.path.join(out_folder, os.path.basename(main_fasta) + "_seq" )
	if_handle=open(main_fasta,'r')
	x = 1
	list_genomes = []
	check = 0
	for line in if_handle:
		if line.startswith(">"):
			if check == x:
				out_handle.close()
				x+=1
			out_handle = open(os.path.join(out_file + str(x)), "w")
			list_genomes.append(os.path.join(out_file + str(x)))
			out_handle.write(line)
			check +=1
		else:
			out_handle.write(line)

	if_handle.close()
	return list_genomes

## Makes the sketch command of mash for the reference
def sketch_references(inputfile, output_tag, threads, kmer_size):
	out_folder = os.path.join(os.path.dirname(os.path.abspath(inputfile)), "reference_sketch")
	out_file = os.path.join(out_folder, output_tag +"_reference")
	folderexist(out_folder)
	sketcher_command = "mash sketch -o " + out_file +" -k " + kmer_size+ " -p "+ threads + " -i " + inputfile
	p=Popen(sketcher_command, stdout = PIPE, stderr = PIPE, shell=True)
	p.wait()
	stdout,stderr= p.communicate()
	return out_file + ".msh"

## Makes the sketch command of mash for the reads to be compare to the reference.
## According to mash turorial it is useful to provide the -m 2 option in order to remove single-copy k-mers
def sketch_genomes(genome, inputfile, output_tag, kmer_size):
	out_folder = os.path.join(os.path.dirname(os.path.abspath(inputfile)), "genome_sketchs")
	folderexist(out_folder)
	out_file = os.path.join(out_folder, os.path.basename(genome)) 
	sketcher_command = "mash sketch -o " + out_file +" -k " + kmer_size + " -p 1 -i " + genome 		## threads are 1 here because it's faster multiprocessing
	p=Popen(sketcher_command, stdout = PIPE, stderr = PIPE, shell=True)
	p.wait()
	stdout,stderr= p.communicate()
	return out_file + ".msh"

## Executes mash dist
def masher(ref_sketch, genome_sketch, output_tag):
	out_folder = os.path.join(os.path.dirname(os.path.abspath(genome_sketch)), "dist_files")
	folderexist(out_folder)
	out_file = os.path.join(out_folder, "".join(os.path.basename(genome_sketch).split(".")[:-1])+"_distances.txt")
	mash_command = "mash dist -p 1 " + ref_sketch +" "+ genome_sketch + " > " + out_file		## threads are 1 here because it's faster multiprocessing
	p=Popen(mash_command, stdout = PIPE, stderr = PIPE, shell=True)
	p.wait()
	stdout,stderr= p.communicate()		## implement a check in stderr in order to see if run was sucessfull and if not output which ones weren't.
	os.remove(genome_sketch)		## removes sketch file (.msh) of each genome or sequence
	return out_file

def multiprocess_mash(list_mash_files, ref_sketch,main_fasta, output_tag, kmer_size,genome):	
	genome_sketch = sketch_genomes(genome, main_fasta, output_tag,kmer_size)
	mash_output = masher(ref_sketch, genome_sketch, output_tag)
	os.remove(genome) #removes temporary fasta file
	list_mash_files.append(mash_output)

	return list_mash_files

#def mash_distance_matrix(list_mash_files):
#	out_folder = os.path.join(os.path.dirname(os.path.abspath(genome_sketch)), "dist_files")
#	matrix = open()


##MAIN##

def main():
	parser = argparse.ArgumentParser(description="Compares all entries in a fasta file using MASH")
	parser.add_argument('-i','--input_references', dest='inputfile', nargs='+', required=True, help='Provide the input fasta files to parse.')
	parser.add_argument('-o','--output', dest='output_tag', required=True, help='Provide an output tag')
	parser.add_argument('-t', '--threads', dest='threads', help='Provide the number of threads to be used. Default: 1')
	parser.add_argument('-k', '--kmers', dest='kmer_size', help='Provide the number of k-mers to be provided to mash sketch. Default: 21')
	parser.add_argument('-no_rm', '--no-remove', dest='no_remove', action='store_true', help='Specify if you do not want to remove the output concatenated fasta.')
	args = parser.parse_args()
	if args.threads is None:
		threads = "1"
	else:
		threads = args.threads
	if args.kmer_size is None:
		kmer_size = "21"
	else:
		kmer_size = args.kmer_size
	fastas = []
	for filename in args.inputfile:
		if any (x in filename for x in [".fas",".fasta",".fna",".fsa", ".fa"]):
			fastas.append(filename)

	## checks if multiple fastas are provided or not avoiding master_fasta function
	print "***********************************"
	print "Creating main database..."
	print
	if len(fastas)>1:
		main_fasta = master_fasta(fastas, args.output_tag)
	else:
		main_fasta = fastas[0] + ".tmp"
		copyfile(fastas[0], main_fasta)

	## runs mash related functions
	print "***********************************"
	print "Sketching reference..."
	print 
	ref_sketch=sketch_references(main_fasta,args.output_tag,threads,kmer_size)
	print "***********************************"
	print "Making temporary files for each genome in fasta..."
	print 
	genomes = genomes_parser(main_fasta, args.output_tag)

	## This must be multiprocessed since it is extremely fast to do mash against one plasmid sequence
	print "***********************************"
	print "Sketching genomes and running mash distances..."
	print 

	list_mash_files=[]
	pool = Pool(int(threads)) 		# Create a multiprocessing Pool
	mp=pool.imap_unordered(partial(multiprocess_mash, list_mash_files, ref_sketch,main_fasta, args.output_tag, kmer_size), genomes)   # process genomes iterable with pool
	## loop to print a nice progress bar
	for _ in tqdm.tqdm(mp, total=len(genomes)):
		pass
	pool.close()
	print "Finished MASH... uf uf uf!"

	## remove master_fasta
	if not args.no_remove:
		os.remove(main_fasta)

if __name__ == "__main__":
	main()