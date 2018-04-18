<p align="center">
  <a href=#>
    <img height="200" width="400" title="pATLAS" alt="pATLAS logo"
    src="https://raw.githubusercontent.com/tiagofilipe12/pATLAS/master/docs/gitbook/images/pATLAS_black.png"/>
  </a>
  <br/>
</p>

# Introduction

Welcome to [Plasmid Atlas](http://www.patlas.site) (pATLAS).

## Briefly

pATLAS is a web-base tool that empowers researchers to easily and rapidly access
information related with plasmids present in `NCBI's refseq` database.
In pATLAS each node (or circle) represents
a plasmid and each link between two plasmids means that those two plasmids
share over 90% average nucleotide identity.

With this tool we have two main goals:

1. Increase the accessibility of plasmid relevant metadata to users as
well as facilitate the access to that metadata.
2. Improve the ease of interpreting results from High Throughput Sequencing
   (HTS) for plasmid detection.

![](gitbook/images/patlas.gif)


## Main features

* Browse by taxa
* Browse by resistance genes
* Browse by plasmid families
* Import JSON files from mapping results, mash screen results and even
import a new sequence as a new node (e.g. an assembled plasmid or any
other Fasta representing a putative plasmid).
* Plot data related with custom selections.
* Download sequences for selected plasmids
* Display metadata for one plasmid or multiple selected plasmids