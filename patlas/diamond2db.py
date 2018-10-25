#!/usr/bin/env python3

import os
import sys
import json
import argparse

try:
    from db_manager.db_app import db, models
except ImportError:
    from patlas.db_manager.db_app import db, models


class DiamondDbInsertion:
    """
    A class instance that parses the output of diamond and handles the dump
    of results to the pATLAS datbase and also generates a file that is
    used by the frontend to populate dropdowns.
    """

    def __init__(self, file, db_type, cov_cutoff=80, id_cutoff=90):

        self.file_parser(file, cov_cutoff, id_cutoff, db_type)

    def file_parser(self, file, cov_cutoff, id_cutoff, db_type):
        """
        This function checks whether the file resulting from the diamond results
        update exists or not.

        Parameters
        ----------
        file: str
            The file name
        cov_cutoff: float
            The cutoff that will be used to filter results for coverage
        id_cutoff: float
            The cutoff that will be used to filter results for identity
        db_type: str
            The database type to which to dump results

        Returns
        -------

        """

        print(file)

        if os.path.exists(file):
            self._parser(file, cov_cutoff, id_cutoff, db_type)
        else:
            print("File {} does not exist".format(file))

    def _parser(self, file, cov_cutoff, id_cutoff, db_type):
        """
        Method that parses the output from diamond, assuming that the following
        flag was used:
        '-f 6 qseqid sseqid pident length mismatch gapopen qstart qend slen
        sstart send evalue bitscore'
        This just changes the slen in relation to the default output of diamond,
        which particulary important here to calculate the coverage

        Parameters
        ----------
        file: str
            The file name
        cov_cutoff: float
            The cutoff that will be used to filter results for coverage
        id_cutoff: float
            The cutoff that will be used to filter results for identity
        db_type: str
            The database type to which to dump results

        Returns
        -------

        """

        database = file.split(".")[0]

        unique_entries = []

        temp_dict = {}

        # starts two variables to control the previous entry so that diamond txt
        # can be filtered
        previous_range = []
        previous_plasmid = False

        with open(file) as fh:
            for line in fh:

                fields = line.strip().split("\t")

                # check if plasmid query exists
                if fields[0]:

                    reference_accession = "_".join(fields[0].split("_")[0:3])

                    try:
                        # calculate the covered positions subtracting the
                        # covered pos by max and bottom ones
                        # then divide by the total length of the sequence and
                        # multiple by 100, then round to 2 decimals
                        coverage = round(((float(fields[10]) - float(
                            fields[9])) / float(fields[8])) * 100, 2)
                    except ValueError:
                        coverage = None
                    try:
                        identity = round(float(fields[2]), 2)
                    except ValueError:
                        identity = None

                    try:
                        accession = fields[1].split("|")[3]
                    except IndexError:
                        accession = None

                    # in this case the aro_accession isn't needed
                    aro_accession = False

                    # the current range for plasmid sequence start and end
                    current_range = sorted([int(fields[6]), int(fields[7])])

                    # when the line changes to a new plasmid, previous_range
                    # list should be emptied
                    if previous_plasmid and previous_plasmid != \
                            reference_accession:
                        previous_range = []

                    check_range = self.check_ranges(previous_range,
                                                    current_range,
                                                    previous_plasmid,
                                                    reference_accession)

                    # if the function check_range returns true then the entry
                    # should not be added, otherwise if the sequence is to be
                    # added then proceed to the next check and add to
                    # previous_range and previous_plasmid
                    if check_range:
                        continue
                    else:
                        previous_range.append(current_range)
                        previous_plasmid = reference_accession

                    # checks if coverage and identity are within the desired
                    # thresholds and avoids adding to dict if not
                    if coverage >= cov_cutoff and identity >= id_cutoff:

                        if reference_accession not in unique_entries:
                            temp_dict[reference_accession] = {
                                "seq_range": [(current_range[0],
                                               current_range[1])],
                                "gene": [fields[1].split("|")[1]],
                                "accession": [accession],
                                "database": [database],
                                "coverage": [coverage],
                                "identity": [identity],
                                "aro_accession": [aro_accession]
                            }
                        else:
                            temp_dict[reference_accession][
                                "seq_range"].append(
                                (current_range[0], current_range[1]))
                            temp_dict[reference_accession]["gene"].append(
                                fields[1].split("|")[1])
                            temp_dict[reference_accession][
                                "accession"].append(accession)
                            temp_dict[reference_accession][
                                "database"].append(database)
                            temp_dict[reference_accession][
                                "coverage"].append(coverage)
                            temp_dict[reference_accession][
                                "identity"].append(identity)
                            temp_dict[reference_accession][
                                "aro_accession"].append(aro_accession)

                        unique_entries.append(reference_accession)

        self.db_dump(temp_dict, db_type)
        self.write_json_file(temp_dict, db_type)

    @staticmethod
    def check_ranges(previous_range, current_range, previous_plasmid,
                     reference_accession):
        """
        Function that checks if current line has already been reported for the
        range in the plasmid sequence. This avoids adding many entries per
        sequence range and chooses just the best hit for that range. This
        assumes that diamond output entries have the best hit on the top and
        worst hits on the bottom, at least for the same ranges.

        Parameters
        ----------
        previous_range: list
            A list of lists with the ranges that were already queried
        current_range: list
            A list with the start and end position of the current query
        previous_plasmid: str
            the accession number of the previously added plasmid
        reference_accession: str
            the accession number of the current plasmid (the plasmid in the
            line being parsed)

        Returns
        -------
            returns True when the current entry has a range inside other range
            already added to the temp_dict dict.

        """

        # checks if previous range start and end is within the
        # current range for the line, if so skips to the next line
        if previous_range:
            # checks if previous_plasmid is different from the one
            # being currently queried in the line
            if previous_plasmid and previous_plasmid == \
                    reference_accession:
                # iterate through all lists of list of ranges to check if a
                # given entry already exists
                for range_entry in previous_range:
                    # if query start is higher than previous query
                    # start and query end is lower than previous
                    # sequence end then it means that we are inside
                    # the range of the previous line
                    if current_range[0] >= range_entry[0] \
                            and current_range[1] <= range_entry[1]:
                        return True

    @staticmethod
    def db_dump(temp_dict, db_type):
        """
        This function just dumps a dict to psql database, depending on
        the database type provided to argparse it will output to different dbs.

        Parameters
        ----------
        temp_dict: dict
            dictionary with reworked entries to properly add to psql db
        db_type: str
            database type to properly add to psql depending on the entered type.

        Returns
        -------

        """

        #  are added in other method that inherits the previous ones.
        for k, v in temp_dict.items():
            if db_type == "metal":
                row = models.MetalDatabase(
                    plasmid_id=k,
                    json_entry=v
                )
            else:
                print("Wrong db type specified in '-db' option")
                raise SystemExit

            # then do db magic
            db.session.add(row)
            db.session.commit()
        db.session.close()

    @staticmethod
    def write_json_file(dict_to_dump, db_type):
        """
        This method will write the necessary entries in temp_dict to the json
        file used to construct the dropdowns

        Parameters
        ----------
        dict_to_dump: dict
            The dictionary used to construct the database and to be parsed to
            the output json file
        db_type: str
            The name of the database, which will be used for file naming

        """

        output_name = db_type + ".json"
        json_dict = {}

        fields = [
            "reference",
            "database",
            "gene"
        ]

        for acc, json_entry in dict_to_dump.items():
            # for each accession contained in dict_to_tump start an entry in
            # json_dict so that the dropdowns have all the entries available
            # in the database
            json_dict[acc] = {}

            # search for the desired keys and add it to the exported json
            for k, v in json_entry.items():
                if k in fields:
                    json_dict[acc][k] = v

        # then write to the output json file (e.g. metal.json)
        out_file = open(output_name, "w")
        out_file.write(json.dumps(json_dict))
        out_file.close()


