#!/usr/bin/env python3

import argparse
from db_manager.db_app import db, models

def results2psql(accession, dict_with_resistances):
    '''

    :param accession:
    :param dict_with_resistances:
    :return:
    '''

    '''
    dict_with_resistances = [{"gene": gene_name,
                               "coverage": cov_value,
                               "identity": «id_value,
                               }, ... ]
    '''

    row = models.Card(
        plasmid_id = accession,
        json_entry = dict_with_resistances
    )
    db.session.add(row)
    db.session.commit()

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
                         default="0.9", help='minimum identity to be reported '
                                           'to db')
    options.add_argument('-cov', '--coverage', dest='coverage',
                         default="0.8", help='minimum coverage do be reported to db')

    # Function to read the input and save a sequence, and a list of all [
    # resistances found with their id and cov (json like) as shown below.

    # ....

    # Function that dumps the dictionary to db which can be done while
    # parsing stuff from abricate output.

    results2psql(accession, dict_with_resistances)


    # Then in the end don't forget to

    db.session.close()
