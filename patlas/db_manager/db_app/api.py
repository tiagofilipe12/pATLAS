from flask_restful import Api
from db_app import app
from db_app.resources import GetSpecies, GetAccession

## start api
api = Api(app)

## add resources to api upon being called

api.add_resource(GetSpecies, "/api/getspecies/", endpoint="get_species")

api.add_resource(GetAccession, "/api/getaccession/", endpoint="get_accession")