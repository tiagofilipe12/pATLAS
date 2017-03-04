#!/usr/bin/env python

## Last update: 3/3/2017
## Author: T.F. Jesus
## This script aids MASHix.py getting family names for each genera of bacteria

import os
import sys
import json

## parses input genera list file
def get_genera(genera_file):
	genera = open(genera_file, "r")
	list_of_genera = []
	##parse genera_list input file
	for line in genera:
		genus = line.strip("\n")
		list_of_genera.append(genus)
	genera.close()
	list_of_genera.remove("")
	print "genera query size: "+ str(len(list_of_genera))
	print
	return list_of_genera

##1
## function to fetch taxids given a list of genera
def fetch_taxid(taxa_list, names_file):
	name = open(names_file, "r")
	## parses names.dmp file and outputs a list of taxid
	#taxid_list = []
	taxid_dic = {}
	for line in name:
		field_delimiter = line.split("|")
		if field_delimiter[1].strip() in taxa_list and field_delimiter[3].strip() == "scientific name":
			taxid = field_delimiter[0].strip()
			#taxid_list.append(taxid)
			taxid_dic[field_delimiter[1].strip()] = taxid #genus:taxid

	print "taxid_list: "+ str(len(taxid_dic))
	print
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
		if field_delimiter[4].strip() == "0" or field_delimiter[4].strip() == "4":
			if field_delimiter[0].strip() in taxid_dic.values():
				parent_taxid = field_delimiter[1].strip()
				parent_taxid_dic[field_delimiter[0].strip()] = parent_taxid

	nodes.close()
	print "parent_taxid_list: " + str(len(parent_taxid_dic))
	print
	return parent_taxid_dic    

##3
## function to fetch taxids given a list of genera
def fetch_taxid_by_id(parent_taxid_dic, names_file):
	name = open(names_file, "r")
	## parses names.dmp file and outputs a list of taxid
	taxa_name_dic = {}
	for line in name:
		field_delimiter = line.split("|")
		if field_delimiter[0].strip() in parent_taxid_dic.values() and field_delimiter[3].strip() == "scientific name":
			taxa_name = field_delimiter[1].strip()
			taxa_name_dic[field_delimiter[0].strip()] = taxa_name


	print "taxid_list: "+ str(len(taxa_name_dic))
	print
	name.close()
	return taxa_name_dic

def build_final_dic(taxid_dic, parent_taxid_dic, family_taxid_dic, order_dic, order_taxid_dic):
	super_dic = {}
	for k in taxid_dic:
		## get family!!
		if parent_taxid_dic[taxid_dic[k]]:
			family = family_taxid_dic[parent_taxid_dic[taxid_dic[k]]]
		## get order!!
			if order_dic[parent_taxid_dic[taxid_dic[k]]]:			
				order = order_taxid_dic[order_dic[parent_taxid_dic[taxid_dic[k]]]]
				super_dic[k] = (family, order)
			else:
				super_dic[k] = (family, "")
		else:
			super_dic[k] = ("", "")
	return super_dic

def main():
	try:
		names_file = sys.argv[1]
		nodes_file = sys.argv[2]
		genera_file = sys.argv[3]
	except:
		print "Usage: family_fetch.py <names.dmp> <nodes.dmp> <genera.lst>"
		print "Outputs bacteria taxa tree for all genera in input"
		print
		raise SystemExit

	## obtains a list of all genera in input file
	genera_list = get_genera(genera_file)

	## executes first function for genera
	print "Gathering genera information..."
	taxid_dic = fetch_taxid(genera_list, names_file)

	## executes second function for genera
	parent_taxid_dic = family_taxid(taxid_dic, nodes_file)

	## executes third function for families, obtains family names and its ids
	print "Gathering family information..."
	family_taxid_dic = fetch_taxid_by_id(parent_taxid_dic, names_file)

	## exectures second function for families

	order_dic = family_taxid(parent_taxid_dic, nodes_file)

	## executes third function for orders, obtains order names
	print "Gathering order information..."
	order_taxid_dic = fetch_taxid_by_id(order_dic, names_file)

	print "creating dictionary with tree of taxa relationships..."

	super_dic = build_final_dic(taxid_dic, parent_taxid_dic, family_taxid_dic, order_dic, order_taxid_dic)
	output_file = open("taxa_tree.json", "w")
	output_file.write(json.dumps(super_dic))

if __name__ == "__main__":
    main()