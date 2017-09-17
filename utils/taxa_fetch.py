#!/usr/bin/env python3

## Last update: 17/9/2017
## Author: T.F. Jesus
## This script aids MASHix.py getting family names for each genera of bacteria

# import os
import sys
import json


## parses input genera list file
def get_species(species_file):
    species_file = open(species_file, "r")
    list_of_genera = []
    list_of_species = []
    ##parse genera_list input file
    for line in species_file:
        genus = line.strip("\n").split(" ")[0]
        species = "_".join(line.strip("\n").split(" "))
        if "Candidatus" in species:
            print(species)
            species = "_".join(species.split("_")[1:])
            print(species)
            genus = line.strip("\n").split(" ")[1]
        list_of_genera.append(genus)
        list_of_species.append(species)
    species_file.close()
    # list_of_genera.remove("")
    print("species query size: " + str(len(list_of_species)))
    return list_of_species, list_of_genera

##1
## function to fetch taxids given a list of genera
def fetch_taxid(taxa_list, names_file):
    name = open(names_file, "r")
    ## parses names.dmp file and outputs a list of taxid
    # taxid_list = []
    taxid_dic = {}
    for line in name:
        field_delimiter = line.split("|")
        if field_delimiter[1].strip() in taxa_list and field_delimiter[
            3].strip() == "scientific name":
            taxid = field_delimiter[0].strip()
            # taxid_list.append(taxid)
            taxid_dic[field_delimiter[1].strip()] = taxid  # genus:taxid

    print("taxid_list: " + str(len(taxid_dic)))
    name.close()
    return taxid_dic


##2
## function to gather parentid and if parent id is family stops
def family_taxid(taxid_dic, nodes_file):
    nodes = open(nodes_file, "r")
    parent_taxid_dic = {}
    for line in nodes:
        field_delimiter = line.split("|")
        ## search only in bacteria, invertebrates
        ## searches if values are ids
        if field_delimiter[4].strip() == "0" or field_delimiter[
            4].strip() == "4":
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
    super_dic = {}
    # then cycle each species in list
    for x, species in enumerate(species_list):
        print(species)
        #print(x) # used to count the number of species already parsed
        k = species.split("_")[0]  # cycle genera
        # for k in taxid_dic:
        ## get family!!
        if k in taxid_dic.keys():
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


def main():
    try:
        names_file = sys.argv[1]
        nodes_file = sys.argv[2]
        genera_file = sys.argv[3]
    except:
        print("Usage: taxa_fetch.py <names.dmp> <nodes.dmp> <genera.lst>")
        print("Outputs bacteria taxa tree for all genera in input\n")
        raise SystemExit

    ## obtains a list of all species in input file and genera!!
    print("Gathering species information...")
    species_list, genera_list = get_species(genera_file)

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


if __name__ == "__main__":
    main()
