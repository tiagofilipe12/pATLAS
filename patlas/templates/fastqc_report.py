#!/usr/bin/env python3

"""
fastqc_report template for nextflow

Purpose
-------

This module is intended parse the results of FastQC for paired end FastQ
samples

Expected input
--------------
fastq_id: Sample Identification string
    .: 'SampleA'
result_p1: Path to FastQC result files for pair 1
    .: 'SampleA_1_data SampleA_1_summary'
result_p2 Path to FastQC result files for pair 2
    .: 'SampleA_2_data SampleA_2_summary'

Generated output
----------------
fastqc_health: Stores the health check for the current sample. If it passes
    all checks, it contains only the string 'pass'. Otherwise, contains
    the summary categories and their respective results
    .: 'pass'
optimal_trim: Stores a tuple with the optimal trimming positions for 5' and
    3' ends of the reads.
    .: '15 151'

"""

import os

from collections import OrderedDict


if __file__.endswith(".command.sh"):
    RESULT_P1 = '$result_p1'.split()
    RESULT_P2 = '$result_p2'.split()
    FASTQ_ID = '$fastq_id'


def get_trim_index(biased_list):
    """Returns the trim index from a boolean list

    Provided with a list of boolean elements ([False, False, True, True]),
    this function will assess the index of the list that minimizes the number
    of True elements (biased positions) at the extremities. To do so,
    it will iterate over the boolean list and find an index position where
    there are two consecutive False elements after a True element. This
    will be considered as an optimal trim position. For example, in the
    following list:

    [True, True, False, True, True, False, False, False, False, ...]

    The optimal trim index will be the 4th position, since it is the first
    occurrence of a True element with two False elements after it.

    If the provided boolean list has no True elements, then the 0 index is
    returned.

    Parameters
    ----------
    biased_list: list
        List of boolean elements, where True means a biased site.

    Returns
    -------
        _ : index position of the biased list for the optimal trim.

    """

    # Return index 0 if there are no biased positions
    if set(biased_list) == {False}:
        return 0

    # Iterate over the biased_list array. Keep the iteration going until
    # we find a biased position with the two following positions unbiased
    # (e.g.: True, False, False).
    # When this condition is verified, return the last biased position
    # index for subsequent trimming.
    for i, val in enumerate(biased_list):
        if val and set(biased_list[i+1:i+3]) == {False}:
            return i + 1

    # If the previous iteration could not find and index to trim, it means
    # that the whole list is basically biased. Return the length of the
    # biased_list
    return len(biased_list)


def trim_range(data_file):
    """Assess the optimal trim range for a given FastQC data file.

    This function will parse a single FastQC data file, namely the
    'Per base sequence content' category. It will retrieve the A/T and G/C
    content for each nucleotide position in the reads, and check whether the
    G/C and A/T proportions are between 80% and 120%. If they are, that
    nucleotide position is marked as biased for future removal.

    Parameters
    ----------
    data_file: str
        Path to FastQC data file.

    Returns
    -------
    trim_nt: list
        List containing the range with the best trimming positions for the
        corresponding FastQ file. The first element is the 5' end trim index
        and the second element is the 3' end trim index.

    """

    # Target string for nucleotide bias assessment
    target_nuc_bias = ">>Per base sequence content"
    # This flag will become True when gathering base proportion data
    # from file.
    gather = False

    # This variable will store a boolean array on the biased/unbiased
    # positions. Biased position will be True, while unbiased positions
    # will be False
    biased = []

    with open(data_file) as fh:

        for line in fh:
            # Start assessment of nucleotide bias
            if line.startswith(target_nuc_bias):
                # Skip comment line
                next(fh)
                gather = True
            # Stop assessment when reaching end of target module
            elif line.startswith(">>END_MODULE") and gather:
                break
            elif gather:
                # Get proportions of each nucleotide
                g, a, t, c = [float(x) for x in line.strip().split()[1:]]
                # Get 'GC' and 'AT content
                gc = (g + 0.1) / (c + 0.1)
                at = (a + 0.1) / (t + 0.1)
                # Assess bias
                if 0.8 <= gc <= 1.2 and 0.8 <= at <= 1.2:
                    biased.append(False)
                else:
                    biased.append(True)

    # Split biased list in half to get the 5' and 3' ends
    biased_5end, biased_3end = biased[:int(len(biased))],\
        biased[int(len(biased)):][::-1]

    trim_nt = [0, 0]
    # Assess number of nucleotides to clip at 5' end
    trim_nt[0] = get_trim_index(biased_5end)
    # Assess number of nucleotides to clip at 3' end
    trim_nt[1] = len(biased) - get_trim_index(biased_3end)

    return trim_nt


