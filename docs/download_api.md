# Download API

pATLAS database requests can be done through URLs, similar to what is
done in [eutils](https://www.ncbi.nlm.nih.gov/books/NBK25500/) .

## Download metadata

If you have a list of accession numbers present in pATLAS database, 
you can download all metadata through:

```
http://www.patlas.site/api/sendmetadata/?accession=<accession_list>
```

It will fetch an array of json objects in which each contains all metadata
 available for that accession number.


## Download sequences

The sequences of plasmids from pATLAS database can be downloaded through 
the following API when providing a list of the accession numbers:

```
http://www.patlas.site/api/senddownload/?accession=<accession_list>
```

It will generate a fasta file with the accession numbers requested and
 the sequences associated with each accession number.

**Note** - The `download` button in the top bar downloads the accession 
numbers associated with the current selection. See [Top navigation bar](topbar.md)
 for more information. [Download button in table](table.md#download-button)
 also uses this api.
