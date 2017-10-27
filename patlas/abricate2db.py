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

    def get_storage(self, input_file, list_of_filters):
        print(self)

        abr = Abricate(self)

        # self.get_items(input_file, list_of_filters)
        for entry in abr.iter_filter(list_of_filters, fields=[
            "reference",
            "coverage",
            "identity",
            "database",
            "gene",
            "accession",
            "seq_range"]):
            print(entry)
            print(entry["reference"])
            reference_accession = "_".join(entry["reference"].split("_")[0:3])
            del entry["reference"]
            print(entry)
            print(reference_accession)
            break

        '''
        Notice that the self.storage attribute is available, even
        though it was not defined in the DB_INSERTATRON class.
        '''

    # def parse_storage(self, dict):
    #     print(self)
    #
    #     for key, vals in self.dict.items():
    #         print(key,vals)
        #     row = models.Card(
        #         plasmid_id = key,
        #         json_entry = vals
        #     )
        #     db.session.add(row)
        #     db.session.commit()
        # # close db in the end of get_storage
        # db.session.close()

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
                              required=True, help='Provide the db to output '
                                                  'in psql models.')
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

    print(input_file)

    list_of_filters = [
        ["coverage", ">=", perc_cov],
        ["identity", ">=", perc_id]
    ]

    DbInsertion.get_storage(input_file, input_file, list_of_filters)




    # Function to read the input and save a sequence, and a list of all [
    # resistances found with their id and cov (json like) as shown below.

    # TODO need to provide db type, id and cov to the filtering options
    # TODO needs main parser to provide this options

    # Class to use initial class to output abricate results to db
    print("saving results to db {}".format(db_type))
    #input_file.get_storage()

if __name__ == "__main__":
    main()