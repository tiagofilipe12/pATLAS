# Schematics of the pATLAS database creation

![Workflow db creation](gitbook/images/pATLAS_schematics.png)

## Workflow for database creation

1) Download plasmid sequences available in [NCBI refseq](ftp://ftp.ncbi.nlm.nih.gov/refseq/release/plasmid/)

2) Extract fasta from tar.gz

3) Download and extract [NCBI taxonomy](ftp://ftp.ncbi.nih.gov/pub/taxonomy/taxdump.tar.gz),
which will be fed to pATLAS.

4) Clone this repository:
```
git clone https://github.com/tiagofilipe12/pATLAS
```

5) Configure the database:
```
createdb <database_name>
pATLAS/patlas/db_manager/db_create.py <database_name>
```

6) run [MASHix.py](https://github.com/tiagofilipe12/pATLAS#mashixpy) - the output will include a filtered
fasta file (`master_fasta_*.fas`).

7) run [ABRicate](https://github.com/tseemann/abricate), with CARD,
ResFinder, PlasmidFinder, VFDB databases.
```
# e.g.
abricate --db card <master_fasta*.fas> > abr_card.tsv
abricate --db resfinder <master_fasta*.fas> > abr_resfinder.tsv
abricate --db vfdb <master_fasta*.fas> > abr_vfdb.tsv
abricate --db plasmidfinder <master_fasta*.fas> > abr_plasmidfinder.tsv
```

8) Download the [card index](https://card.mcmaster.ca/download/0/broadstreet-v2.0.2.tar.gz)
necessary for the abricate2db.py script (aro_index.csv).

9) Update the git submodules (`git submodule update --init --recursive`) and run [abricate2db.py](https://github.com/tiagofilipe12/pATLAS#abricate2dbpy) - using all the previous tsv as
input.
```
# e.g.
abricate2db.py -i abr_plasmidfinder.tsv -db plasmidfinder \
    -id 80 -cov 90 -csv aro_index.csv -db_psql <database_name>
```

10) [dump database to a sql file](#database-export).

### Automation of this steps

This steps are fully automated in the nextflow pipeline
[pATLAS-db-creation](https://github.com/tiagofilipe12/pATLAS-db-creation).

### Creating a custom version of pATLAS

If you require to add your own plasmids to pATLAS database
without asking to add them to [pATLAS website](www.patlas.site),
you can provide custom fasta files when building the database using
the `-i` option of [MASHix.py](https://github.com/tiagofilipe12/pATLAS#mashixpy).
Then follow the steps [described above](#workflow-for-database-creation).
