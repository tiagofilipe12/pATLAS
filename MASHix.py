#!/usr/bin/env python2

## Last update: 6/7/2017
## Author: T.F. Jesus
## This script runs MASH in plasmid databases making a parwise diagonal matrix
# for each pairwise comparison between libraries
## Note: each header in fasta is considered a reference

import argparse
import os
import re
from subprocess import Popen, PIPE
import shutil
from multiprocessing import Pool
from functools import partial
import tqdm
from utils.hist_util import plot_histogram
# import utils.taxa_fetch
# from operator import itemgetter
import json
from db_manager.db_app import db, models


## function to create output directories tree
def output_tree(infile, tag):
    mother_directory = os.path.join(os.path.dirname(os.path.abspath(infile)),
                                    tag)
    dirs = ["", "tmp", "results", "reference_sketch", "genome_sketchs",
            os.path.join("genome_sketchs", "dist_files")]
    for d in dirs:
        try:
            os.mkdir(os.path.join(mother_directory, d))
        except OSError:
            pass
    return mother_directory


## Checks if a directory exists and if not creates one.
def folderexist(directory):
    if not directory.endswith("/"):
        directory = directory + "/"
    if not os.path.exists(os.path.join(directory)):
        os.makedirs(os.path.join(directory))


## Function to fix several issues that fasta header names can have with some
# programs
def header_fix(input_header):
    problematic_characters = ["|", " ", ",", ".", "(", ")", "'", "/", "[", "]",
                              ":", "{", "}"]
    for char in problematic_characters:
        input_header = input_header.replace(char, '_')
    return input_header


def search_substing(string):
    plasmid_search = re.search('plasmid(.+?)__', string)
    if plasmid_search:
        plasmid_name = plasmid_search.group(1).replace("_", "")
        return plasmid_name


## Function to create a master fasta file from several fasta databases. One
# fasta is enough though
def master_fasta(fastas, output_tag, mother_directory):
    out_file = os.path.join(mother_directory, "master_fasta_{}.fas".format(
        output_tag))
    master_fasta = open(out_file, "w")
    sequence_info = {}
    ## creates a list file, listing all genera in input sequences
    # genus_out = os.path.join(mother_directory, "genera_list_{}.lst".format(
    #	output_tag))
    # genus_output = open(genus_out, "w")
    # genera =[]

    ## creates a list file, listing all species in input sequences
    all_species = []
    species_out = os.path.join(mother_directory, "species_list_{}.lst".format(
        output_tag))
    species_output = open(species_out, "w")
    for filename in fastas:
        fasta = open(filename, "r")
        for x, line in enumerate(fasta):
            if line.startswith(">"):
                if x != 0:
                    if accession in sequence_info.keys():
                        print(accession + " - duplicated entry")
                    else:
                        sequence_info[accession] = (species, length,
                                                    plasmid_name)  # outputs
                    # dict at the begining of each new entry
                length = 0  # resets sequence length for every > found
                line = header_fix(line)
                linesplit = line.strip().split("_")  ## splits fasta headers by
                # _ character
                ## gi = "_".join(linesplit[1:2])
                species = "_".join(linesplit[4:6])
                ## if statements to handle some exceptions already found
                if "plasmid" in species.lower():
                    species = "unknown"
                elif "origin" in species.lower():
                    species = "unknown"
                elif "candidatus" in species.split("_")[0].lower():
                    # species name becomes Candidatus Genera species
                    # this needs to be parsed to the database
                    species = "_".join(linesplit[4:7])

                accession = "_".join(linesplit[0:3])
                ## searches plasmid_name in line given that it may be variable
                # its position
                plasmid_name = search_substing(line)
                ## genus related functions
                # genus = linesplit[5]
                # genera.append(genus)
                all_species.append(" ".join(species.split("_")))
            else:
                ## had to add a method to remove \n characteres from the
                # counter for sequence length
                length += len(line.replace("\n", ""))  ## necessary since
            # fasta sequences may be spread in multiple lines
            master_fasta.write(line)
        if accession in sequence_info.keys():
            print(accession + " - duplicated entry")
        else:
            sequence_info[accession] = (species, length, plasmid_name)  ## adds
        # to dict last entry of each input file
    master_fasta.close()
    ## writes genera list to output file
    # genus_output.write('\n'.join(str(i) for i in list(set(genera))))
    # genus_output.close()
    ## writes a species list to output file
    species_output.write('\n'.join(str(i) for i in list(set(all_species))))
    species_output.close()
    return out_file, sequence_info


