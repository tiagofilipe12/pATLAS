
from flask_restful import Resource, reqparse, fields, marshal_with

try:
    from db_app import db
    from db_app.models import Plasmid, Card, Database
except ImportError:
    from patlas.db_manager.db_app import db
    from patlas.db_manager.db_app.models import Plasmid, Card, Database
#from flask import jsonify

## Defines response fields

# Nested fields avoid the necessity to call JSON.parse() in js which often
# renders problems with double quoting from python

nested_entry_fields = {
    "length": fields.String,
    "plasmid_name": fields.String,
    "name": fields.String,
    "significantLinks": fields.String,
    "taxa": fields.String
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
req_parser.add_argument("accession", dest="accession", type=str, help="Accession number to be queried")

## define all resources

class GetSpecies(Resource):
    @marshal_with(entry_field)
    def get(self):        
        #Put req_parser inside get function. Only this way it parses the request.
        args = req_parser.parse_args()
        single_query = db.session.query(Plasmid).filter(
            Plasmid.plasmid_id == args.accession).first()
        #print single_query.json_entry
        #json_object = json.loads(single_query.json_entry)
        #print json_object[u'name']
        return single_query

class GetResistances(Resource):
    @marshal_with(card_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser.parse_args()
        single_query = db.session.query(Card).filter(
            Card.plasmid_id == args.accession).first()
        return single_query

class GetPlasmidFinder(Resource):
    @marshal_with(card_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser.parse_args()
        single_query = db.session.query(Database).filter(
            Database.plasmid_id == args.accession).first()
        return single_query

# define more reqparse arguments for GetAccession classe resource

req_parser_2 = reqparse.RequestParser()
req_parser_2.add_argument("name", dest="name", type=str, help="taxa "
                                                              "to be queried")

class GetAccession(Resource):
    @marshal_with(entry_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser_2.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        records = db.session.query(Plasmid).filter(
            Plasmid.json_entry["name"].astext == args.name
        ).all()
        return records


# define more reqparse arguments for GetAccession classe resource

req_parser_3 = reqparse.RequestParser()
req_parser_3.add_argument("gene", dest="gene", type=str, help="gene "
                                                              "to be queried")

class GetAccessionRes(Resource):
    @marshal_with(entry_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser_3.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        records = db.session.query(Card).filter(
            Card.json_entry["gene"].astext == args.name
        ).all()
        return records

