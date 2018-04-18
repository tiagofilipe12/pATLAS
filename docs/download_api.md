# Download API

Plasmid Atlas provides resources that other users may require and use.
Database requests can be done through some urls similarly to what is
done in [eutils](https://www.ncbi.nlm.nih.gov/books/NBK25500/) .

## Download metadata

If you have a list of accession numbers, you can provide it through:

```
http://www.patlas.site/api/sendmetadata/?accession=<accession_list>
```

This will fetch an array of jsons in which each json object contains
all metadata available for that accession number in the pATLAS database.

**Note** - Of course this doesn't accept any accession number, just
accession numbers of plasmids contained in pATLAS, thus, that are
available in NCBI reqseq plasmid ftp.

## Download sequences

If you have a list of accession numbers, you can download their
respective sequences by using the following API:

```
http://www.patlas.site/api/senddownload/?accession=<accession_list>
```

This will generate a fasta file with the accession numbers requested,
containing the sequences associated with each accession number.

**Note** - This is currently being used by pATLAS in the `download`
button. It downloads the accession numbers associated with the current
selection.