# Creates temporary fasta files in a tmp directory in order to give to mash
# the file as a unique genome to compare against all genomes
def genomes_parser(main_fasta, output_tag, mother_directory):
    out_folder = os.path.join(mother_directory, "tmp")
    out_file = os.path.join(out_folder, os.path.basename(main_fasta)[:-4])
    if_handle = open(main_fasta, 'r')
    list_genomes_files = []
    out_handle = None
    for x, line in enumerate(if_handle):  ## x coupled with enumerate creates
        # a counter for every loop
        linesplit = line.strip().split("_")
        if line.startswith(">"):
            accession = "_".join(linesplit[0:3])
            if out_handle:
                out_handle.close()
            out_handle = open(os.path.join("{}_{}.fas".format(out_file,
                                                              accession)), "w")
            list_genomes_files.append(os.path.join("{}_{}.fas".format(
                out_file, accession)))
            out_handle.write(line)
        else:
            out_handle.write(line)

    out_handle.close()
    if_handle.close()
    return list_genomes_files


## Makes the sketch command of mash for the reference
def sketch_references(inputfile, output_tag, threads, kmer_size,
                      mother_directory):
    out_folder = os.path.join(mother_directory, "reference_sketch")
    out_file = os.path.join(out_folder, output_tag + "_reference")
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
    p = Popen(sketcher_command, stdout=PIPE, stderr=PIPE)
    p.wait()
    #	stdout,stderr= p.communicate()
    return out_file + ".msh"


## Makes the sketch command of mash for the reads to be compare to the
# reference.
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
                        "1",  ## threads are 1 here because
                        # multiprocessing is faster
                        "-i",
                        genome]
    p = Popen(sketcher_command, stdout=PIPE, stderr=PIPE)
    p.wait()
    return out_file + ".msh"


## Executes mash dist
def masher(ref_sketch, genome_sketch, output_tag, mother_directory):
    out_folder = os.path.join(mother_directory, "genome_sketchs", "dist_files")
    out_file = os.path.join(out_folder, "".join(os.path.basename(
        genome_sketch)[:-8]) + "_distances.txt")
    mash_command = "mash dist -p 1 {} {} > {}".format(ref_sketch,
                                                      genome_sketch, out_file)
    p = Popen(mash_command, stdout=PIPE, stderr=PIPE, shell=True)
    p.wait()


# return out_file

def multiprocess_mash(ref_sketch, main_fasta, output_tag, kmer_size,
                      mother_directory, genome):
    genome_sketch = sketch_genomes(genome, mother_directory, output_tag,
                                   kmer_size)
    masher(ref_sketch, genome_sketch, output_tag, mother_directory)


