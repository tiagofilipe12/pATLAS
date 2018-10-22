#!/usr/bin/env python3

# Last update: 14/06/2018
# Author: T.F. Jesus
# This script aids MASHix.py getting family names for each genera of bacteria

import json
import argparse


def fetch_taxid(taxa_list, names_file, weirdos):
    """
    Function to get taxids levels from taxa file list of species. It queries
    species name and fetches the corresponding taxids

    Parameters
    ----------
    taxa_list: list
        The list of species to get taxids
    names_file
        The file input with names from ncbi taxonomy

    Returns
    -------
    taxid_dic: dict
        The dictionary with the correspondence of genera and taxids

    """

    conflicting_instances = []

    if weirdos:
        conflicting_instances.extend([
            "bug",
            "insect",
            "angiosperm",
            "fungus",
            "cnidarian",
            "mudpuppy",
            "mantid",
            "mussel"
        ])

    print("names_file: ", names_file)

    name = open(names_file, "r", encoding="utf-8")
    # parses names.dmp file and outputs a list of taxid
    taxid_dic = {}

    for line in name:

        field_delimiter = line.split("|")
        if field_delimiter[1].strip() in taxa_list and field_delimiter[3]\
                .strip() == "scientific name":

            taxid = field_delimiter[0].strip()
            debugging_field = field_delimiter[2].strip()

            if any(x in debugging_field for x in conflicting_instances):
                # this will avoid that a wrong taxid gets into the taxid_dic
                print("skipping weird entry: " + debugging_field)
            else:
                # everything else that is a bacteria will get into taxid_dic
                # genus:taxid
                taxid_dic[field_delimiter[1].strip()] = taxid

    print("taxid_list: " + str(len(taxid_dic)))
    name.close()
    return taxid_dic


def family_taxid(taxid_dic, nodes_file):
    """
    Function to get upper level taxids (genera, family and order)

    Parameters
    ----------
    taxid_dic: dict
        The dictionary with the correspondence of genera and taxids
    nodes_file
        The nodes.dmp file from NCBI taxonomy

    Returns
    -------
    parent_taxid_dic: dict
        A dictionary of the correspondence between the taxonomic name and their
        corresponding taxids

    """

    nodes = open(nodes_file, "r")
    parent_taxid_dic = {}

    for line in nodes:
        field_delimiter = line.split("|")

        # This was previously used to search only in bacteria and fungi but
        # slime molds were giving problems with this filter.
        # if field_delimiter[4].strip() == "0" or field_delimiter[
        #     4].strip() == "4":

        if field_delimiter[0].strip() in taxid_dic.values():
            parent_taxid = field_delimiter[1].strip()
            parent_taxid_dic[field_delimiter[0].strip()] = parent_taxid

    nodes.close()
    print("parent_taxid_list: " + str(len(parent_taxid_dic)))
    return parent_taxid_dic


# function to fetch taxids given a list of genera
def fetch_taxid_by_id(parent_taxid_dic, names_file):
    name = open(names_file, "r")
    # parses names.dmp file and outputs a list of taxid
    taxa_name_dic = {}
    for line in name:
        field_delimiter = line.split("|")
        if field_delimiter[0].strip() in parent_taxid_dic.values() and \
                        field_delimiter[3].strip() == "scientific name":
            taxa_name = field_delimiter[1].strip()
            taxa_name_dic[field_delimiter[0].strip()] = taxa_name

    print("taxid_list: " + str(len(taxa_name_dic)))
    name.close()
    return taxa_name_dic


