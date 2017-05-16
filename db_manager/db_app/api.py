from flask_restful import Api
from db_app import app
from resources import testresources

## start api
api = Api(app)

api.add_resource(testresources, "/test2")