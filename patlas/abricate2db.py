#!/usr/bin/env python3

import argparse

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
            # print(entry)
            # print(entry["reference"])
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
            if query_seq not in unique_entries:
                unique_entries.append(query_seq)
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

        #print(temp_dict)
        # removing duplicate entries from dict

        # TODO card db contains duplicated entries with the same v
        for k,v in temp_dict.items():
            #print(k)
            #print(v)
            # checks database
            if db_type == "resistance":
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

    args = parser.parse_args()

    input_file = args.inputfile
    db_type = args.output_psql_db
    perc_id = float(args.identity)
    perc_cov = float(args.coverage)

    # Create DbInsertion instance with the provided input files using the
    # imported class
    db_handle = DbInsertion(input_file)

    list_of_filters = [
        ["coverage", ">=", perc_cov],
        ["identity", ">=", perc_id]
    ]

    db_handle.get_storage(list_of_filters, db_type)

    # Class to use initial class to output abricate results to db
    print("saving results to db {}".format(db_type))
    #input_file.get_storage()

if __name__ == "__main__":
    main()