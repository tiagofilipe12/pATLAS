#!/usr/bin/env python3

import argparse
from db_manager.db_app import db, models

class Db_insertion(ParentClass):
    '''
    class with DB specific methods
    This class expects to inherit a storage dictionary from its parent class
    in which the keys are accession numbers and the values are a list of all
    the hits from abricate for a given accession.
    '''

    def __init__(self, var):
        # Here we'll call the __init__ of the base class Parent.
        super().__init__(var)
        print("Base class parent ")

    def get_storage(self):
        '''
        Notice that the self.storage attribute is available, even
        though it was not defined in the DB_INSERTATRON class.
        '''

        for key, vals in self.storage.items():
            row = models.Card(
                plasmid_id = key,
                json_entry = vals
            )
            db.session.add(row)
            db.session.commit()
        # close db in the end of get_storage
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

    # Function to read the input and save a sequence, and a list of all [
    # resistances found with their id and cov (json like) as shown below.

    # TODO need to provide db type, id and cov to the filtering options
    # TODO needs main parser to provide this options

    # Class to use initial class to output abricate results to db
    print("saving results to db {}".format(db_type))
    input_file.get_storage()
