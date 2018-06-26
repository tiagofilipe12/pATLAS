try:
    from db_manager.db_app import app, db
    from db_manager.db_app.models import Plasmid, SequenceDB, UrlDatabase
except ImportError:
    try:
        from db_app import app, db
        from db_app.models import Plasmid, SequenceDB, UrlDatabase
    except ImportError:
        from patlas.db_manager.db_app import app, db
        from patlas.db_manager.db_app.models import Plasmid, SequenceDB, \
            UrlDatabase


from flask import json, render_template, Response
from flask_restful import request
import ctypes
import sqlalchemy
from collections import OrderedDict


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
    return repetitiveFunction("db_app/static/json/import_to_vivagraph_v1.4.1.json")

@app.route("/fullDS")
def full_ds():
    return repetitiveFunction("db_app/static/json/filtered_v1.4.1.json")

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

    var_response = request.args["accession"].replace(".", "_").split(",")

    print("tst")
    print(var_response)

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

    var_response = request.args["accession"].replace(".", "_").split(",")

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

    return Response(generate(), mimetype="text/csv",
                    headers={"content-disposition":
                        "attachment; filename=pATLAS"
                        "_metadata_{}.txt".format(
                            str(abs(hash("".join(var_response))))
                        )
                    }
                    )

@app.route("/results/", methods=["GET", "POST"])
def show_highlighted_results():
    """Method that allows to receive post requests and display results in pATLAS
    from external sources

    This function allows external applications to send JSON files to pATLAS
    and store them in a psql database table, which will enable to view results
    in an unique view for each selection. POST requests generate a unique hash
    for a given JSON dictionary that is sent through the request and return
    them in an unique url to the application that sent the POST request. Then,
    users may access their results in the specified url.

    Returns
    -------
    This function returns a string with the url that will allow to visualize
    results. If the post request doesn't have a dictionary a warning will be
    raised for the post sender.

    """

    if request.method == "GET":
        # receive a get from the frontend
        queried_json = db.session.query(UrlDatabase).get(request.args["query"])

        # check for json_entry result
        try:
            # then render the index.html and a request_results that will be parsed
            # by the same html file to a js global variable
            return render_template("index.html",
                                   request_results=queried_json.json_entry)
        except AttributeError:
            # if no results are displayed show some other template warning
            # the user
            return render_template("failed_request_results.html")

    else:
        # receive a POST request in the backend

        # check if dict is empty or not. This will fail if a string is provided
        if request.form:
            # orders dictionary so that the hash doesn't change.
            ordered_dict = OrderedDict((k, v) for k, v in sorted(
                request.form.items(), key=lambda x: x[0]))

            # generate a positive hash for each dict that is given to this post
            hash_url = ctypes.c_size_t(
                hash(frozenset(ordered_dict.items()))
            ).value

            append_to_db = UrlDatabase(
                id=hash_url,
                json_entry=request.form
            )

            # tries to commit to database, if it fails then retrieve a warning
            # but it is still able to return the url for the end application
            try:
                db.session.add(append_to_db)
                db.session.commit()
                db.session.close()
            except sqlalchemy.exc.IntegrityError:
                print("WARNING: Attempted to push to database an already "
                      "existing key ({}). None will be added but it will return"
                      " a url to the request anyway.".format(hash_url))

            return "http://127.0.0.1:5000/results?query={}".format(str(hash_url))

        else:
            # if a dictionary is not found then return a warning to the end
            # application
            return "ERROR: attempted to hash something that is not a JSON. " \
                   "POST request must have a JSON format suitable for pATLAS."
