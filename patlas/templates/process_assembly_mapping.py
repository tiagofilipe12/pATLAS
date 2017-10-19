#!/usr/bin/env python3

"""
process_assembly_mapping template for nextflow

Purpose
-------

This module is intended to process the coverage report from the assembly
mapping process

Expected input
--------------
fastq_id: Pair of FastQ file paths
    .: 'SampleA'
assembly: Fasta assembly file
    .: 'SH10761A.assembly.fasta'
coverage: TSV file with the average coverage for each assembled contig
    .: 'coverage.tsv'
bam_file: BAM file with the alignmend of reads to the genome
    .: 'sorted.bam'
min_assembly_coverage: Minimum coverage for assembled contigs. Can be 'auto'.
    .: 'auto' or '10'
gsize: Expected genome size
    .: '2.5'

Generated output
----------------

"""

import re
import shutil
import subprocess

from subprocess import PIPE
from collections import OrderedDict


FASTQ_ID = '$fastq_id'
ASSEMBLY_FILE = '$assembly'
COVERAGE_FILE = '$coverage'
BAM_FILE = '$bam_file'
MIN_ASSEMBLY_COVERAGE = '$min_assembly_coverage'
GSIZE = float('$gsize')


def parse_coverage_table(coverage_file):
    """

    Parameters
    ----------
    coverage_file

    Returns
    -------

    """

    # Stores the correspondence between a contig and the corresponding coverage
    # e.g.: {"contig_1": {"cov": 424, "len": 4231} }
    coverage_dict = OrderedDict()
    # Stores the total assembly size
    total_size = 0
    # Stores the total coverage
    total_cov = 0

    with open(coverage_file) as fh:
        for line in fh:
            # Get contig and coverage
            contig, cov = line.strip().split()
            contig_len = int(re.search("length_(.+?)_", line).group(1))
            coverage_dict[contig] = {"cov": int(cov), "len": contig_len}
            # Add total coverage
            total_cov += int(cov)
            # Add total size
            total_size += contig_len

    return coverage_dict, total_size, total_cov


def filter_assembly(assembly_file, minimum_coverage, coverage_info,
                    output_file):
    """

    Parameters
    ----------
    assembly_file
    minimum_coverage
    coverage_info
    output_file

    Returns
    -------

    """

    # This flag will determine whether sequence data should be written or
    # ignored because the current contig did not pass the minimum
    # coverage threshold
    write_flag = False

    with open(assembly_file) as fh, open(output_file, "w") as out_fh:

        for line in fh:
            if line.startswith(">"):
                # Reset write_flag
                write_flag = False
                # Get header of contig
                header = line.strip()[1:]
                # Check coverage for current contig
                contig_cov = coverage_info[header]["cov"]
                # If the contig coverage is above the threshold, write to
                # output filtered assembly
                if contig_cov >= minimum_coverage:
                    write_flag = True
                    out_fh.write(line)

            elif write_flag:
                out_fh.write(line)


def filter_bam(coverage_info, bam_file, min_coverage, output_bam):
    """

    Parameters
    ----------
    coverage_info
    bam_file

    Returns
    -------

    """

    # Get list of contigs that will be kept
    contig_list = [x for x, vals in coverage_info.items()
                   if vals["cov"] >= min_coverage]

    cli = [
        "samtools",
        "view",
        "-buh",
        "-F",
        "4",
        "-o",
        output_bam,
        "-@",
        "1",
        bam_file,
    ]

    cli += contig_list

    p = subprocess.Popen(cli, stdout=PIPE, stderr=PIPE)
    stdout, stderr = p.communicate()

    if not p.returncode:
        # Create index
        cli = [
            "samtools",
            "index",
            output_bam
        ]

        p = subprocess.Popen(cli, stdout=PIPE, stderr=PIPE)
        stdout, stderr = p.communicate()


def check_filtered_assembly(coverage_info, minimum_coverage, genome_size):
    """

    Parameters
    ----------
    coverage_info
    minimum_coverage
    genome_size

    Returns
    -------

    """

    # Get size of assembly after filtering contigs below minimum_coverage
    assembly_size = sum([x["len"] for x in coverage_info.values()
                         if x["cov"] >= minimum_coverage])

    # If the filtered assembly size falls below the 80% genome size threshold,
    # fail this check and return False
    if assembly_size < genome_size * 1e6 * 0.8:
        return False
    else:
        return True


def main():

    # Get coverage info, total size and total coverage from the assembly
    coverage_info, a_size, a_cov = parse_coverage_table(COVERAGE_FILE)

    # Assess the minimum assembly coverage
    if MIN_ASSEMBLY_COVERAGE == "auto":
        # Get the 1/3 value of the current assembly coverage
        min_coverage = (a_cov / a_size) * .3
        # If the 1/3 coverage is lower than 10, change it to the minimum of
        # 10
        if min_coverage < 10:
            min_coverage = 10
    else:
        min_coverage = int(MIN_ASSEMBLY_COVERAGE)

    # Check if filtering the assembly using the provided min_coverage will
    # reduce the final bp number to less than 80% of the estimated genome
    # size.
    # If the check below passes with True, then the filtered assembly
    # is above the 80% genome size threshold.
    filtered_assembly = "{}_filtered.assembly.fasta".format(FASTQ_ID)
    filtered_bam = "filtered.bam"
    if check_filtered_assembly(coverage_info, min_coverage, GSIZE):
        # Filter assembly contigs based on the minimum coverage.
        filter_assembly(ASSEMBLY_FILE, min_coverage, coverage_info,
                        filtered_assembly)
        filter_bam(coverage_info, BAM_FILE, min_coverage, filtered_bam)
    # Could not filter the assembly as it would drop below acceptable length
    # levels. Copy the original assembly to the output assembly file
    # for compliance with the output channel
    else:
        shutil.copy(ASSEMBLY_FILE, filtered_assembly)
        shutil.copy(BAM_FILE, filtered_bam)


main()
