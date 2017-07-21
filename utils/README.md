# HELP ME

This file intends to provide the user with a help me regarding some of the additional scripts present in this folder.

## blastout2db.py

Description: This script allows blast outputs to be parsed to the database. Note however that it is limited to the classes present in [https://github.com/tiagofilipe12/MASHix/blob/master/db_manager/db_app/models.py](models.py).

### Options:

```
-i; --input - Provide the input blast output files in tabular format.

-c; --card - f - If the input query is card please use this option.
```

Note: other classes will be added as mutually exclusive with card in future implementations

### Blast Notes
this takes into account that the user used [https://github.com/tiagofilipe12/BITA](BITA) (A script that performs by default blastn or tblastn with two additional columns to the output tabular format). This is used for total percentage of effective alignment between the reference and the query and to easily access the accession number of the input. If for any reason, you require to add more aditional parameters take this in consideration.

## taxa_fetch.py

A script that parses ncbi taxonomy to a json file given an input genera.lst (list of genera)

Usage: taxa_fetch.py <names.dmp> <nodes.dmp> <genera.lst>

## hist_utils.py

An auxiliary script for [https://github.com/tiagofilipe12/MASHix/blob/master/MASHix.py](MASHix.py) that enables the construction of plots.
