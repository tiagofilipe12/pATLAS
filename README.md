# MASHix.py

This script runs MASH in plasmid databases making a parwise diagonal matrix for each pairwise comparison between libraries

Note: each header in fasta is considered a reference

###Options:

**'-i'**,**'--input_references'**, dest='inputfile', nargs='+', required=True, help='Provide the input fasta files to parse. This will inputs will be joined in a master fasta.'

**'-o'**,**'--output'**, dest='output_tag', required=True, help='Provide an output tag'

**'-t'**, **'--threads'**, dest='threads', help='Provide the number of threads to be used'

**'-k'**,**'--kmers'**, dest='kmer_size', help='Provide the number of k-mers to be provided to mash sketch. Default: 21'

**'-no_rm'**, **'--no-remove'**, dest='no_remove', action='store_true', help='Specify if you do not want to remove the output concatenated fasta.'

---

####Output

* Outputs a diagonal matrix with all pairwise distances between all genomes in input.
