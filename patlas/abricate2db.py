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

        # self.get_items(input_file, list_of_filters)
        for entry in self.iter_filter(list_of_filters, fields=fields):
            # print(entry)
            # print(entry["reference"])
            reference_accession = "_".join(entry["reference"].split("_")[0:3])
            del entry["reference"]
            print(entry)
            print(reference_accession)
            # print(db_type)
            # checks database
            # TODO when there is duplicated entries this fails
            if db_type == "resistance":
                row = models.Card(
                    plasmid_id = reference_accession,
                    json_entry = entry
                )

            elif db_type == "plasmidfinder":
                row = models.Database(
                    plasmid_id = reference_accession,
                    json_entry = entry
                )
            else:
                print("Wrong db type specified in '-db' option")
                raise SystemExit

            db.session.add(row)
            db.session.commit()
        db.session.close()

# TODO convert main into a moduole that can be imported by MASHix.py?
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
                         default="90.00", help='minimum identity to be '
                                               'reported '
                                           'to db')
    options.add_argument('-cov', '--coverage', dest='coverage',
                         default="80.00", help='minimum coverage do be '
                                               'reported to db')

    args = parser.parse_args()

    input_file = args.inputfile
    db_type = args.output_psql_db
    perc_id = float(args.identity)
    perc_cov = float(args.coverage)

    # Create DbInsertion instance with the provided input files
    db_handle = DbInsertion(input_file)

    print(input_file)

    list_of_filters = [
        ["coverage", ">=", perc_cov],
        ["identity", ">=", perc_id]
    ]

    db_handle.get_storage(list_of_filters, db_type)




    # Function to read the input and save a sequence, and a list of all [
    # resistances found with their id and cov (json like) as shown below.

    # TODO need to provide db type, id and cov to the filtering options
    # TODO needs main parser to provide this options

    # Class to use initial class to output abricate results to db
    print("saving results to db {}".format(db_type))
    #input_file.get_storage()

if __name__ == "__main__":
    main()