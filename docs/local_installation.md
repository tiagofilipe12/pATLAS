# Run pATLAS locally

pATLAS can be run locally if you have PostgreSQL installed and
configured. After, you just need to:

1) Clone this repository:
```
git clone https://github.com/tiagofilipe12/pATLAS
```

2) [Create your custom database version](database_creation.md#creating-a-custom-version-of-pATLAS)
 or [generate the default pATLAS database](database_creation.md) or
 [download sql file from version 1.5.2](https://github.com/tiagofilipe12/pATLAS/releases/tag/1.5.2)
 (the `tar.gz` archive).
 **Note:** if you download the sql file from version 1.5.2 you may skip
 steps 3 to 4 and **continue with step 5**.

3) Make sure all the necessary files are in place.

- by default pATLAS generates a `import_to_vivagraph.json` file in
  the folder `<tag_provided_to_o_flag>/results`. Place this file in the
  `patlas/db_manager/db_app/static/json` folder.
- change session to read the new `import_to_vivagraph.json` file by
  changing from `false` to `true` a variable named `devel` in
  `patlas/db_manager/db_app/static/js/pATLASGlobals.js`

4) Create the database that the front end will run:
```
createdb <your_database>
```

5) [load the generated sql file](https://github.com/tiagofilipe12/pATLAS#database-import)

6) Install backend dependencies:

```
# within the root directory of this repository
pip install -r requirements.txt
```

7) Install frontend dependencies:

```
# change directory to static direcoty where `index.html` will look for
# its depdendenies
cd patlas/db_manager/db_app/static/
# then install them (package.json is located in this directory)
yarn install
```

8) Compile node modules so that the html can understand, using webpack:

```
# You can also user a local installation of webpack.
# entry-point.js is the config file where all the imported modules are
# called
node_modules/webpack/bin/webpack.js entry-point.js
```

9) Then execute the script `run.py`.
```
# within the root directory of this repository
cd patlas/db_manager
./run.py <your_database>
```
Note: the database name is utterly important to properly say to the
frontend where to get the data.

10) Go to `127.0.0.1:5000`.

## Optimization of the resources usage by the web page

Using the `devel = true` isn't very efficient, so you can allow the
force directed graph to render in a `devel = true` session, then when
you are satisfied pause the force layout using the buttons available in
pATLAS and click at the same time `Shift+Ctrl+Space`. This will take a
while but eventually it will generate a file named `filtered.json`.
Once you have this file you can add it to the
`patlas/db_manager/db_app/static/json` folder and change the
`devel` variable to `false`. This will use the previously saved
positions to render a pre rendered network.