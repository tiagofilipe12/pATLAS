try:
    from db_manager.db_app import app, db
    from db_manager.db_app.models import Plasmid, SequenceDB, UrlDatabase,\
        Card, Positive, Database, FastaDownload
except ImportError:
    try:
        from db_app import app, db
        from db_app.models import Plasmid, SequenceDB, UrlDatabase, Card, \
            Positive, Database, FastaDownload
    except ImportError:
        from patlas.db_manager.db_app import app, db
        from patlas.db_manager.db_app.models import Plasmid, SequenceDB, \
            UrlDatabase, Card, Positive, Database, FastaDownload


from flask import json, render_template, Response, redirect, url_for, \
    after_this_request, send_from_directory
from flask_restful import request
import ctypes
import sqlalchemy


def make_summary(path):
    with open(path) as data_file:
        data = json.load(data_file)
    return data


def repetitive_function(path):
    """Function that repeated in all views and that can be used to add any
    json object to a view

    Parameters
    ----------
    path: str
        Is the relative path to the json file to be loaded.
        Note that path is relative to this script

    Returns
    -------
    Json object that will be added to the respective view

    """

    data = make_summary(path)
    response = app.response_class(
        response=json.dumps(data),
        status=200,
        mimetype="application/json"
    )
    return response


# Allow connections from other services
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers',
                       'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods',
                       'GET,PUT,POST,DELETE,OPTIONS')
    return response


# routes
@app.route("/")
@app.route("/index")
def index():
    """This function renders the pATLAS index.html

    This function will render the pATLAS page. When this is redirected from
    `show_highlighted_results` it will render the page but passing a variable
    containing data to highlight nodes in the vivagraph visualization.

    Returns
    -------
    Render a template and possibly a variable to the front end
    """

    # checks if db query returns some json_entry. if not raises AttributeError
    try:
        # checks if request.args is empty or not
        if bool(request.args):
            queried_json = db.session.query(UrlDatabase).get(
                request.args["query"])
            print(queried_json.json_entry)
            return render_template("index.html",
                                   request_results=queried_json.json_entry)
        else:
            return render_template("index.html", request_results="false")

    except AttributeError:
        # if no results are displayed show some other template warning
        # the user
        return render_template("failed_request_results.html")


@app.route("/test")
def main_summary():
    return repetitive_function(
        "db_app/static/json/import_to_vivagraph.json"
    )


@app.route("/fullDS")
def full_ds():
    return repetitive_function("db_app/static/json/filtered.json")


@app.route("/taxa")
def taxa_summary():
    return repetitive_function("db_app/static/json/taxa_tree.json")


@app.route("/resistance")
def res_summary():
    return repetitive_function("db_app/static/json/resistance.json")


@app.route("/plasmidfinder")
def pf_summary():
    return repetitive_function("db_app/static/json/plasmidfinder.json")


@app.route("/virulence")
def vir_summary():
    return repetitive_function("db_app/static/json/virulence.json")


#  routes for sample files
@app.route("/map_sample")
def map_sample():
    return repetitive_function(
        "db_app/static/json/samples/reads_sample_resultSRR5201504.json"
    )


@app.route("/ass_sample1")
def ass_sample1():
    return repetitive_function(
        "db_app/static/json/samples/assembly1.json"
    )


@app.route("/ass_sample2")
def ass_sample2():
    return repetitive_function(
        "db_app/static/json/samples/assembly2.json"
    )


@app.route("/mash_sample")
def mash_sample():
    return repetitive_function(
        "db_app/static/json/samples/mash_screen_sample_sorted.json"
    )


@app.route("/robots.txt")
def static_robots():
    """
    This is a view to serve robots.txt that allow bots to search the page.

    Returns
    -------
    A file sent from the static directory with the name robots.txt
    """
    return send_from_directory(app.static_folder, request.path[1:])


@app.route("/api/senddownload/", methods=["GET", "POST"])
def generate_download():
    """Api to download fasta files

    This route is intended to provide API to download fasta sequences from
    pATLAS. In fact it can be used by anyone anyone using the following API:
    http://www.patlas.site/api/senddownload/?accession=<list_of_accessions>

    Returns
    -------
    A response with the stream of the file to be generated in the client side
    """

    if request.method == "GET":
        var_response = request.args["accession"].replace(".", "_").split(",")

        query = db.session.query(SequenceDB).filter(
            SequenceDB.plasmid_id.in_(var_response)).all()

        def generate():
            for record in query:
                yield ">" + record.plasmid_id + "\n" + record.sequence_entry + "\n"

        return Response(generate(),
                        mimetype="text/csv",
                        headers={"content-disposition":
                        "attachment; filename=pATLAS_download_{}.fas".format(
                                str(abs(hash("".join(var_response))))
                        )})
    else:
        # add to the database the url in which the results may be downloaded
        request_list = request.form["accessions"]

        # checks if list was stringified before the request
        if "[" and "]" not in request_list:
            print("Queried data isn't a list: ", type(request_list),
                  request_list)
            return "Queried data must be stringified, i.e., the list of " \
                   "accession number must be stringified before sending the" \
                   "post request."

        hash_url = ctypes.c_size_t(hash(request_list)).value

        append_to_db = FastaDownload(
            unique_id=hash_url,
            accessions=request_list
        )

        try:
            db.session.add(append_to_db)
            db.session.commit()
            db.session.close()
        except sqlalchemy.exc.IntegrityError:
            print("WARNING: Attempted to push to database an already "
                  "existing key ({}). None will be added but it will return"
                  " a url to the request anyway.".format(hash_url))

        return "http://www.patlas.site/downloads/?query={}".format(hash_url)


