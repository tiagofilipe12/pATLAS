# Import results using requests

Results may be displayed in pATLAS through a certain route that allow
users to send a `POST` request. Then users will be provided with a
**unique url** for each dictionary / JSON object sent via the `POST`
request. This unique url can be used as a link from other resources,
such as _webpages_ or even _command line tools_.

## How to send results to pATLAS through POST request

### TL;DR
```python
import requests

r = requests.post("http://www.patlas.site/results/",
json={"type": "mapping", "samples": {"sample_1": {"NZ_CP015088_1":
0.6800298214104171, "NZ_CP019048_1": 0.6414056876230454,
"NZ_CP029222_1": 1.0, "NZ_CP022144_1": 0.782715083639,
"NC_019983_1": 0.608254857045898}}})

r.content
//Result: http://patlas.site/results?query=15675682358507007771
```

### Explanation

In the above example we are sending a post request using `python`
requests module. Any other language can be used to send this kind of
`POST`. The only requirements are:

* Send the post to `http://www.patlas.site/results/` or
`http://www.patlas.site/results`. The final `/` is not mandatory.
* Send a `json` with the request. This `json` must contain a dictionary,
with two keys:
    * `type`: required for pATLAS to recognize the type of import.
    Available options: `mapping`, `mash_screen` and `assembly`. It must
    be a string, otherwise an error will be returned from the request.
    * `samples`: An object (dictionary) that contains as _keys_ each
    sample and each sample key has as _values_ a dictionary similar to
    the one used in [import results from files](import_api.md) for each
    type of import.

Then, if everything seems suitable for pATLAS database to receive the
`POST` request, the entry will be stored in a database and a **unique
url** will be returned as a **response** to the `POST`.

### Lifetime of database entries

Each successful `POST` request will be stored in pATLAS database for
**1 day**. During this period **the link can be shared** with other
users.

#### How can I visualize results after that period?

There are basically two options to visualize the results after it has
been deleted from the database:

1) Send a new `POST` request similar to the previous one. This will be
the most common use case, where other applications send these `POST`s
when users are analyzing results. Given that `POST`s generate a unique
hash, if for some reason a duplicated post is made it will not be added
twice to the database. It will return the same url and the routing will
properly handle the exception.
2) Import results using the [import from file](Import.md) menus.
