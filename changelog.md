# Changelog

## Upcoming version (1.6.0)

### Database

### Front end

#### Database queries
- Search for accession numbers now accept accession without version 
(e.g NC_011413).

#### Import results
- Import from file and requests now have an option to submit and filter 
directly.
- Import from file now has option that allows the user to select the sample to
display.

#### Performance
- Performance of the page was significantly improved with the fix of issue #57.
- Welcome modal was temporarily hidden.
- Refactored `defaultZooming` function, now showing only the final zoom.

#### Other changes
- Added default behavior for close buttons in modals for imports.
- Added small information messages to loading.
- Shift key drag selections now accept multiple selected areas and drag of
multiple nodes.

#### Bug fixes
- Fixed minor issues after filtering datasets for link selections and for shift
selections.
- Fixed bug with when file is imported preventing selections of taxa,
resistance, plasmidfinder, virulence and so on.

## Version 1.5.2

### Database

* `MASHix.py` now has new filters to remove genes from plasmid database
* Updated database with the latest ncbi refseq release
(7/13/18, 5:27:00 AM)

## New features

* Now local installations of pATLAS can download data rather than making
a request to patlas.site, which will fail.

## Version 1.5.0

### Database

* Added new table to database in order to store temporary entries,
containing results sent from `POST` requests that can be displayed
using unique urls. This included:
    * Addition of front end capabilities to render results collected
    from the temporary database entries.
    * Addition of back end view that enables to handle the `POST`
    request and to make a `GET` from the pATLAS front end.

### Requests

* Now it is possible to make POST request to download metadata and
sequences. Also, it is possible to make POST requests to view results
from external tools.

### Database naming refactor

* Now database name should/can be provided to scripts that interact
with psql database. E.g. of scripts that require this are: MASHix.py,
db_create.py, run.py.

### Bug fixes

* fixed bug with assembly sample file import.
* fixed bug when heatmap is called after filtering from a file, where
the plasmid length data is missing for a plasmid from another file
 that is being compared with the current file in the heatmap.
* fixed bug when unknown accessions are provided to the remove
redundancy option.
* fixed a bug when download button is triggered, centering again the
graph.
* fixed a bug on macOS and windows were `window.open` function added
some type of "offset" to vivagraph canvas, removing window.open and
adding a new way to download the sequences.

### new features

* added loader to slider buttons (buttons that allow to slide between
files.
* added check for popup blocking.
* new function that allows to center on the node with more links
* added new button to center on the node being displayed in the popup
* added dynamic text to file `inputs`.

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
