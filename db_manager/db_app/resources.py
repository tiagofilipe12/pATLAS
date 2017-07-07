from models import Plasmid, Card, Positive, Database
from . import db
from flask_restful import Resource, reqparse, fields, marshal_with
from flask import jsonify

## Defines response fields

# Nested fields avoid the necessity to call JSON.parse() in js which often
# renders problems with double quoting from python
nested_entry_fields = {
    "length": fields.String,
    "plasmid_name": fields.String,
    "name": fields.String,
    "significantLinks": fields.String
}


entry_field = {
    'plasmid_id': fields.String,
    # parse only the json required? Cannot use nested method because entry in database is a string with a json inside
    'json_entry': fields.Nested(nested_entry_fields)
}



## define reqparse arguments

req_parser = reqparse.RequestParser()
req_parser.add_argument('accession', dest='accession', type=str, help='Accession number to be queried')

## define all resources

class testresources(Resource):
    def get(self):
        return{ "hello":"world" }

class GetSpecies(Resource):
    
    @marshal_with(entry_field)
    def get(self):        
        #Put req_parser inside get function. Only this way it parses the request.
        args = req_parser.parse_args()
        single_query = db.session.query(Plasmid).filter(Plasmid.plasmid_id == args.accession).first()
        #print single_query.json_entry
        #json_object = json.loads(single_query.json_entry)
        #print json_object[u'name']
        return single_query

req_parser_2 =reqparse.RequestParser()
req_parser_2.add_argument('name', dest='name', type=str, help='bla')

class GetAccession(Resource):

    @marshal_with(entry_field)

    def get(self):
        # Put req_parser inside get function. Only this way it parses the request.
        args = req_parser_2.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        records = db.session.query(Plasmid).filter(
            Plasmid.json_entry['name'].astext == args.name
        ).all()
        return records



