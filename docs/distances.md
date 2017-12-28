# Relationships and distances estimations

Plasmid Atlas uses [MASH](https://github.com/marbl/Mash) to estimate the 
distances between all plasmids available in [NCBI refseq database](ftp://ftp.ncbi.nlm.nih.gov/refseq/release/plasmid/).
However, only sequences (plasmids) that show a distance inferior to 0.1 
(highly correlated with Average nucleotide identity (ANI) > 0.9) and with a 
significant p-value are plotted with a link in pATLAS. All other plasmids
are represented as an isolated node (singletons).
 
Therefore each **node** (circle) in pATLAS represents a plasmid and its size is 
in log scale with the number of base pairs each plasmid has (the larger the 
circle the larger the plasmid is). On the other hand, **links** connect plasmids
 with approximately 90% average nucleotide identity. That is the reason why there are some nodes
  that have so many links (most likely they are well studied groups and have 
  a lot of genomic resources available or even this clusters present a remarkable
   variety of modular plasmids described by authors to the NCBI database).