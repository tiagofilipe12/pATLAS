# Top navigation bar

At the top of pATLAS page there is a bar that by default has:

* On the top left corner:

    * The sidebar button, that will open the sidebar menu

    * Two buttons to reset nodes and links, respectively.

* On the top right corner:

    * A slider button that enables switching the searches from accession
    numbers to plasmid name and the other war around.

    * The form where the user adds text to search for the accession
    number or plasmid name

    * A `Go` button that will submit the desired search.

    * A `Clear` button that will clear the form.

## Additional buttons

When any custom user selection is made **five** new buttons will appear:

* A `home` button, that will reload the initial network (nodes and links).

* A `filter` button, that will filter the current selection and display
all currently selected nodes and all their linked nodes (and thus their
links). This is particularly handy, when the user wants to visualize
data that it doesn't know where it is in the whole network.

* A `download` button, that enable the user to download the selected
plasmids. This will download the queried accession number to a file named
`pATLAS_download_<random_hash>.fas`

* A `table` button, that by default will open a table with information available
for the current selection (see [Table](table.md)) and that has a tab that
can call an heatmap that allows to compare multiple mapping and mash
screen `JSON` files (see [Heatmap](heatmap.md)).

* A `quick statistics` button, that will open a bar plot with the species present
in current selection. This will also allow access to all other statistics plots
through the statistics popup (for further details see [Statistics](Statistics.md).
