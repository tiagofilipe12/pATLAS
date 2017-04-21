# pATLAS

### pATLAS.html

To run _pATLAS.html_ a json file containing a dictionary of nodes and distances between pairs of nodes is required. MASHix.py can be used for that purpose. However, note that json file must be copied to MASHix main directory where _pATLAS.html_ is stored so it can be properly/fully executed.

#### Example usage: (outdated)

Comming soon...

#### Keyboard shortcuts

* "shift+l" - Opens length filters 
* "shift+t" - Opens taxa filters
* "shift+i" - Opens Reads filters
* "shift+p" - pause/play rendering animation
* "shift+r" - Removes all applied filters

---

1. **load pATLAS.html**

   This html loads the JSON file retrieved by [MASHix.py](https://github.com/tiagofilipe12/MASHix) and runs vivagraph.js in order to plot the connections (using MASH distances) between closely related  nodes (genomes/sequences). **VERY IMPORTANT: in order to run _pATLAS.html_ make sure you copy .json file to the main folder of MASHix, where _pATLAS.html_ is stored, otherwise it won't do anything**.

   Open _pATLAS.html_ with **firefox** or follow [these instructions](http://www.chrome-allow-file-access-from-file.com/) to allow **google chrome** to access filesystem.

   Note: Large datasets, which may have huge number of links between nodes (genomes/sequences) may suffer from slow loading times. So, in order to avoid this, before loading the pATLAS.html, first check the two graphical outputs retrieved by [MASHix.py](https://github.com/tiagofilipe12/MASHix).

