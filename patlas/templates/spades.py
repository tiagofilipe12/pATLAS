#!/usr/bin/env python3

"""
spades template for nextflow

Purpose
-------

This module is intended execute spades on sets of paired end FastQ files

Expected input
--------------
fastq_id: Sample Identification string
    .: 'SampleA'
fastq_pair: Pair of FastQ file paths
    .: 'SampleA_1.fastq.gz SampleA_2.fastq.gz'
kmers: Setting for Spades kmers. Can be either 'auto', 'default' or
    a user provided list.
    .: 'auto' or 'default' or '55 77 99 113 127'
opts: List of options for spades execution.
    1. The minimum number of reads to consider an edge in the de Bruijn
    graph during the assembly.
    2. Minimum contigs k-mer coverage.
    .: ['2' '2']

Generated output
----------------
contigs.fasta : Main output of spades with the assembly
    .: 'contigs.fasta'
spades_status :  Stores the status of the spades run. If it was
    successfully executed, it stores 'pass'. Otherwise, it stores the STDERR
    message.
    .: 'pass'

"""

import os
import subprocess

from subprocess import PIPE


FASTQ_ID = '$fastq_id'
FASTQ_PAIR = '$fastq_pair'.split()
MAX_LEN = int('$max_len'.strip())
KMERS = '$kmers'.strip()
OPTS = [x.strip() for x in '$opts'.strip("[]").split(",")]


def set_kmers(kmer_opt, max_read_len):
    """Returns a kmer list based on the provided kmer option and max read len

    Parameters
    ----------
    kmer_opt : str
        The k-mer option. Can be either 'auto', 'default' or a sequence of
        space separated integers, '23, 45, 67'
    max_read_len : int
        The maximum read length of the current sample.

    Returns
    -------
    kmers : list
        List of k-mer values that will be provided to spades

    """

    # Check if kmer option is set to auto
    if kmer_opt == "auto":

        if max_read_len >= 175:
            kmers = [55, 77, 99, 113, 127]
        else:
            kmers = [21, 33, 55, 67, 77]

    # Check if manual kmers were specified
    elif len(kmer_opt.split()) > 1:

        kmers = kmer_opt.split()

    else:

        kmers = []

    return kmers


def main():

    min_coverage, min_kmer_coverage = OPTS

    kmers = set_kmers(KMERS, MAX_LEN)

    cli = [
        "spades.py",
        "--careful",
        "--only-assembler",
        "--threads",
        "$task.cpus",
        "--cov-cutoff",
        min_coverage,
        "-o",
        "."
    ]

    # Add kmers, if any were specified
    if kmers:
        cli += ["-k {}".format(",".join([str(x) for x in kmers]))]

    # Add FastQ files
    cli += [
        "-1",
        FASTQ_PAIR[0],
        "-2",
        FASTQ_PAIR[1]
    ]

    p = subprocess.Popen(cli, stdout=PIPE, stderr=PIPE)
    stdout, stderr = p.communicate()

    with open("spades_status", "w") as fh:
        if p.returncode != 0:
            fh.write(str(stderr))
            return
        else:
            fh.write("pass")

    # Change the default contigs.fasta assembly name to a more informative one
    os.rename("contigs.fasta", "{}_spades.assembly.fasta".format(FASTQ_ID))


main()
