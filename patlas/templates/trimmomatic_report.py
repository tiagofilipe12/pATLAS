#!/usr/bin/env python3

"""
trimmomatic_report template for nextflow

Purpose
-------

This module is intended parse the results of the Trimmomatic log for a set
of samples

Expected input
--------------
log_files: Trimmomatic log files
    .: 'Sample1_trimlog.txt Sample2_trimlog.txt'

Generated output
----------------

"""


from collections import OrderedDict


if __file__.endswith(".command.sh"):
    LOG_FILES = '$log_files'.split()


def parse_log(log_file):
    """

    Parameters
    ----------
    log_file

    Returns
    -------

    """

    template = OrderedDict([
        # Total length after trimming
        ("clean_len", 0),
        # Total trimmed base pairs
        ("total_trim", 0),
        # Total trimmed base pairs in percentage
        ("total_trim_perc", 0),
        # Total trimmed at 5' end
        ("5trim", 0),
        # Total trimmed at 3' end
        ("3trim", 0)
    ])

    with open(log_file) as fh:

        for line in fh:
            # This will split the log fields into:
            # 0. read length after trimming
            # 1. amount trimmed from the start
            # 2. last surviving base
            # 3. amount trimmed from the end
            fields = [int(x) for x in line.strip().split()[-4:]]

            template["5trim"] += fields[1]
            template["3trim"] += fields[3]
            template["total_trim"] += fields[1] + fields[3]
            template["clean_len"] += fields[0]

        total_len = template["clean_len"] + template["total_trim"]

        template["total_trim_perc"] = round(
            (template["total_trim"] / total_len) * 100, 2)

    return template


def write_report(storage_dic, output_file):
    """

    Parameters
    ----------
    storage_dic
    output_file

    Returns
    -------

    """

    with open(output_file, "w") as fh:

        # Write header
        fh.write("Sample,Total length,Total trimmed,%,5end Trim,3end Trim\\n")

        # Write contents
        for sample, vals in storage_dic.items():
            fh.write("{},{}\\n".format(
                sample, ",".join([str(x) for x in vals.values()])))


def main(log_files):

    log_storage = OrderedDict()

    for log in log_files:

        log_id = log.split("_")[0]

        # Populate storage of current sample
        log_storage[log_id] = parse_log(log)

    write_report(log_storage, "trimmomatic_report.csv")


if __name__ == '__main__':
    main(LOG_FILES)
