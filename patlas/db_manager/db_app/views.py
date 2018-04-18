try:
    from db_manager.db_app import app, db
    from db_manager.db_app.models import Plasmid, SequenceDB
except ImportError:
    try:
        from db_app import app, db
        from db_app.models import Plasmid, SequenceDB
    except ImportError:
        from patlas.db_manager.db_app import app, db
        from patlas.db_manager.db_app.models import Plasmid, SequenceDB


from flask import json, render_template, Response
from flask_restful import request


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
        "db_app/static/json/samples/assembly1.json"
    )

@app.route("/ass_sample2")
def ass_sample2():
    return repetitiveFunction(
        "db_app/static/json/samples/assembly2.json"
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


@app.route("/api/senddownload/", methods=["get"])
def generate_download():
    """Api to download fasta files

    This route is intended to provide API to download fasta sequences from
    pATLAS. In fact it can be used by anyone anyone using the following API:
    http://www.patlas.site/api/senddownload/?accession=<list_of_accessions>

    Returns
    -------
    A response with the stream of the file to be generated in the client side
    """

    var_response = request.args["accession"].replace("[", "") \
        .replace("]", "").replace('"', "").split(",")

    query = db.session.query(SequenceDB).filter(
        SequenceDB.plasmid_id.in_(var_response)).all()

    def generate():
        for record in query:
            yield ">" + record.plasmid_id + "\n" + record.sequence_entry + "\n"

    return Response(generate(),
                    mimetype="text/csv",
                    headers={"content-disposition":
                        "attachment; filename=pATLAS"
                        "_download_{}.fas".format(
                            str(abs(hash("".join(var_response))))
                        )
                    }
                    )


@app.route("/api/sendmetadata/", methods=["get"])
def generate_metadata_download():
    """Api to download metadata for each accession

    This route is intended to provide API to download metadata for each plasmid
    available in pATLAS. In fact it can be used by anyone anyone using the
    following API:
    http://www.patlas.site/api/sendmetadata/?accession=<list_of_accessions>

    Returns
    -------
    A response with the stream of the file to be generated in the client side.
    This file
    """

    var_response = request.args["accession"].replace("[", "") \
        .replace("]", "").replace('"', "").split(",")

    query = db.session.query(Plasmid).filter(
        Plasmid.plasmid_id.in_(var_response)).all()

    def generate():
        """
        This function will generate a file from the front-end with the metadata
        for each accession in an array

        """
        yield "["
        for x, record in enumerate(query):
            if len(query) - 1 > x:
                yield json.dumps({record.plasmid_id: record.json_entry}) + ","
            else:
                yield json.dumps({record.plasmid_id: record.json_entry})
        yield "]"

    return Response(generate(), mimetype="text/csv")

## TODO a similar api can be added for the other tables in fact to fetch metadata
