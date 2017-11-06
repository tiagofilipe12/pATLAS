#!/usr/bin/env python3

import argparse
import os
import json

try:
    from db_manager.db_app import db, models
    from templates.process_abricate import Abricate
except ImportError:
    from patlas.db_manager.db_app import db, models
    from patlas.templates.process_abricate import Abricate


class DbInsertion(Abricate):
    '''
    class with DB specific methods
    This class expects to inherit a storage list of dictionaries from its
    Abricate parent class
    '''

    def __init__(self, var):
        # Here we'll call the __init__ of the base class Abricate.
        super().__init__(var)

    def get_storage(self, list_of_filters, db_type):

        fields = [
            "reference",
            "coverage",
            "identity",
            "database",
            "gene",
            "accession",
            "seq_range"
        ]

        unique_entries = []
        temp_dict = {}

        for entry in self.iter_filter(list_of_filters, fields=fields):
            # setting variables to pass to db
            query_seq = entry["reference"]
            coverage = entry["coverage"]
            identity = entry["identity"]
            database = entry["database"]
            gene = entry["gene"]
            accession = entry["accession"]
            seq_range = entry["seq_range"]
            # temp_dict keys and db plasmid_id
            reference_accession = "_".join(query_seq.split("_")[0:3])
            # generate a new dict to dump to db
            if reference_accession not in unique_entries:
                unique_entries.append(reference_accession)
                temp_dict[reference_accession] = {
                    "coverage": [coverage],
                    "identity": [identity],
                    "database": [database],
                    "gene": [gene],
                    "accession": [accession],
                    "seq_range": [seq_range]
                }
            else:
                # checks if gene and its accession is in the their respective
                # lists in the dict. If they are there is no reason to add
                # them to the dictionary because we already know the
                # respective resistance gene
                # if gene not in temp_dict[reference_accession]["gene"] and \
                #         accession not in temp_dict[reference_accession][
                #             "accession"]:
                # previous code is no longer required... but if for some
                # reason we suspect of duplicates that line can be re-added
                temp_dict[reference_accession]["coverage"].append(coverage)
                temp_dict[reference_accession]["identity"].append(identity)
                temp_dict[reference_accession]["database"].append(database)
                temp_dict[reference_accession]["gene"].append(gene)
                temp_dict[reference_accession]["accession"].append(accession)
                temp_dict[reference_accession]["seq_range"].append(seq_range)

        for k,v in temp_dict.items():
            # checks database
            if db_type == "resistance":
                # TODO if resistance try to get ARO accession based on DNA
                # accession provided by abricate (parse file aro_index.csv)
                row = models.Card(
                    plasmid_id = k,
                    json_entry = v
                )
            elif db_type == "plasmidfinder":
                row = models.Database(
                    plasmid_id = k,
                    json_entry = v
                )
            else:
                print("Wrong db type specified in '-db' option")
                raise SystemExit
            # then do db magic
            db.session.add(row)
            db.session.commit()
        db.session.close()

    def get_json_file(self, list_of_filters, db_type):
        '''
        :param list_of_filters: list, List of filters to be applied with
        process_abricate.py iter_filter method
        :param input_file: str, input file for card db
        :param db_type: str, string to specify db type to output file
        '''

        fields = [
            "reference",
            "database",
            "gene"
        ]

        output_name = db_type + ".json"
        json_dict = {}
        unique_entries = []

        for entry in self.iter_filter(list_of_filters, fields=fields):
            query_seq = entry["reference"]
            reference_accession = "_".join(query_seq.split("_")[0:3])
            database = entry["database"]
            gene = entry["gene"]
            if reference_accession not in unique_entries:
                unique_entries.append(reference_accession)
                json_dict[reference_accession] = {
                    "database": [database],
                    "gene": [gene]
                }
            else:
                json_dict[reference_accession]["database"].append(database)
                json_dict[reference_accession]["gene"].append(gene)
        out_file = open(output_name, "w")
        out_file.write(json.dumps(json_dict))
        out_file.close()

# TODO this function needs to be used inside get_storage method
def get_card_dict(csv_file):
    '''Function to construct a correspondence between nucleotide accession
    numbers and aro accession numbers

    :param csv_file: str, Input file string to open
    :return: dic, dictionary with correspondence between dna_accession and
    aro_accession
    '''
    csv_dict = {}
    with open(csv_file) as f:
        next(f)
        for line in f:
            tab_split = line.split(",")
            aro_accession = tab_split[0]
            dna_accession = tab_split[1]
            csv_dict[dna_accession] = aro_accession
    return csv_dict


def main():
    parser = argparse.ArgumentParser(description='Compares all entries in a '
                                                 'fasta file using abricate')
    options = parser.add_argument_group('Main options')

    options.add_argument('-i', '--input_file', dest='inputfile',
                              nargs='+', required=True, help='Provide the '
                                                             'abricate file '
                                                             'to parse to db. '
                                                             'It can accept '
                                                             'more than one '
                                                             'file in the '
                                                             'case of resistances')
    options.add_argument('-db', '--db', dest='output_psql_db',
        choices=["resistance", "plasmidfinder"], required=True,
        help='Provide the db to output in psql models.')
    options.add_argument('-id', '--identity', dest='identity',
                         default="90", help='minimum identity to be '
                                               'reported '
                                           'to db')
    options.add_argument('-cov', '--coverage', dest='coverage',
                         default="80", help='minimum coverage do be '
                                               'reported to db')
    options.add_argument('-csv', '--csv', dest='csvfile',
                         nargs='1', help="Provide card csv "
                                                        "file to get "
                                                        "correspondence "
                                                        "between DNA "
                                                        "accessions and ARO "
                                                        "accessions")

    args = parser.parse_args()

    input_file = args.inputfile
    db_type = args.output_psql_db
    perc_id = float(args.identity)
    perc_cov = float(args.coverage)
    if args.csvfile is None:
        script_dir = os.path.dirname(__file__)
        rel_path_csv_file = "db_manager/db_app/static/csv/aro_index.csv"
        csv_file = os.path.join(script_dir, rel_path_csv_file)
    else:
        csv_file = args.csvfile

    # Create DbInsertion instance with the provided input files using the
    # imported class
    db_handle = DbInsertion(input_file)

    list_of_filters = [
        ["coverage", ">=", perc_cov],
        ["identity", ">=", perc_id]
    ]

    # outputs to psql db
    #db_handle.get_storage(list_of_filters, db_type)

    # outputs a json file
    db_handle.get_json_file(list_of_filters, db_type)

    # Class to use initial class to output abricate results to db
    print("saving results to db {}".format(db_type))
    #input_file.get_storage()

if __name__ == "__main__":
    main()