## calculates ths distances between pairwise genomes
## This function should be multiprocessed in order to retrieve several output
# files (as many as the specified cores specified?)
def mash_distance_matrix(mother_directory, sequence_info, pvalue, mashdist,
                         threads):
    ## read all infiles
    in_folder = os.path.join(mother_directory, "genome_sketchs", "dist_files")
    out_file = open(os.path.join(mother_directory, "results",
                                 "import_to_vivagraph.json"), "w")
    master_dict = {}  ## A dictionary to store all distances to all references of
    #  each sequence/genome
    list_mash_files = [f for f in os.listdir(in_folder) if f.endswith(
        "distances.txt")]
    # lists_traces=[]		## list that lists all trace_lists generated
    x = 0

    # new mp module
    pool = Pool(int(threads))  # Create a multiprocessing Pool
    mp2 = pool.map(
        partial(multiprocess_mash_file, sequence_info, pvalue, mashdist,
                in_folder, x), list_mash_files)  # process list_mash_files
    # iterable with pool
    ## loop to print a nice progress bar
    try:
        for _ in tqdm.tqdm(mp2, total=len(list_mash_files)):
            pass
    except:
        print("progress will not be tracked because of 'reasons'... check if "
              "you have tqdm package installed.")
    pool.close()
    pool.join()  ## needed in order for the process to end before the remaining
    #  options are triggered

    # new block to get trace_list and num_links
    num_links = 0
    list_of_traces = []
    for dic in mp2:
        master_dict.update(dic)  ## sum all dicts into master_dict
        for k, v in dic.items():
            trace_list = []
            for x in v:
                num_links += 1
                dist_value = x[1]
                trace_list.append(float(dist_value))
            list_of_traces.append(trace_list)

    ## writes output json for loading in vivagraph
    out_file.write(json.dumps(master_dict))
    out_file.close()

    ## commits everything to db

    db.session.close()
    print("total number of nodes = {}".format(len(master_dict.keys())))
    # master_dict
    print("total number of links = {}".format(num_links))
    return list_of_traces


def multiprocess_mash_file(sequence_info, pvalue, mashdist,
                           in_folder, x, infile):
    input_f = open(os.path.join(in_folder, infile), 'r')
    temporary_list = []
    temp_dict = {}
    #  mash dist specified in each sequence/genome
    for line in input_f:
        tab_split = line.split("\t")
        # gi = "_".join(tab_split[0].strip().split("_")[0:2])
        ref_accession = "_".join(tab_split[0].strip().split("_")[1:4])
        seq_accession = "_".join(tab_split[1].strip().split("_")[1:4])
        mash_dist = tab_split[2].strip()
        p_value = tab_split[3].strip()
        ## Added new reference string in order to parse easier within
        #  visualization_functions.js
        string_reference = "{}_{}".format(ref_accession,
                                          sequence_info[ref_accession][
                                              1])  ##stores acession and lenght
        #  to json
        ## there is no need to store all values since we are only interested in
        # representing the significant ones
        ## and those that correlate well with ANI (mashdist<=0.1)
        if float(p_value) < float(
                pvalue) and ref_accession != seq_accession and float(
            mash_dist) < float(mashdist):
            temporary_list.append([string_reference, mash_dist])
    if temporary_list:
        x += len(temporary_list)
        ## Added new sequence string in order to parse easier within
        # visualization_functions.js
        string_sequence = "{}_{}".format(seq_accession,
                                         sequence_info[seq_accession][
                                             1])  ##stores acession and lenght
        # to json
        if string_reference in temp_dict.keys():
            print(string_reference + "problematic key")
        else:
            temp_dict[string_sequence] = temporary_list
        ## adds an entry to postgresql database
        ## but first lets parse some variables used for the database
        spp_name = sequence_info[seq_accession][0]
        length = sequence_info[seq_accession][1]
        # gi = sequence_info[seq_accession][2]
        plasmid_name = sequence_info[seq_accession][2]
        ## actual database filling
        ## string_sequence.split("_")[-1] is used to remove length from
        # accession in database

        ## prune temporarylist to have just the accessions
        acc_list = []
        for acc in temporary_list:
            pruned_entry = "_".join(acc[0].split("_")[:-1])
            acc_list.append(pruned_entry)

        ## cannot use json.dumps because it puts double quotes
        doc = {"name": spp_name,
               "length": length,
               "plasmid_name": plasmid_name,
               "significantLinks": acc_list}

        row = models.Plasmid(
            plasmid_id = "_".join(string_sequence.split("_")[:-1]),
            json_entry = doc
        )
        db.session.add(row)
        db.session.commit()
    ## used for graphics visualization
    return temp_dict  # returns the temp_dict


##MAIN##

