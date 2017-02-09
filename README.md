# MASHix.py

This script runs MASH in plasmid databases making a parwise diagonal matrix for each pairwise comparison between libraries.

Note: each header in fasta is considered a reference.

---

###Dependencies:

* python2.7 and packages commonly distributed along with it.

* **tqdm** - If you have not installed it yet, just run this command in terminal: _pip install tqdm_ (you may need sudo permissions or specify _--user_ option to _pip install_ in order to install it locally).

* **numpy** - If you have not installed it yet, just run this command in terminal: _pip install numpy_ (you may need sudo permissions or specify _--user_ option to _pip install_ in order to install it locally).

* **Mash** - You can download mash version 1.1.1 directly here: [linux](https://github.com/marbl/Mash/releases/download/v1.1.1/mash-Linux64-v1.1.1.tar.gz) and [OSX](https://github.com/marbl/Mash/releases/download/v1.1.1/mash-OSX64-v1.1.1.tar.gz). Other releases were not tested but may be downloaded in Mash git [releases page](https://github.com/marbl/Mash/releases).

---

###Options:

**'-i'**,**'--input_references'** - 'Provide the input fasta files to parse. This will inputs will be joined in a master fasta.'

**'-o'**,**'--output'** - 'Provide an output tag'

**'-t'**, **'--threads'** - 'Provide the number of threads to be used'

**'-k'**,**'--kmers'** - 'Provide the number of k-mers to be provided to mash sketch. Default: 21'

**'-no_rm'**, **'--no-remove'** - 'Specify if you do not want to remove the output concatenated fasta.'

**'-hist'**, **'--histograms'** - 'Checks the distribution of distances values ploting histograms'


---

###Output

* Outputs a diagonal matrix (_.csv_ file) with all pairwise distances between all genomes in input.

* Outputs two plots in two _.html_ files, one plot for the number of genomes with a given mash distances (average and meadian) and another plot the number of genomes with a given significant pairwise differences.
