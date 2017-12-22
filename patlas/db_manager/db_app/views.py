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
    return repetitiveFunction("db_app/static/json/import_to_vivagraph_new.json")
    # data = make_summary("db_app/static/json/import_to_vivagraph_v5.json")
    # response = app.response_class(
    #     response=json.dumps(data),
    #     status=200,
    #     mimetype="application/json"
    # )
    # return response

@app.route("/fullDS")
def full_ds():
    return repetitiveFunction("db_app/static/json/filtered_2.json")
    # data = make_summary("db_app/static/json/filtered.json")
    # response = app.response_class(
    #     response=json.dumps(data),
    #     status=200,
    #     mimetype="application/json"
    # )
    # return response

@app.route("/taxa")
def taxa_summary():
    return repetitiveFunction("db_app/static/json/taxa_tree.json")
    # data = make_summary("db_app/static/json/taxa_tree.json")
    # response = app.response_class(
    #     response=json.dumps(data),
    #     status=200,
    #     mimetype="application/json"
    # )
    # return response

@app.route("/resistance")
def res_summary():
    return repetitiveFunction("db_app/static/json/resistance.json")
    # data = make_summary("db_app/static/json/resistance.json")
    # response = app.response_class(
    #     response=json.dumps(data),
    #     status=200,
    #     mimetype="application/json"
    # )
    # return response

@app.route("/plasmidfinder")
def pf_summary():
    return repetitiveFunction("db_app/static/json/plasmidfinder.json")
    # data = make_summary("db_app/static/json/plasmidfinder.json")
    # response = app.response_class(
    #     response=json.dumps(data),
    #     status=200,
    #     mimetype="application/json"
    # )
    # return response

## functions

def make_summary(path):
    with open(path) as data_file:
        data = json.load(data_file)
    return data