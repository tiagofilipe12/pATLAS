from . import app
from flask import json, render_template

## routes

@app.route('/')
@app.route('/index')
def index():
    return render_template("index.html")

@app.route('/test')
def main_summary():
    data = make_summary('db_app/static/json/import_to_vivagraph.json')
    response = app.response_class(
        response=json.dumps(data),
        status=200,
        mimetype='application/json'
    )
    return response

@app.route('/fullDS')
def full_ds():
    data = make_summary('db_app/static/json/final_ds.json')
    response = app.response_class(
        response=json.dumps(data),
        status=200,
        mimetype='application/json'
    )
    return response

@app.route('/taxa')
def taxa_summary():
    data = make_summary('db_app/static/json/taxa_tree.json')
    response = app.response_class(
        response=json.dumps(data),
        status=200,
        mimetype='application/json'
    )
    return response

## functions

def make_summary(path):
    with open(path) as data_file:
        data = json.load(data_file)
    return data