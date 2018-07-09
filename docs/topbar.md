# Top navigation bar

This navigation bar is open by default, however some options are not
available immediately after loading the page (don't worry, proper errors
will raise if something goes wrong). Here is the general aspect of the
Top navigation bar:

<img width="900" height="150" src="gitbook/images/topbar.png" alt="topbar"/>


1. Button that opens the [side menu](Sidebar.md).

2. Button that resets colors of all plasmids/nodes and clears every selection
previously made.

3. Button that resets the colors of all links.

4. `Home` button that will reload the initial network (nodes and links).
However, previous selections made through the [side menu](Sidebar.md)
will be kept, allowing the user to re-use previous selections but in
the full matrix.

5. `Filter` button, which filters the current selection and displays
all currently selected plasmids/nodes or all currently selected
plasmids/nodes and all their linked plasmids/nodes (as well as the
respective links). This may be particularly handy to filter queries.

6. `Download` button, that enable users to download the currently
selected plasmids. This will download the queried accession numbers to
a file named `pATLAS_download_<random_hash>.fas`. For more on this
subject, see [Download api](download_api.md).

7. `Table` button, that opens a table with information available for the
currently selected plasmids/nodes.

8. `Statistics` button, that will open a bar plot with the species
present in the current selection. This will also allow access to all
other statistic plots through the statistics popup (for further details
see [Statistics](Statistics.md).

9. `Heatmap` button will generate a heat map that allows to compare
multiple mapping or mash screen or even sequence results (for more
details on how to import results go to [here](Import.md)).

10. A slider that enables the user to search for a specific accession
number or plasmid name (depending on the state of the slider). Then
users may give a name or accession number to the form on the left (11th
button in this image).

11. A search form in which users may search for a specific accession number or
plasmid name, as mentioned before.

12. A button to submit the queried accession number or plasmid name
(written in **11**).

13. A button that clears the form in **11**.
