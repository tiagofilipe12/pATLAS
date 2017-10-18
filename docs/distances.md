# Relationships and distances estimations

Plasmid Atlas uses [MASH](https://github.com/marbl/Mash) to estimate the 
distances between all plasmids available in [NCBI refseq database](). 
However, only sequences (plasmids) that show a distance inferior to 0.1 
(highly correlated with Average nucleotide identity (ANI) > 0.9) and with a 
significant p-value are shown in the pATLAS visualization, because there is 
no point in showing singletons for browsing purposes.

> Note: However, singletons will be visible whenever a given sequence is 
important for the users result and is not present in the pATLAS visualization
 or database. In these cases, a simple node will be added with a popup that 
 presents the user the ability to link with the direct URL for NCBI genbank 
 entry.
 
Therefore each **node** (circle) in pATLAS represents a plasmid and its size is 
in log scale with the number of base pairs each plasmid has (the larger the 
circle the larger the plasmid is). On the other hand, **links** connect plasmids
 with approximately 90% identity. That is the reason why there are some nodes
  that have so many links (most likely they are well studied groups and have 
  a lot of genomic resources available or this clusters present a remarkable
   variety of modular plasmids described by authors to the NCBI database).