def main():
    parser = argparse.ArgumentParser(description='Compares all entries in a '
                                                 'fasta file using MASH')

    main_options = parser.add_argument_group('Main options')
    main_options.add_argument('-i', '--input_references', dest='inputfile',
                              nargs='+', required=True, help='Provide the  '
                                                             'input fasta '
                                                             'files  to  '
                                                             'parse.')
    main_options.add_argument('-o', '--output', dest='output_tag',
                              required=True, help='Provide an output tag.')
    main_options.add_argument('-t', '--threads', dest='threads', default="1",
                              help='Provide the number of threads to be used. '
                                   'Default: 1.')

    mash_options = parser.add_argument_group('MASH related options')
    mash_options.add_argument('-k', '--kmers', dest='kmer_size', default="21",
                              help='Provide the number of k-mers to be provided to mash '
                                   'sketch. Default: 21.')
    mash_options.add_argument('-p', '--pvalue', dest='pvalue',
                              default="0.05", help='Provide the p-value to '
                                                   'consider a distance '
                                                   'significant. Default: '
                                                   '0.05.')
    mash_options.add_argument('-md', '--mashdist', dest='mashdistance',
                              default="0.1", help='Provide the maximum mash '
                                                  'distance to be parsed to '
                                                  'the matrix. Default: 0.1.')

    other_options = parser.add_argument_group('Other options')
    other_options.add_argument('-rm', '--remove', dest='remove',
                               action='store_true', help='Remove any temporary '
                                                         'files and folders not '
                                                         'needed (not present '
                                                         'in results '
                                                         'subdirectory).')
    other_options.add_argument('-hist', '--histograms', dest='histograms',
                               action='store_true', help='Checks the '
                                                         'distribution of '
                                                         'distances values  '
                                                         'plotting histograms')
    args = parser.parse_args()

    threads = args.threads
    kmer_size = args.kmer_size
    pvalue = args.pvalue
    mashdist = args.mashdistance

    ## lists all fastas given to argparser
    fastas = [f for f in args.inputfile if f.endswith((".fas", ".fasta",
                                                       ".fna", ".fsa", ".fa"))]

    ## creates output directory tree
    output_tag = args.output_tag.replace("/", "")  ## if the user gives and
    # input tag that is already a folder
    mother_directory = output_tree(fastas[0], output_tag)

    ## checks if multiple fastas are provided or not avoiding master_fasta
    # function
    print "***********************************"
    print "Creating main database..."
    print
    main_fasta, sequence_info = master_fasta(fastas, output_tag,
                                             mother_directory)

    #########################
    ### genera block here ###
    #########################

    ## runs mash related functions
    print "***********************************"
    print "Sketching reference..."
    print
    ref_sketch = sketch_references(main_fasta, output_tag, threads, kmer_size,
                                   mother_directory)

    ## breaks master fasta into multiple fastas with one genome each
    print "***********************************"
    print "Making temporary files for each genome in fasta..."
    print
    genomes = genomes_parser(main_fasta, output_tag, mother_directory)

    ## This must be multiprocessed since it is extremely fast to do mash
    # against one plasmid sequence
    print "***********************************"
    print "Sketching genomes and running mash distances..."
    print

    pool = Pool(int(threads))  # Create a multiprocessing Pool
    mp = pool.imap_unordered(partial(multiprocess_mash, ref_sketch, main_fasta,
                                     output_tag, kmer_size, mother_directory),
                             genomes)  # process genomes iterable with pool

    ## loop to print a nice progress bar
    try:
        for _ in tqdm.tqdm(mp, total=len(genomes)):
            pass
    except:
        print("progress will not be tracked because of 'reasons'... check if "
              "you have tqdm package installed.")
    pool.close()
    pool.join()  ## needed in order for the process to end before the
    # remaining options are triggered
    print
    print "Finished MASH... uf uf uf!"

    ## Makes distances matrix csv file
    print
    print "***********************************"
    print "Creating distance matrix..."
    print
    lists_traces = mash_distance_matrix(mother_directory, sequence_info,
                                        pvalue, mashdist, threads)

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
