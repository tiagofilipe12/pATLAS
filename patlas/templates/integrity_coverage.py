#!/usr/bin/env python3

"""
integrity_coverage template for nextflow

Purpose
-------

This module has three purposes while iterating over pairs of FastQ files:
    - Check integrity of FastQ (corrupted files)
    - Guess the encoding of FastQ files (this can be turned off in the 'opts'
    argument, see below.)
    - Estimate coverage for each sample

Expected input
--------------

fastq_id: Sample Identification string
    .: 'SampleA'
fastq_pair: Pair of FastQ file paths
    .: 'SampleA_1.fastq.gz SampleA_2.fastq.gz'
gsize: Expected genome size
    .: '2.5'
cov: Minimum coverage threshold
    .: '15'
opts: Specify additional arguments for executing integrity_coverage. The
    arguments should be a string of command line arguments, such as '-e'.
    The accepted arguments are:
        '-e' : Skip encoding guess.

Generated output
---------------

'${fastq_id}_encoding' : Stores the encoding for the sample FastQ. If no
    encoding could be guessed, write 'None' to file.
    .: 'Illumina-1.8' or 'None'
'${fastq_id}_phred' : Stores the phred value for the sample FastQ. If no
    phred could be guessed, write 'None' to file.
    .: '33' or 'None'
'${fastq_id}_coverage' : Stores the expected coverage of the samples,
    based on a given genome size.
    .: '112' or 'fail'
'${fastq_id}_report' : Stores the report on the expected coverage
    estimation. This string written in this file will appear in the
    coverage report.
    .: '${fastq_id}, 112, PASS'
'${fastq_id}_max_len : Stores the maximum read length for the current sample
    .: '152'

Note
----

In case of a corrupted sample, all expected output files should have
'corrupt' written.

"""

import bz2
import gzip
import zipfile

from itertools import chain

# Set constants when running from Nextflow
if __file__.endswith(".command.sh"):
    # CONSTANTS
    FASTQ_PAIR = '$fastq_pair'.split()
    FASTQ_ID = '$fastq_id'
    GSIZE = float('$gsize')
    MINIMUM_COVERAGE = float('$cov')
    OPTS = '$opts'

RANGES = {
    'Sanger': [33, (33, 73)],
    'Illumina-1.8': [33, (33, 74)],
    'Solexa': [64, (59, 104)],
    'Illumina-1.3': [64, (64, 104)],
    'Illumina-1.5': [64, (66, 105)]
}

COPEN = {
    "gz": gzip.open,
    "bz2": bz2.open,
    "zip": zipfile.ZipFile
}

MAGIC_DICT = {
    b"\\x1f\\x8b\\x08": "gz",
    b"\\x42\\x5a\\x68": "bz2",
    b"\\x50\\x4b\\x03\\x04": "zip"
}


def guess_file_compression(file_path, magic_dict=None):
    """

    Parameters
    ----------
    file_path
    magic_dict

    Returns
    -------

    """

    if not magic_dict:
        magic_dict = MAGIC_DICT

    max_len = max(len(x) for x in magic_dict)

    with open(file_path, "rb") as f:
        file_start = f.read(max_len)

    for magic, file_type in magic_dict.items():
        if file_start.startswith(magic):
            return file_type

    return None


def get_qual_range(qual_str):
    """ Get range of the Unicode code point for a given string of characters

    Parameters
    ----------
    qual_str : str
        Arbitrary string

    Returns
    -------
    _ : tuple
        (Minimum Unicode code, Maximum Unicode code)
    """

    vals = [ord(c) for c in qual_str]

    return min(vals), max(vals)


def get_encodings_in_range(rmin, rmax):
    """ Return the valid encodings for a given encoding range.

    The encoding ranges are stored in the RANGES constant dictionary, with
    the encoding name as a string and a list as a value containing the
    phred score and a tuple with the encoding range. For a given encoding
    range provided via the two first arguments, this function will return
    all possible encodings and phred scores.

    Parameters
    ----------
    rmin : int
        Minimum Unicode code in range
    rmax : int
        Maximum Unicode code in range

    Returns
    -------
    valid_encodings : list
        List of all possible encodings for the provided range
    valid_phred : list
        List of all possible phred scores
    """

    valid_encodings = []
    valid_phred = []

    for encoding, (phred, (emin, emax)) in RANGES.items():
        if rmin >= emin and rmax <= emax:
            valid_encodings.append(encoding)
            valid_phred.append(phred)

    return valid_encodings, valid_phred


