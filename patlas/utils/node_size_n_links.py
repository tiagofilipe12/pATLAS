#!/usr/bin/env python3

import sys
import json

def main():
    '''
    This script just have main function, which basically transforms a json
    file into a csv file for spreadsheet exploration

    '''
    #open output file
    ofile  = open("output_size_n_links.csv", "w")

    #read input
    input_json = sys.argv[1]

    reader = open(input_json)

    reader_dict = json.load(reader)

    # write header
    ofile.write("parentId;parentSize;childId;childSize;distance;sizeDiff\n")

    for element in reader_dict["links"]:
        ## get parent node related params
        parent_id = element["parentId"]
        parent_node = [x for x in reader_dict["nodes"] if x["id"] == parent_id]
        parent_node_length = float(parent_node[0]["length"])
        # and now child node related params
        child_id = element["childId"]
        child_node = [x for x in reader_dict["nodes"] if x["id"] == child_id]
        child_node_length = float(child_node[0]["length"])
        distance = element["distance"]
        size_diff = abs(parent_node_length - child_node_length)
        # write a line in output file
        ofile.write("{};{},{};{};{};{}\n".format(parent_id, parent_node_length,
                                              child_id, child_node_length,
                                              distance, size_diff))
    # closes input and output files
    reader.close()
    ofile.close()

if __name__ == "__main__":
    main()
