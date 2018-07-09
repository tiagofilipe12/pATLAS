# Download API

pATLAS database requests can be done through URLs, similar to what is
done in [eutils](https://www.ncbi.nlm.nih.gov/books/NBK25500/) .

## Download metadata

### From a browser

If you have a list of accession numbers present in pATLAS database, 
you can download all metadata through:

```
http://www.patlas.site/api/sendmetadata/?accession=<accession_list>
```
or
```
http://www.patlas.site/api/sendmetadata?accession=<accession_list>
```

It will fetch an array of json objects in which each contains all metadata
 available for that accession number.

E.g.:

```
http://www.patlas.site/api/sendmetadata?accession=NC_017393_1,NZ_CP009835_1
```

### From a terminal

#### TL;DR
```python
import requests

r = requests.post("http://www.patlas.site/api/sendmetadata/",
json=["NC_017393_1", "NZ_CP009835_1"])

r.content
# your results
```

#### Explanation

* Send the post to `http://www.patlas.site/results/`.
* Send a `json` with the request. This `json` must contain a list of
accession numbers

## Download sequences

The sequences of plasmids from pATLAS database can be downloaded through 
the following API when providing a list of the accession numbers:

```
http://www.patlas.site/api/senddownload/?accession=<accession_list>
```

It will generate a fasta file with the accession numbers requested and
 the sequences associated with each accession number.

**Limitation**: This type of request to pATLAS database cannot have
thousands of accessions therefore for request with thousands of
accessions, use the following request type:

Python:
```python
import requests

# Note that form data should be sent as a string
r = requests.post("http://www.patlas.site/api/senddownload/",
data={"accessions": '["NC_017393_1", "NZ_CP009835_1"]'})

r.content
# E.g. response: http://patlas.site/results?query=15675682358507007771
```

Javascript / JQuery:
```javascript
// Note that form data should be sent as a string
$.post("www.patlas.site/api/senddownload/", {"accessions": JSON.stringify(accList)}, (data, status) => {
      if (status === "success") {
        window.open(data, "_blank")
      }
    }
  )
```

**Note** - The `download` button in the top bar downloads the accession 
numbers associated with the current selection using this last API, so
it is possible to download the full pATLAS data set. See
[Top navigation bar](topbar.md) for more information.
[Download button in table](table.md#download-button) also uses this API.
