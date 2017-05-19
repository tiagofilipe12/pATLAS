from flask_restful import Api
from db_app import app
from resources import testresources, GetSpecies

## start api
api = Api(app)

## add resources to api upon being called
api.add_resource(testresources, '/test2')

api.add_resource(GetSpecies, '/api/getspecies/', endpoint='get_species')