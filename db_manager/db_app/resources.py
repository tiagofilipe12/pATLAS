from models import Plasmid, Card, Positive, Database
from db_app import db
from flask_restful import Resource, reqparse, fields, marshal_with

## Defines response fields

entry_field = {
    'length': fields.Integer,
    'plasmid_name': fields.String,
    'name': fields.String
}

## defining reqparse arguments

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
        return single_query



