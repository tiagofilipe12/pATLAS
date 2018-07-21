# Run pATLAS locally

pATLAS can be run locally if you have PostgreSQL installed and
configured. After, you just need to:

1) Clone this repository:
```
git clone https://github.com/tiagofilipe12/pATLAS
```

2) [Create your custom database version](database_creation.md#creating-a-custom-version-of-pATLAS)
 or [generate the default pATLAS database](database_creation.md).

3) Make sure all the necessary files are in place.
    - by default pATLAS generates a `import_to_vivagraph.json` file in
    the folder `<tag_provided_to_o_flag>/results`. Place this file in the
    `pATLAS/patlas/db_manager/db_app/static/json` folder.
    - change session to read the new `import_to_vivagraph.json` file by
    changing from `false` to `true` a variable named `devel` in
    `pATLAS/patlas/db_manager/db_app/static/js/pATLASGlobals.js`

4) Create the database that the front end will run:
```
createdb <your_database>
```

5) [load the generated sql file](https://github.com/tiagofilipe12/pATLAS#database-import)

6) Then execute the script `run.py`.
```
cd pATLAS/patlas/db_manager
./run.py <your_database>
```
Note: the database name is utterly important to properly say to the
frontend where to get the data.

7) Go to `127.0.0.1:5000`.

## Optimization of the resources usage by the web page

Using the `devel = true` isn't very efficient, so you can allow the
force directed graph to render in a `devel = true` session, then when
you are satisfied pause the force layout using the buttons available in
pATLAS and click at the same time `Shift+Ctrl+Space`. This will take a
while but eventually it will generate a file named `filtered.json`.
Once you have this file you can add it to the
`pATLAS/patlas/db_manager/db_app/static/json` folder and change the
`devel` variable to `false`. This will use the previously saved
positions to render a pre rendered network.