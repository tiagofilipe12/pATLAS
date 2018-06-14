#!/usr/bin/env python3

## Last update: 12/06/2018
## Author: T.F. Jesus
## This script aids MASHix.py getting family names for each genera of bacteria

import json

## function to fetch taxids given a list of genera
def fetch_taxid(taxa_list, names_file):

    conflicting_instances = [
        "bug",
        "insect",
        "angiosperm",
        "fungus",
        "cnidarian",
        "mudpuppy",
        "mantid",
        "mussel"
    ]

    name = open(names_file, "r")
    ## parses names.dmp file and outputs a list of taxid
    taxid_dic = {}

    for line in name:
        field_delimiter = line.split("|")
        if field_delimiter[1].strip() in taxa_list and field_delimiter[3]\
                .strip() == "scientific name":

            taxid = field_delimiter[0].strip()
            debugging_field = field_delimiter[2].strip()

            if any(x in debugging_field for x in conflicting_instances):
                #this will avoid that a wrong taxid gets into the taxid_dic
                print("skipping weird entry: " + debugging_field)
            else:
                # everything else that is a bacteria will get into taxid_dic
                # genus:taxid
                taxid_dic[field_delimiter[1].strip()] = taxid

    print("taxid_list: " + str(len(taxid_dic)))
    name.close()
    return taxid_dic

## function to gather parentid and if parent id is family stops
def family_taxid(taxid_dic, nodes_file):
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

##3
## function to fetch taxids given a list of genera
def fetch_taxid_by_id(parent_taxid_dic, names_file):
    name = open(names_file, "r")
    ## parses names.dmp file and outputs a list of taxid
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
                    order_taxid_dic, species_list):
    """
    The function that builds the final dict that will be dumped to the database
    and creates the taxa_tree.json file that will be available through the /taxa
    view.

    Parameters
    ----------
    taxid_dic
    parent_taxid_dic
    family_taxid_dic
    order_dic
    order_taxid_dic
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
    forbidden_species = [
        "orf",
        "Enterobacter",
        "unknown",
        "Uncultured",
        "Peanut",
        "Pigeon",
        "Wheat",
        "Beet",
        "Blood",
        "Onion",
        "Tomato",
        "Zea"
    ]

    super_dic = {}
    # then cycle each species in list
    for species in species_list:

        k = species.split()[0]  # cycle genera

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

    return super_dic

def executor(names_file, nodes_file, species_list):

    ## obtains a list of all species in input file and genera!!
    print("Gathering species information...")
    genera_list = [x.split(" ")[0] for x in species_list]

    ## executes first function for genera
    print("Gathering genera information...")
    taxid_dic = fetch_taxid(genera_list, names_file)

    ## executes second function for genera
    parent_taxid_dic = family_taxid(taxid_dic, nodes_file)

    ## executes third function for families, obtains family names and its ids
    print("Gathering family information...")
    family_taxid_dic = fetch_taxid_by_id(parent_taxid_dic, names_file)

    ## exectures second function for families

    order_dic = family_taxid(parent_taxid_dic, nodes_file)

    ## executes third function for orders, obtains order names
    print("Gathering order information...")
    order_taxid_dic = fetch_taxid_by_id(order_dic, names_file)

    print("creating dictionary with tree of taxa relationships...")

    ## Species is missing from this final output!
    super_dic = build_final_dic(taxid_dic, parent_taxid_dic, family_taxid_dic,
                                order_dic, order_taxid_dic, species_list)

    # write to file
    print("creating file and writing to it...")
    output_file = open("taxa_tree.json", "w")
    output_file.write(json.dumps(super_dic))

    return super_dic


#function execution for test purposes
def main():

    file_fetch = open("/home/tiago/Documents/pATLAS/full_plasmid_db_v1_4_1_11_06_2018/species_list_v1_4_1_11_06_2018.lst")

    list_fetch = [line.strip() for line in file_fetch]

    executor(
        "/home/tiago/Documents/pATLAS/full_plasmid_db_v1_4_1_11_06_2018/names.dmp",
        "/home/tiago/Documents/pATLAS/full_plasmid_db_v1_4_1_11_06_2018/nodes.dmp",
        list_fetch
    )


if __name__ == "__main__":
    main()