@app.route("/api/sendmetadata/", methods=["GET", "POST"])
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

    if request.method == "GET":
        var_response = request.args["accession"].replace(".", "_").split(",")
    else:
        var_response = request.get_json()

    query_plasmid = db.session.query(Plasmid).filter(
        Plasmid.plasmid_id.in_(var_response)).all()

    query_resistance = db.session.query(Card).filter(
        Card.plasmid_id.in_(var_response)).all()

    query_plasmid_family = db.session.query(Database).filter(
        Database.plasmid_id.in_(var_response)).all()

    query_virulence = db.session.query(Positive).filter(
        Positive.plasmid_id.in_(var_response)).all()

    def generate():
        """
        This function will generate a file from the front-end with the metadata
        for each accession in an array

        """

        # generates a dictionary that contains a dictionary per database query
        dict_to_output = {
            "Sequence_data": {record.plasmid_id: record.json_entry
                              for record in query_plasmid},
            "Resistance": {record.plasmid_id: record.json_entry
                           for record in query_resistance},
            "PlasmidFinder": {record.plasmid_id: record.json_entry
                              for record in query_plasmid_family},
            "Virulence": {record.plasmid_id: record.json_entry
                          for record in query_virulence}
        }

        # dumps this dictionary generated above to the response
        yield json.dumps(dict_to_output)

    # sends the information to a file
    return Response(generate(), mimetype="text/csv",
                    headers={"content-disposition":
                    "attachment; filename=pATLAS_metadata_{}.json".format(
                        str(abs(hash("".join(var_response))))
                    )})


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
    This function also has a group of tests that prevent that erroneous data is
    passed to the database and retrieves warnings through the requests when
    wrong type of data is provided.

    Returns
    -------
    This function returns a string with the url that will allow to visualize
    results. If the post request doesn't have a dictionary a warning will be
    raised for the post sender.

    """

    if request.method == "GET":
        # receive a get from the frontend

        # this redirects to the index view
        return redirect(url_for("index", query=request.args["query"]))
    else:
        # receive a POST request in the backend
        # fetch the nested json
        request_json = request.get_json()

        # a list of the authorized type
        authorized_types = ["mapping", "mash_screen", "assembly"]

        # check if dict is empty or not. This will fail if a string is provided
        if request_json:

            # checks if type key exists in requested json object
            if "type" in request_json:
                # checks if samples key exists in requested json object
                if "samples" in request_json:
                    # check the type of 'type' key. It should be a str
                    type_obj = type(request_json["type"])
                    if type_obj is not str:
                        return "The value provided through 'type' entry must " \
                               "be a string", 400

                    # check the type of 'samples' key. It should be a dict.
                    sample_obj = type(request_json["samples"])
                    if sample_obj is not dict:
                        return "The value provided through 'sample' entry " \
                               "must be a dictionary / JSON object.", 400

                    # checks if this type is present in the authorized_types
                    # list
                    if request_json["type"] not in authorized_types:
                        return "'{}' is not a valid type. Valid types are " \
                               "{}.".format(request_json["type"],
                                            " or ".join(authorized_types)
                                            ), 400
                else:
                    return "No 'samples' field was provided in the JSON " \
                           "object.", 400
            else:
                # if type doesn't exist then pATLAS will not be able to decide
                # which mode to use in order to display results
                return "No 'type' field was provided in the JSON object.", 400

            # converts dict to a string so it can be more easily hashed, since
            # nested dicts can be trickier to hash.
            stringify_dict = json.dumps(request_json)

            # generate a positive hash for each dict that is given to this post
            hash_url = ctypes.c_size_t(
                hash(stringify_dict)
            ).value

            append_to_db = UrlDatabase(
                id=hash_url,
                json_entry=request_json
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

            return "http://www.patlas.site/results?query={}".format(
                str(hash_url))

        else:
            # if a dictionary is not found then return a warning to the end
            # application
            return "ERROR: attempted to hash something that is not a JSON. " \
                   "POST request must have a JSON format suitable for " \
                   "pATLAS.", 400


@app.route("/downloads/", methods=["GET"])
def download_sequences():
        # checks if args are provided to download
        if bool(request.args):
            # fetches the array that should be downloaded
            queried_json = db.session.query(FastaDownload).get(
                request.args["query"])
            var_response = json.loads(queried_json.accessions)
            db.session.close()

            # fetches sequence data itself
            query = db.session.query(SequenceDB).filter(
                SequenceDB.plasmid_id.in_(var_response)).all()
            db.session.close()

            def generate():
                """
                The generator

                """
                for record in query:
                    yield ">" + record.plasmid_id + "\n" + record.sequence_entry + "\n"

            # The piece of code that assures that every instance will be removed
            # from the database
            @after_this_request
            def remove_entry(response):
                db.session.query(FastaDownload).filter(
                    FastaDownload.unique_id == request.args["query"]).delete()
                db.session.commit()
                db.session.close()
                return response

            return Response(generate(),
                            mimetype="text/csv",
                            headers={"content-disposition":
                                "attachment; filename=pATLAS_download_{}.fas".format(
                                    str(abs(hash("".join(request.args["query"]))))
                            )})
        else:
            return "unique id is not valid.", 400
