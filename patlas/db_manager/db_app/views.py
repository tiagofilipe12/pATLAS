try:
    from db_manager.db_app import app
except ImportError:
    try:
        from db_app import app
    except ImportError:
        from patlas.db_manager.db_app import app

from flask import json, render_template


def repetitiveFunction(path):
    '''Function that repeated in all views and that can be used to add any
    json object to a view

    :param path: str, is the relative path to the json file to be loaded.
    Note that path is relative to this script
    :return: Json object that will be added to the respective view
    '''
    data = make_summary(path)
    response = app.response_class(
        response=json.dumps(data),
        status=200,
        mimetype="application/json"
    )
    return response

## routes

@app.route("/")
@app.route("/index")
def index():
    return render_template("index.html")

@app.route("/test")
def main_summary():
    return repetitiveFunction("db_app/static/json/import_to_vivagraph.json")

@app.route("/fullDS")
def full_ds():
    return repetitiveFunction("db_app/static/json/filtered_19012018.json")

@app.route("/taxa")
def taxa_summary():
    return repetitiveFunction("db_app/static/json/taxa_tree.json")

@app.route("/resistance")
def res_summary():
    return repetitiveFunction("db_app/static/json/resistance.json")

@app.route("/plasmidfinder")
def pf_summary():
    return repetitiveFunction("db_app/static/json/plasmidfinder.json")

@app.route("/virulence")
def vir_summary():
    return repetitiveFunction("db_app/static/json/virulence.json")

## routes for sample files
@app.route("/map_sample")
def map_sample():
    return repetitiveFunction(
        "db_app/static/json/samples/reads_sample_resultSRR5201504.json"
    )

@app.route("/ass_sample1")
def ass_sample1():
    return repetitiveFunction(
        "db_app/static/json/samples/assembly1.fasta__distances.txt.json"
    )

@app.route("/ass_sample2")
def ass_sample2():
    return repetitiveFunction(
        "db_app/static/json/samples/assembly2.fasta__distances.txt.json"
    )

@app.route("/mash_sample")
def mash_sample():
    return repetitiveFunction(
        "db_app/static/json/samples/mash_screen_sample_sorted.json"
    )

## functions

def make_summary(path):
    with open(path) as data_file:
        data = json.load(data_file)
    return data