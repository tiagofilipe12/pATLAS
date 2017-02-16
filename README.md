# MASHix

This script runs MASH, making a parwise comparisons between sequences in input (fasta) file(s).

Note: each header in fasta is considered a reference.

---

###Dependencies:

* python2.7 and packages commonly distributed along with it.

* **tqdm** - If you have not installed it yet, just run this command in terminal: _pip install tqdm_ (you may need sudo permissions or specify _--user_ option to _pip install_ in order to install it locally).

* **numpy** - If you have not installed it yet, just run this command in terminal: _pip install numpy (you may need sudo permissions or specify _--user_ option to _pip install_ in order to install it locally).

* **Mash** - You can download mash version 1.1.1 directly here: [linux](https://github.com/marbl/Mash/releases/download/v1.1.1/mash-Linux64-v1.1.1.tar.gz) and [OSX](https://github.com/marbl/Mash/releases/download/v1.1.1/mash-OSX64-v1.1.1.tar.gz). Other releases were not tested but may be downloaded in Mash git [releases page](https://github.com/marbl/Mash/releases).

Note: This script exports a JSON file to be loaded with [VivaGraphJS](https://github.com/anvaka/VivaGraphJS) in order to plot distances between genomes (example file is provided in modules/dict_temp_2.json). Altough, there is no need to load additional modules since they are together with the _visualization.html_ in modules.

---
## How do I run this thing?

###MASHix.py

The first thing you have to do is run MASHix.py in order to calculate distances between all the genomes in a fasta, using [MASH](http://mash.readthedocs.io/en/latest/). MASHix.py does all the processing, thus you don't need to worry about fasta concatenation or header processing. Also, it runs all MASH commands required to obtain a pairwise matrix (though it do not exports one because it will not be human readable for large datasets).

####Options:

**'-i'**,**'--input_references'** - 'Provide the input fasta files to parse. This will inputs will be joined in a master fasta.'

**'-o'**,**'--output'** - 'Provide an output tag'

**'-t'**, **'--threads'** - 'Provide the number of threads to be used'

**'-k'**,**'--kmers'** - 'Provide the number of k-mers to be provided to mash sketch. Default: 21'

**'-no_rm'**, **'--no-remove'** - 'Specify if you do not want to remove the output concatenated fasta.'

---

###Outputs

Outputs all files to: full path to first input file --> string given to '-o' option --> results.

1. Outputs two plots in two .html files, one plot for the number of genomes with a given mash distances (average, meadian, maximum and minimum) and another plot the number of genomes with a given significant pairwise differences.

2. **visualization.html**

   This html loads the JSON file retrieved by MASHix.py and runs vivagraph.js in order to plot the connections (using MASH distances) between closely related  nodes (genomes/sequences).

   Open _visualization.html_ with **firefox** or follow the following instructions to allow google chrome to access filesystem: [http://www.chrome-allow-file-access-from-file.com/]. _visualization.html_ is currently saved along (in the same folder) with the .js scripts and .json file created with MASHix.py in order to be properly read.

   Note: Large datasets, which may have huge number of links between nodes (genomes/sequences) may suffer from slow loading times. So, in order to avoid this, before loading the visualization.html, first check the two graphical outputs retrieved by MASHix.py.
