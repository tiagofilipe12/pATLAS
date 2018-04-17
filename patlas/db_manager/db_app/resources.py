
from flask_restful import Resource, reqparse, fields, marshal_with, request
from sqlalchemy import func

try:
    from db_manager.db_app import db
    from db_manager.db_app.models import Plasmid, Card, Database, Positive
except ImportError:
    try:
        from db_app import db
        from db_app.models import Plasmid, Card, Database, Positive
    except ImportError:
        from patlas.db_manager.db_app import db
        from patlas.db_manager.db_app.models import Plasmid, Card, Database, \
            Positive
#from flask import jsonify

## Defines response fields

# Nested fields avoid the necessity to call JSON.parse() in js which often
# renders problems with double quoting from python

nested_entry_fields = {
    "length": fields.String,
    "plasmid_name": fields.String,
    "name": fields.String,
    "significantLinks": fields.String,
    "taxa": fields.String,
    "cluster": fields.String
}


entry_field = {
    "plasmid_id": fields.String,
    # parse only the json required? Cannot use nested method because entry in database is a string with a json inside
    "json_entry": fields.Nested(nested_entry_fields)
}

nested_card_fields = {
    # these are in fact lists but ok...
    "coverage": fields.String,
    "identity": fields.String,
    "database": fields.String,
    "gene": fields.String,
    "accession": fields.String,
    "seq_range": fields.String,
    "aro_accession": fields.String
}

card_field = {
    "plasmid_id": fields.String,
    "json_entry": fields.Nested(nested_card_fields)
}

## define reqparse arguments

req_parser = reqparse.RequestParser()
req_parser.add_argument("accession", dest="accession", type=str,
                        help="Accession number to be queried")
req_parser.add_argument("name", dest="name", type=str, help="taxa "
                                                              "to be queried")
req_parser.add_argument("gene", dest="gene", type=str, help="gene "
                                                              "to be queried")
req_parser.add_argument("taxa", dest="taxa", type=str, help="taxa "
                                                              "to be queried")
req_parser.add_argument("plasmid_name", dest="plasmid_name", type=str,
                          help="plasmid name to be queried")

## define all resources

class GetSpecies(Resource):
    @marshal_with(entry_field)
    def post(self):
        #Put req_parser inside get function. Only this way it parses the request.
        #args = req_parser.parse_args()
        var_response = request.form["accession"].replace("[", "")\
            .replace("]", "").replace('"', "").split(",")
        single_query = db.session.query(Plasmid).filter(
            Plasmid.plasmid_id.in_(var_response)).all()
        #json_object = json.loads(single_query.json_entry)
        #print("return query ", single_query)
        return single_query

class GetResistances(Resource):
    @marshal_with(card_field)
    def post(self):
        # Put req_parser inside get function. Only this way it parses the request.
        #args = req_parser.parse_args()
        var_response = request.form["accession"].replace("[", "")\
            .replace("]", "").replace('"', "").split(",")
        print(var_response)
        single_query = db.session.query(Card).filter(
            Card.plasmid_id.in_(var_response)).all()
        return single_query

class GetPlasmidFinder(Resource):
    @marshal_with(card_field)
    def post(self):
        # Put req_parser inside get function. Only this way it parses the request.
        #args = req_parser.parse_args()
        var_response = request.form["accession"].replace("[", "")\
            .replace("]", "").replace('"', "").split(",")
        single_query = db.session.query(Database).filter(
            Database.plasmid_id.in_(var_response)).all()
        return single_query

class GetVirulence(Resource):
    @marshal_with(card_field)
    def post(self):
        # Put req_parser inside get function. Only this way it parses the request.
        # args = req_parser.parse_args()
        var_response = request.form["accession"].replace("[", "") \
            .replace("]", "").replace('"', "").split(",")
        single_query = db.session.query(Positive).filter(
            Positive.plasmid_id.in_(var_response)).all()
        return single_query

class GetAccession(Resource):
    @marshal_with(entry_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        records = db.session.query(Plasmid).filter(
            Plasmid.json_entry["name"].astext == args.name
        ).all()
        return records

class GetAccessionRes(Resource):
    @marshal_with(card_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        records = db.session.query(Card).filter(
            Card.json_entry["gene"].astext.contains(args.gene)
        ).all()
        # contains method allows us to query in array that is converted to a
        # string
        return records

class GetAccessionPF(Resource):
    @marshal_with(card_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        records = db.session.query(Database).filter(
            Database.json_entry["gene"].astext.contains(args.gene)
        ).all()
        # contains method allows us to query in array that is converted to a
        # string
        return records

class GetAccessionVir(Resource):
    @marshal_with(card_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        records = db.session.query(Positive).filter(
            Positive.json_entry["gene"].astext.contains(args.gene)
        ).all()
        # contains method allows us to query in array that is converted to a
        # string
        return records

class GetAccessionTaxa(Resource):
    @marshal_with(entry_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        records = db.session.query(Plasmid).filter(
            Plasmid.json_entry["taxa"].astext.contains(args.taxa)
        ).all()
        # contains method allows us to query in array that is converted to a
        # string
        return records

class GetPlasmidName(Resource):
    @marshal_with(entry_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser.parse_args()
        # This queries if input plasmid name is present in db
        # func.lower() function from sqalchemy allows the user to make case insensitive searches
        records = db.session.query(Plasmid).filter(func.lower(
            Plasmid.json_entry["plasmid_name"].astext) == func.lower(
            args.plasmid_name)).first()
        # contains method allows us to query in array that is converted to a
        # string
        return records