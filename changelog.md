# Changelog

## Version 1.4.1

### Database update

* Updated database to the plasmid NCBI refseq from 21/5/18.
    * updated vivagraph related json files to generate nodes and links.
    * updated json files to generate the dropdowns.
    * updated the psql database.
    * added new aro_index.csv to repo so that `abricate2db.py` can use
    it.

* Blacklisted several oddities from the parser in `taxa_fetch.py`.

### Bug fixes

#### backend

* Several minor fixes to the `MASHix.py` script.
* Patched the recursive function `node_crawler` in `MASHix.py`, allowing
a higher number of recursive instances for this function.

#### frontend

* Patched renderer after searching for a plasmid.

### UX improvements

* Improved readability of union and intersection legend, as well as,
its modal.
* Fixed `popup_description`


## Version 1.4.0

### New features

* Adds redundancy removal option for mapping, mash screen and sequence
imports.

* Adds drag and drop of files to imports and projects menu.

* Adds project export/import

* Adds advanced filters

### Documentation

* Added docs for the new features.