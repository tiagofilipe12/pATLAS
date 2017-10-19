#!/usr/bin/env python3

"""
fastqc template for nextflow

Purpose
-------

This module is intended to run FastQC on paired-end FastQ files.

Expected input
--------------
fastq_pair: Pair of FastQ file paths
    .: 'SampleA_1.fastq.gz SampleA_2.fastq.gz'

Generated output
----------------
pair_[1,2]_data: File containing FastQC report at the nucleotide level
    .: 'pair_1_data' and 'pair_2_data'
pair_[1,2]_summary: File containing FastQC report for each category
    .: 'pair_1_summary' and 'pair_2_summary'
"""

import os
import subprocess

from subprocess import PIPE
from os.path import exists, join


if __file__.endswith(".command.sh"):
    FASTQ_PAIR = '$fastq_pair'.split()
    ADAPTER_FILE = eval('$ad')
    CPUS = '$task.cpus'


def convert_adatpers(adapter_fasta):
    """Generates an adapter file for FastQC from a fasta file

    Parameters
    ----------
    adapter_fasta : str
        Path to Fasta file with adapter sequences

    Returns
    -------
    adapter_out : str or None
        The path to the reformatted adapter file. Returns None if the adapters
        file does not exist or the path is incorrect.
    """

    adapter_out = "fastqc_adapters.tab"

    try:

        with open(adapter_fasta) as fh, \
                open(adapter_out, "w") as adap_fh:

            for line in fh:
                if line.startswith(">"):

                    head = line[1:].strip()
                    # Get the next line with the sequence string
                    sequence = next(fh).strip()

                    adap_fh.write("{}\\t{}\\n".format(head, sequence))

        return adapter_out

    # If an invalid adapters file is provided, return None.
    except FileNotFoundError:
        return


def main(fastq_pair, adapter_file, cpus):

    # If an adapter file was provided, convert it to FastQC format
    if adapter_file:
        adapters = convert_adatpers(adapter_file)
    else:
        adapters = None

    # Setting command line for FastQC
    cli = [
        "fastqc",
        "--extract",
        "--nogroup",
        "--format",
        "fastq",
        "--threads",
        str(cpus)
    ]

    # Add adapters file to command line, if it exists
    if adapters:
        cli += ["--adapters", "{}".format(adapters)]

    # Add FastQ files at the end of command line
    cli += fastq_pair

    p = subprocess.Popen(cli, stdout=PIPE, stderr=PIPE, shell=False)
    stdout, stderr = p.communicate()

    # Check if the FastQC output was correctly generated.
    with open("fastq_status", "w") as fh:
        for fastq in fastq_pair:
            fpath = join(fastq.rsplit(".", 2)[0] + "_fastqc", "fastqc_data.txt")
            # If the FastQC output does not exist, pass the STDERR to
            # the output status channel and exit
            if not exists(fpath):
                fh.write(str(stderr))
                return

        # If the output directories exist, write 'pass' to the output status
        # channel
        fh.write("pass")

    # Both FastQC have been correctly executed. Get the relevant FastQC
    # output files for the output channel
    for i, fastq in enumerate(fastq_pair):
        # Get results for each pair
        fastqc_dir = fastq.rsplit(".", 2)[0] + "_fastqc"

        summary_file = join(fastqc_dir, "summary.txt")
        fastqc_data_file = join(fastqc_dir, "fastqc_data.txt")

        # Rename output files to a file name that is easier to handle in the
        # output channel
        os.rename(fastqc_data_file, "pair_{}_data".format(i + 1))
        os.rename(summary_file, "pair_{}_summary".format(i + 1))


if __name__ == "__main__":

    main(FASTQ_PAIR, ADAPTER_FILE, CPUS)
