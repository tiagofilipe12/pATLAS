# Import API

pATLAS has a menu in the sidebar that allow users to import results from
`mapping`, `mash screen` and `mash dist` (sequence) approaches. For futher
information on the usage of these imports go to this [link](Import.md).

The purpose of this section is to explain how other users may have
have their own pipelines importing results to pATLAS, for each one of
the import types. All import types expect `.json` type of files.
**Important:** the file extension is used to check if the user is attempting
to send a wrong type of file and thus to raise a warning if the extension
of the file isn't `.json`. Therefore, the file **must** have a `.json`
extension.

## Mapping

The mapping import menu expects a file structure like the following:

```
{"NZ_CP021778_1": 0.7684470944696938, "NG_048171_1": 0.6337828246983677}
```

The idea is to have an accession (from a plasmid available in this
[indexes](https://github.com/tiagofilipe12/PlasmidCoverage/releases/download/1.1.0/indexes.tar.gz)
as key and the percentage of coverage as the value for each `key:value`
pair.

## Mash screen

The Mash screen import menu expects a file structure as the following:

```
{"NZ_CP019138_1": ["0.996397", "1"], "NZ_CP021884_1": ["0.996102", "1"]}
```

Here the keys are identical to the ones above (plasmid accession numbers),
but the values are an array of values. The first element of this array
corresponds to mash screen identity value, while the second corresponds
to an estimation of the copy number of that plasmid.

**Note:** you can use [this index](https://github.com/tiagofilipe12/mash_wrapper/releases/download/1.0.5/patlas.msh)
that contain all the plasmids available in pATLAS to mash screen pipelines.

#### Copy number estimation explanation

The copy number estimation, provided as the second element of the array
for each key, is calculated from the median of all the `median multiplicity`
values available in mash screen output (the third field in each row).

```
copy number = each entry median multiplicity / median all median multiplicity values
```

For more on this thread see [this code](https://github.com/ODiogoSilva/templates/blob/master/mashscreen2json.py#L63-L91).

## Sequence

The sequence import menu in fact imports results from mash dist (which
is the distance estimation engine behind pATLAS) and it is intended to
give a percentage identity of contigs in relation to all the plasmids
available through pATLAS. This expects an import file structure like this:

```
{"NC_019102_1": [0.9012016, 0.967, "contig1"], "NZ_CP018108_1": [0.9127561, 0.987, "contig2"]}
```

Again the key is a plasmid accession number available in pATLAS, while
the values for are arrays of 3 elements:

- The identity percentage (`1 - mash distance`) of a given contig with
the plasmid available in the database.
- The number of shared hashes between the query contig and the plasmid
available in the database.

    * **Shared hashes explanation**
        * This value is calculated for each row in `mash dist` output.
        This is the last element of each row in mash dist output.
- The contig name retrieved from each row in the mash dist output.

**Note:** you can use [this index](https://github.com/tiagofilipe12/mash_wrapper/releases/download/1.0.5/patlas.msh)
that contain all the plasmids available in pATLAS to mash dist pipelines.

## Consensus

This requires basically a combination of the above structures to check
for common entries between mapping and mash screen results (it still lacks
assembly results for this... but we will add this in the future).

This is the structure of this file import:

```
{"NZ_CP014976_1": {"file1_mapping": 0.93, "file2_mash_screen": [0.92, 2]}, "NZ_CP014577_1": {"file1_mapping": 0.96, "file2_mash_screen": [0.93, 4]}}
```

[This script](https://github.com/assemblerflow/assemblerflow/blob/master/assemblerflow/templates/pATLAS_consensus_json.py) is available and can be used to generate this consensus files.

### What if my pipeline doesn't need these indexes?

You can download the pATLAS full database in fasta format from
[here](https://github.com/tiagofilipe12/mash_wrapper/releases/download/1.0.5/reference.fasta).

This contains all the accession numbers available in pATLAS.



