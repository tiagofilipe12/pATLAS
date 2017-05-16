from flask_restful import Api
from db_app import app
from resources import testresources

## start api
api = Api(app)

## add resources to api upon being called
api.add_resource(testresources, "/test2")