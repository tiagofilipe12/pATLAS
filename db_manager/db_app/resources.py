from models import Plasmid, Card, Positive, Database
from db_app import db
from flask_restful import Resource, reqparse
from flask import request, jsonify

#defining reqparse arguments

req_parser = reqparse.RequestParser()
req_parser.add_argument('accession', dest='accession', type=str, help='Accession number to be queried')
args = req_parser.parse_args()
        
## define all resources

class testresources(Resource):
    def get(self):
        return{ "hello":"world" }

class GetSpecies(Resource):
    def get(self):
        
        #object is not serializable
        species_query = db.session.query(Plasmid).filter(Plasmid.plasmid_id == args.accession).first()
        return species_query



