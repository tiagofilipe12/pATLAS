from models import Plasmid, Card, Positive, Database
from db_app import ma
from flask_restful import Resource

# marshmallow classes
class PlasmidSchema(ma.ModelSchema):
    class Meta:
        model = Plasmid

class CardSchema(ma.ModelSchema):
    class Meta:
        model = Card

class PositiveSchema(ma.ModelSchema):
    class Meta:
        model = Positive

class DatabaseSchema(ma.ModelSchema):
    class Meta:
        model = Database



## define resources

class testresources(Resource):
    def get(self):
        return{"hello":"world"}

