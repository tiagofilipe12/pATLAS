#!/usr/bin/env python3

import argparse
from db_manager.db_app import db, models

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


    # Function that dumps the dictionary ti db

    #{"name": "Burkholderia_caribensis", "significantLinks": [
    #    {"distance": "0.0618432", "size": 2011268,
    #     "accession": "NZ_CP013104_1"}], "plasmid_name": null,
    # "length": 2555069}



    # doc = {"name": spp_name,
    #        "length": length,
    #        "plasmid_name": plasmid_name,
    #        "significantLinks": [rec.get_dict() for rec in
    #                             temporary_list]
    #        }
    #
    # row = models.Plasmid(
    #     plasmid_id=accession
    #     json_entry=dict_with_resistances
    # )
