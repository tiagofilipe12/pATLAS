<p align="center">
  <a href="http://www.patlas.site">
    <img height="200" width="400" title="pATLAS" alt="pATLAS logo"
    src="https://raw.githubusercontent.com/tiagofilipe12/pATLAS/master/docs/gitbook/images/pATLAS_black.png"/>
  </a>
  <br/>
</p>

# Badges and more badges!

[![Join the chat at https://gitter.im/plasmidATLAS/Lobby](https://badges.gitter.im/plasmidATLAS/Lobby.svg)](https://gitter.im/plasmidATLAS/Lobby?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Codacy Badge](https://api.codacy.com/project/badge/Grade/e4d557080bbb45d5b8ad414a97b9b6aa)](https://www.codacy.com/app/tiagofilipe12/pATLAS?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=tiagofilipe12/pATLAS&amp;utm_campaign=Badge_Grade)


# Description

[Plasmid Atlas](http://www.patlas.site) is a web-base tool that empowers researchers to easily and rapidly access
information related with plasmids present in `NCBI's refseq` database.
In pATLAS each node (or circle) represents
a plasmid and each link between two plasmids means that those two plasmids
share around 90% average nucleotide identity.

With this tool we have two main goals:

1. Increase the accessibility of plasmid relevant metadata to users as
well as facilitate the access to that metadata.
2. Improve the ease of interpreting results from High Throughput Sequencing
   (HTS) for plasmid detection.

# Documentation

If are interested in learning how to use pATLAS, please refer to
[gitbook documentation](https://www.gitbook.com/book/tiagofilipe12/patlas/details).

This README is a compilation of how to manage pATLAS back-end and front-end.
So, do not refer to this README to use pATLAS.

---

# Development

## Dependencies

* **Mash** - You can download mash version 2.0.0 directly here:
[linux](https://github.com/marbl/Mash/releases/download/v2.0.0/mash-Linux64-v1.1.1.tar.gz) and [OSX](https://github.com/marbl/Mash/releases/download/v1.1.1/mash-OSX64-v1.1.1.tar.gz). Other releases were not tested but may be downloaded in Mash git [releases page](https://github.com/marbl/Mash/releases).

* **Postgresql** - This script uses Postgres database to store the database:
[releases page](https://www.postgresql.org/download/)

* To install all other dependencies just run: _pip install -r requirements.txt_

## Backend Scripts

### MASHix.py

MASHix.py is the main script to generate the database. This script generates
a matrix of pairwise comparisons between sequences in input fasta(s) file(s).
Note that it reads multifastas, i.e., each header in fasta is a reference sequence.

#### Options:

##### Main options:

```
'-i','--input_references' - 'Provide the input fasta files to parse. This will inputs will be joined in a master fasta.'

'-o','--output' - 'Provide an output tag'

'-t', '--threads' - 'Provide the number of threads to be used'
```

##### MASH related options:
```
'-k','--kmers' - 'Provide the number of k-mers to be provided to mash sketch. Default: 21'

'-p','--pvalue' - 'Provide the p-value to consider a distance significant. Default: 0.05'

'-md','--mashdist' - 'Provide the maximum mash distance to be parsed to the matrix. Default:0.1'
```

##### Other options:

```
'-no_rm', '--no-remove' - 'Specify if you do not want to remove the output concatenated fasta.'

'-hist', '--histograms' - 'Checks the distribution of distances values ploting histograms.'
```

---

#### Database customization:

##### I don't like database name! How do I change it?

Go to `db_manager/config_default.py` and edit the following line:

```python
SQLALCHEMY_DATABASE_URI = 'postgresql:///<custom_database_name>'
```

##### I don't like table name inside database! How do I change it?

Go to db_manager/db_app/models.py and edit the following line:

```python
 __tablename__ = "<custom_table_name>"
```

---

#### Database migration from one server to another

##### Database export

```
pg_dump <db_name> > <file_name.sql>
```

##### Database import

```
psql -U <user_name> -d <db_name> -f <file_name.sql>
```

---

## Supplementary scripts

### abricate2db.py

This script inherits a class from
[ODiogoSilva/Templates](https://github.com/ODiogoSilva/templates) and uses it to
parse abricate outputs and dumps abricate outputs to a psql database, depending
on the input type provided.

#### Options:

```
"-i", "--input_file" - "Provide the abricate file to parse to db.
                        It can accept more than one file in the case of
                        resistances."
"-db", "--db" - "Provide the db to output in psql models."
"-id", "--identity" - "minimum identity to be reported to db"
"-cov", "--coverage" - "minimum coverage do be reported to db"
"-csv", "--csv" - "Provide card csv file to get correspondence between
                    DNA accessions and ARO accessions. Usually named
                    aro_index.csv. By default this file is already
                    available in patlas repo with a specific path:
                    'db_manager/db_app/static/csv/aro_index.csv'"

```
