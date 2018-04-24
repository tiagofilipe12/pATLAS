# Relationships and distances estimations

pATLAS uses [MASH](https://github.com/marbl/Mash) to estimate the 
distances between all plasmids available in [NCBI refseq database](ftp://ftp.ncbi.nlm.nih.gov/refseq/release/plasmid/).
However, only plasmid sequences that show a mash distance inferior to 0.1 
(highly correlated with Average nucleotide identity (ANI) greater than 0.9)
and are significantly associated (mash p-value<0.05) are linked in the plasmid network. All other plasmids are represented as an
isolated node (singleton).
 
Each **node** in pATLAS represents a plasmid and its size relates to the
number of base pairs of each plasmid in logarithmic scale . The **links** 
connect plasmids with approximately 90% average nucleotide identity. 
