#!/usr/bin/env python3

import sys
import json
import plotly
import plotly.graph_objs as go

def make_histogram(trace_list):
    '''
    Function to make an histogram from a list
    Parameters
    ----------
    trace_list: list
        A list with all entries to the histogram (entries should be float)

    '''
    sorted_list = sorted(trace_list, reverse=True)
    trace_lengths = go.Histogram(x=sorted_list,
                                 opacity=0.75,
                                 name="Histogram of the size ratio between "
                                      "linked nodes")
    layout = go.Layout(barmode="overlay",
                           xaxis=dict(
                               title="number of links"
                           ),
                           yaxis=dict(
                               title="ratio between nodes"
                           )
                       )
    fig = go.Figure(data=[trace_lengths], layout=layout)
    plotly.offline.plot(fig, filename="dist.html", auto_open=False)

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

    list_lengths = []
    dict_refactored_json = {"links": []}
    dict_refactored_json["nodes"] = reader_dict["nodes"]

    for element in reader_dict["links"]:
        ## get parent node related params
        parent_id = element["parentId"]
        parent_node = [x for x in reader_dict["nodes"] if x["id"] == parent_id]
        parent_node_length = float(parent_node[0]["length"])
        # and now child node related params
        child_id = element["childId"]
        child_node = [x for x in reader_dict["nodes"] if x["id"] == child_id]
        child_node_length = float(child_node[0]["length"])
        distance = element["distNSizes"]
        size_diff = abs(parent_node_length - child_node_length)
        size_ratio = float(min(parent_node_length, child_node_length)/
                           max(parent_node_length, child_node_length))
        list_lengths.append(size_ratio)
        # write a line in output file
        ofile.write(";".join([parent_id, parent_node_length, child_id,
                              child_node_length, distance, size_diff,
                              str(size_ratio)]) + "\n")
        ofile.write("{};{};{};{};{};{};{}\n".format(parent_id,
                                                    str(parent_node_length),
                                                    child_id, child_node_length,
                                                    distance, size_diff,
                                                    str(size_ratio)))
        dict_refactored_json["links"].append({"parentId": parent_id,
                                              "childId": child_id,
                                              "distNSizes": {
                                                  "distance": distance,
                                                  "sizeRatio": size_ratio
                                                }
                                              })

    # closes input and output files
    reader.close()
    ofile.close()

    # make an histogram of lengths
    make_histogram(list_lengths)

    #

    refactored_json = open("refactored_filtered.json", "w")
    refactored_json.write(json.dumps(dict_refactored_json))
    refactored_json.close()

if __name__ == "__main__":
    main()