def main():
    parser = argparse.ArgumentParser(description="Compares all entries in a "
                                                 "fasta file using abricate")

    parser.add_argument("-i", "--input_file", dest="inputfile",
                        required=True, help="Provide the abricate file "
                                            "to parse to db. It can accept "
                                            "more than one file in the "
                                            "case of resistances")
    parser.add_argument("-db_psql", "--database_name", dest="database_name",
                        required=True,
                        help="This argument must be provided as the last"
                             "argument. It states the database name that"
                             "must be used.")
    parser.add_argument("-db", "--db", dest="output_psql_db",
                        choices=["metal"],
                        required=True,
                        help="Provide the db to output in psql models.")
    parser.add_argument("-id", "--identity", dest="identity",
                        default="90", help="minimum identity to be "
                                           "reported to db. Default: 90%")
    parser.add_argument("-cov", "--coverage", dest="coverage",
                        default="80", help="minimum coverage do be "
                                           "reported to db. Default: 80%")

    args = parser.parse_args()

    if args.database_name != sys.argv[-1]:
        print("ERROR: '-db_psql' or '--database_name' should be the last "
              "provided argument")
        sys.exit(1)

    input_file = args.inputfile
    db_type = args.output_psql_db
    perc_id = float(args.identity)
    perc_cov = float(args.coverage)

    DiamondDbInsertion(input_file, db_type, perc_cov, perc_id)


if __name__ == "__main__":
    main()