def main(fastq_id, fastq_pair, gsize, minimum_coverage, opts):

    # Check for runtime options
    if "-e" in opts:
        skip_encoding = True
    else:
        skip_encoding = False

    # Information for encoding guess
    gmin, gmax = 99, 0
    encoding = []
    phred = None

    # Information for coverage estimation
    chars = 0

    # Information on maximum read length
    max_read_length = 0

    # Get compression of each FastQ pair file
    file_objects = []
    for fastq in fastq_pair:
        ftype = guess_file_compression(fastq)

        # This can guess the compression of gz, bz2 and zip. If it cannot
        # find the compression type, it tries to open a regular file
        if ftype:
            file_objects.append(COPEN[ftype](fastq, "rt"))
        else:
            file_objects.append(open(fastq))

    # The '*_encoding' file stores a string with the encoding ('Sanger')
    # If no encoding is guessed, 'None' should be stored
    # The '*_phred' file stores a string with the phred score ('33')
    # If no phred is guessed, 'None' should be stored
    # The '*_coverage' file stores the estimated coverage ('88')
    # The '*_report' file stores a csv report of the file
    # The '*_max_len' file stores a string with the maximum contig len ('155')
    with open("{}_encoding".format(fastq_id), "w") as enc_fh, \
            open("{}_phred".format(fastq_id), "w") as phred_fh, \
            open("{}_coverage".format(fastq_id), "w") as cov_fh, \
            open("{}_report".format(fastq_id), "w") as cov_rep, \
            open("{}_max_len".format(fastq_id), "w") as len_fh:

        try:
            # Iterate over both pair files sequentially using itertools.chain
            for i, line in enumerate(chain(*file_objects)):

                # Parse only every 4th line of the file for the encoding
                # e.g.: AAAA/EEEEEEEEEEE<EEEEEEEEEEEEEEEEEEEEEEEEE (...)
                if (i + 1) % 4 == 0 and not skip_encoding:
                    # It is important to strip() the line so that any newline
                    # character is removed and not accounted for in the
                    # encoding guess
                    lmin, lmax = get_qual_range(line.strip())

                    # Guess new encoding if the range expands the previously
                    # set boundaries of gmin and gmax
                    if lmin < gmin or lmax > gmax:
                        gmin, gmax = min(lmin, gmin), max(lmax, gmax)
                        encoding, phred = get_encodings_in_range(gmin, gmax)

                # Parse only every 2nd line of the file for the coverage
                # e.g.: GGATAATCTACCTTGACGATTTGTACTGGCGTTGGTTTCTTA (...)
                if (i + 3) % 4 == 0:
                    read_len = len(line.strip())
                    chars += read_len

                    # Evaluate maximum read length for sample
                    if read_len > max_read_length:
                        max_read_length = read_len

            # End of FastQ parsing

            # Get encoding
            if len(encoding) > 1:
                encoding = set(encoding)
                phred = set(phred)
                # Get encoding and phred as strings
                # e.g. enc: Sanger, Illumina-1.8
                # e.g. phred: 64
                enc = "{}".format(",".join([x for x in encoding]))
                phred = "{}".format(",".join(str(x) for x in phred))

                enc_fh.write(enc)
                phred_fh.write(phred)
            # Encoding not found
            else:
                enc_fh.write("None")
                phred_fh.write("None")

            # Estimate coverage
            exp_coverage = round(chars / (gsize * 1e6), 2)
            if exp_coverage >= minimum_coverage:
                cov_rep.write("{},{},{}\\n".format(
                    fastq_id, str(exp_coverage), "PASS"))
                cov_fh.write(str(exp_coverage))
            # Estimated coverage does not pass minimum threshold
            else:
                cov_rep.write("{},{},{}\\n".format(
                    fastq_id, str(exp_coverage), "FAIL"))
                cov_fh.write("fail")

            # Maximum read length
            len_fh.write("{}".format(max_read_length))

        # This exception is raised when the input FastQ files are corrupted
        except EOFError:
            for fh in [enc_fh, phred_fh, cov_fh, cov_rep]:
                fh.write("corrupt")


if __name__ == "__main__":

    main(FASTQ_ID, FASTQ_PAIR, GSIZE, MINIMUM_COVERAGE, OPTS)