def get_sample_trim(p1_data, p2_data):
    """Get the optimal read trim range from data files of paired FastQ reads

    Given the FastQC data report files for paired-end FastQ reads, this
    function will assess the optimal trim range for the 3' and 5' ends of
    the paired-end reads. This assessment will be based on the 'Per sequence
    GC content'.

    Parameters
    ----------
    p1_data: str
        Path to FastQC data report file from pair 1
    p2_data: str
        Path to FastQC data report file from pair 2

    Returns
    -------
    optimal_5trim: int
        Optimal trim index for the 5' end of the reads
    optima_3trim: int
        Optimal trim index for the 3' end of the reads

    See Also
    --------
    trim_range

    """

    sample_ranges = [trim_range(x) for x in [p1_data, p2_data]]

    # Get the optimal trim position for 5' end
    optimal_5trim = max([x[0] for x in sample_ranges])
    # Get optimal trim position for 3' end
    optimal_3trim = min([x[1] for x in sample_ranges])

    return optimal_5trim, optimal_3trim


def get_summary(summary_file):
    """Parses a FastQC summary report file and returns it as a dictionary

    This functio parses a typical FastQC summary report file, retrieving
    only the information on the first two columns. For instance, a line could
    be:

    'PASS	Basic Statistics	SH10762A_1.fastq.gz'

    This parser will build a dictionary with the string in the second column
    as a key and the QC result as the value. In this case, the returned dict
    would be something like:

    {"Basic Statistics": "PASS"}

    Parameters
    ----------
    summary_file: str
        Path to FastQC summary report

    Returns
    -------
    summary_info: OrderedDict
        Returns the information of the FastQC summary report as an ordered
        dictionary, with the categories as strings and the QC result as values

    """

    summary_info = OrderedDict()

    with open(summary_file) as fh:
        for line in fh:
            # Skip empty lines
            if not line.strip():
                continue
            # Populate summary info
            fields = [x.strip() for x in line.split("\t")]
            summary_info[fields[1]] = fields[0]

    return summary_info


def check_summary_health(summary_file):
    """Checks the health of a sample from the FastQC summary file.

    Parses the FastQC summary file and tests whether the sample is good
    or not. There are four categories that cannot fail, and two that
    must pass in order to the sample pass this check

    Parameters
    ----------
    summary_file: str
        Path to FastQC summary file

    Returns
    -------
    _ : Boolean
        Returns True if the sample passes all tests. False if not.
    summary_info : dict
        A dictionary with the FastQC results for each category.
    """

    # Store the summary categories that cannot fail. If they fail, do not
    # proceed with this sample
    fail_sensitive = [
        "Per base sequence quality",
        "Overrepresented sequences",
        "Sequence Length Distribution",
        "Per sequence GC content"
    ]

    # Store summary categories that must pass. If they do not, do not proceed
    # with that sample
    must_pass = [
        "Per base N content",
        "Adapter Content"
    ]

    # Get summary dictionary
    summary_info = get_summary(summary_file)

    for cat, test in summary_info.items():

        # Check for fail sensitive
        if cat in fail_sensitive and test == "FAIL":
            return False, summary_info

        # Check for must pass
        if cat in must_pass and test != "PASS":
            return False, summary_info

    # Passed all tests
    return True, summary_info


def main(fastq_id, result_p1, result_p2):

    with open("fastqc_health", "w") as health_fh, \
            open("report", "w") as rep_fh, \
            open("optimal_trim", "w") as trim_fh:

        # Perform health check according to the FastQC summary report for
        # each pair. If both pairs pass the check, send the 'pass' information
        # to the 'fastqc_health' channel. If at least one fails, send the
        # summary report.
        for p, fastqc_summary in enumerate([result_p1[1], result_p2[1]]):

            health, summary_info = check_summary_health(fastqc_summary)

            # If one of the health flags returns False, send the summary report
            # through the status channel
            if not health:
                for k, v in summary_info.items():
                    health_fh.write("{}: {}\\n".format(k, v))
                    trim_fh.write("fail")
                    rep_fh.write("{},fail,fail\\n".format(fastq_id))
                return
            else:
                health_fh.write("pass")

            # Rename category summary file to the channel that will publish
            # The results
            output_file = "{}_{}_summary.txt".format(fastq_id, p)
            os.rename(fastqc_summary, output_file)

        # Get optimal trimming range for sample, based on the per base sequence
        # content
        optimal_trim = get_sample_trim(result_p1[0], result_p2[0])
        trim_fh.write("{}".format(" ".join([str(x) for x in optimal_trim])))

        rep_fh.write("{},{},{}\\n".format(fastq_id, optimal_trim[0],
                                          optimal_trim[1]))


if __name__ == '__main__':
    main(FASTQ_ID, RESULT_P1, RESULT_P2)