def build_final_dic(taxid_dic, parent_taxid_dic, family_taxid_dic, order_dic,
                    order_taxid_dic, species_list, weirdos):
    """
    The function that builds the final dict that will be dumped to the database
    and creates the taxa_tree.json file that will be available through the /taxa
    view.

    Parameters
    ----------
    taxid_dic: dict
        The dictionary with the correspondence of genera and taxids
    parent_taxid_dic: dict
        The dictionary with the correspondence of families taxids and genera
        taxids
    family_taxid_dic: dict
        The dictionary with the correspondence of families and taxids
    order_dic: dict
        The dictionary with the correspondence of order taxids and families
        taxids
    order_taxid_dic: dict
        the dictionary with the correspondence of orders and taxids
    species_list: list
        The list of all the species available in refseq headers stripped.

    Returns
    -------
    super_dic: dict
        The dictionary with all the taxonomic relationships for each species.
        It contains a structure like this: species: [genus, family, order]

    """

    # a list of all species that appear in plasmids refseq that are not truly
    # species

    forbidden_species = []

    fix_short_names = {}

    if weirdos:
        forbidden_species.extend([
            "orf",
            "unknown",
            "Bacillaceae",
            "Comamonadaceae",
            "Enterobacteriaceae",
            "Opitutaceae",
            "Rhodobacteraceae",
            "Uncultured",
            "uncultured",
            "Peanut",
            "Pigeon",
            "Wheat",
            "Beet",
            "Blood",
            "Onion",
            "Tomato",
            "Zea",
            "Endosymbiont",
            "Bacterium",
            "Endophytic",
            "Gammaproteobacteria",
            "Polymorphum",  # genera but with parsing issues in ncbi tax
            "Tenericutes",
            "Cryphonectria",
            "Nostocales",   # genera but with parsing issues in ncbi tax
            "Sedimenticola",    # genera but with parsing issues in ncbi tax
            "Thiolapillus", # genera but with parsing issues in ncbi tax
            "Xanthomonadales"
        ])

        # custom entries that needed fixing
        fix_short_names["S pyogenes"] = "Streptococcus pyogenes"
        fix_short_names["B bronchiseptica"] = "Bordetella bronchiseptica"

    super_dic = {}

    # then cycle each species in list
    for species in species_list:

        # some instances may have quotes... so...
        species = species.replace("'", "")

        # get the genera
        k = species.split()[0].strip()

        # fixes species name according to dict, if weirdos option is True and
        # the weird species name is known in fix_short_names dictionary
        if species in fix_short_names:
            species = fix_short_names[species]

        # check if k contains a forbidden species
        if k not in forbidden_species:

            # checks if species contains a two-term naming system and if not
            # adds a sp. to the genera.
            try:
                if species.split()[1]:
                    pass
            except IndexError:
                species += " sp."

            # constructs the dictionary if genera is in taxid dic
            if k in taxid_dic:
                if parent_taxid_dic[taxid_dic[k]]:
                    family = family_taxid_dic[parent_taxid_dic[taxid_dic[k]]]
                    ## get order!!
                    if order_dic[parent_taxid_dic[taxid_dic[k]]]:
                        order = order_taxid_dic[order_dic[parent_taxid_dic[
                            taxid_dic[k]]]]
                        super_dict_values = [k, family, order]
                    else:
                        super_dict_values = [k, family, "unknown"]
                else:
                    super_dict_values = [k, "unknown", "unknown"]
            else:
                super_dict_values = [k, "unknown", "unknown"]
                # check if the genera match the genera being parsed.
            super_dic[species] = super_dict_values

        else:
            print("weird species: ", species)

    return super_dic


def executor(names_file, nodes_file, species_list, weirdos=True):
    """
    The actual function that generates the dict to be dumped to file or database
    depending if this function is being called from within this script or from
    MASHix.py, respectively.

    Parameters
    ----------
    names_file
        the file names.dmp from ncbi taxonomy
    nodes_file
        the file nodes.dmp from ncbi taxonomy
    species_list: list
        the list of species
    weirdos: bool
        sets if we want to remove weird entries or not.

    Returns
    -------
    super_dic: dict
        Returns a dictionary with the entire taxonomic tree of each species
        entry (for genera, family and order)

    """

    # obtains a list of all species in input file and genera!!
    print("Gathering species information...")
    genera_list = [x.split(" ")[0] for x in species_list]

    # executes first function for genera
    print("Gathering genera information...")
    taxid_dic = fetch_taxid(genera_list, names_file, weirdos)

    # executes second function for genera
    parent_taxid_dic = family_taxid(taxid_dic, nodes_file)

    # executes third function for families, obtains family names and its ids
    print("Gathering family information...")
    family_taxid_dic = fetch_taxid_by_id(parent_taxid_dic, names_file)

    # exectures second function for families

    order_dic = family_taxid(parent_taxid_dic, nodes_file)

    # executes third function for orders, obtains order names
    print("Gathering order information...")
    order_taxid_dic = fetch_taxid_by_id(order_dic, names_file)

    print("creating dictionary with tree of taxa relationships...")

    # Species is missing from this final output!
    super_dic = build_final_dic(taxid_dic, parent_taxid_dic, family_taxid_dic,
                                order_dic, order_taxid_dic, species_list,
                                weirdos)

    # write to file
    print("creating file and writing to it...")
    output_file = open("taxa_tree.json", "w")
    output_file.write(json.dumps(super_dic))

    return super_dic


# main function to allow the execution outside the MASHix.py file
def main():
    """
    This main function is used when the script is executed in standalone method
    without importing the executor function.
    """

    parser = argparse.ArgumentParser(description="Compares all entries in a "
                                                 "fasta file using MASH")

    main_options = parser.add_argument_group("Main options")

    main_options.add_argument("-i", "--input_list", dest="input_list",
                              required=True, help="provide a file with a list"
                                                  "of species. Each species"
                                                  "should be in each line.")

    main_options.add_argument("-non", "--nodes_ncbi", dest="nodes_file",
                               required=True, help="specify the path to the "
                                                   "file containing nodes.dmp "
                                                   "from NCBI" )
    main_options.add_argument("-nan", "--names_ncbi", dest="names_file",
                               required=True, help="specify the path to the "
                                                   "file containing names.dmp "
                                                   "from NCBI")
    main_options.add_argument("-w", "--weirdos", dest="weirdos",
                              action='store_true', help="This option allows "
                                                        "the user"
                                                  "to add a checks for weird"
                                                  "entries. This is mainly used"
                                                  "to parse the plasmids "
                                                  "refseq, so if you do not "
                                                  "want this to be used, use "
                                                  "this option")

    args = parser.parse_args()

    names_file = args.names_file
    nodes_file = args.nodes_file

    file_fetch = open(args.input_list)

    list_fetch = [line.strip() for line in file_fetch]

    executor(names_file, nodes_file, list_fetch, args.weirdos)


if __name__ == "__main__":
    main()
