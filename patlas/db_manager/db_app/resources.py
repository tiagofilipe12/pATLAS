
from flask_restful import Resource, reqparse, fields, marshal_with, request
from sqlalchemy import func

try:
    from db_manager.db_app import db
    from db_manager.db_app.models import Plasmid, Card, Database, Positive, \
        MetalDatabase
except ImportError:
    try:
        from db_app import db
        from db_app.models import Plasmid, Card, Database, Positive, \
            MetalDatabase
    except ImportError:
        from patlas.db_manager.db_app import db
        from patlas.db_manager.db_app.models import Plasmid, Card, Database, \
            Positive, MetalDatabase

# Defines response fields

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
    # parse only the json required? Cannot use nested method because entry in
    # database is a string with a json inside
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

# define reqparse arguments

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

req_parser.add_argument("perc_hashes", dest="perc_hashes", type=float,
                        help="the percentage of hashes to be queried")


class GetSpecies(Resource):
    @marshal_with(entry_field)
    def post(self):
        var_response = request.form["accession"].replace("[", "")\
            .replace("]", "").replace('"', "").split(",")
        single_query = db.session.query(Plasmid).filter(
            Plasmid.plasmid_id.in_(var_response)).all()
        return single_query


class GetResistances(Resource):
    @marshal_with(card_field)
    def post(self):
        var_response = request.form["accession"].replace("[", "")\
            .replace("]", "").replace('"', "").split(",")
        single_query = db.session.query(Card).filter(
            Card.plasmid_id.in_(var_response)).all()
        return single_query


class GetPlasmidFinder(Resource):
    @marshal_with(card_field)
    def post(self):
        var_response = request.form["accession"].replace("[", "")\
            .replace("]", "").replace('"', "").split(",")
        single_query = db.session.query(Database).filter(
            Database.plasmid_id.in_(var_response)).all()
        return single_query


class GetVirulence(Resource):
    @marshal_with(card_field)
    def post(self):
        # Put req_parser inside get function. Only this way it parses the
        # request.
        var_response = request.form["accession"].replace("[", "") \
            .replace("]", "").replace('"', "").split(",")
        single_query = db.session.query(Positive).filter(
            Positive.plasmid_id.in_(var_response)).all()
        return single_query


class GetMetal(Resource):
    @marshal_with(card_field)
    def post(self):
        var_response = request.form["accession"].replace("[", "")\
            .replace("]", "").replace('"', "").split(",")
        single_query = db.session.query(MetalDatabase).filter(
            MetalDatabase.plasmid_id.in_(var_response)).all()
        return single_query


class GetAccession(Resource):
    @marshal_with(entry_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the
        # request.
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
        # Put req_parser inside get function. Only this way it parses the
        # request.
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
        # Put req_parser inside get function. Only this way it parses the
        # request.
        args = req_parser.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        parsed_gene = args.gene.replace('"', '')    # TODO parser for new plasmidfinder db
        records = db.session.query(Database).filter(
            Database.json_entry["gene"].astext.contains(parsed_gene)
        ).all()
        # contains method allows us to query in array that is converted to a
        # string
        return records


class GetAccessionVir(Resource):
    @marshal_with(card_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the
        # request.
        args = req_parser.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        records = db.session.query(Positive).filter(
            Positive.json_entry["gene"].astext.contains(args.gene)
        ).all()
        # contains method allows us to query in array that is converted to a
        # string
        return records


class GetAccessionMetal(Resource):
    @marshal_with(card_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the
        # request.
        args = req_parser.parse_args()
        # This queries name object in json_entry and retrieves an array with
        # all objects that matched the args (json_entry, plasmid_id)
        records = db.session.query(MetalDatabase).filter(
            MetalDatabase.json_entry["gene"].astext.contains(args.gene)
        ).all()
        # contains method allows us to query in array that is converted to a
        # string
        return records


class GetAccessionTaxa(Resource):
    @marshal_with(entry_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the
        # request.
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
        # Put req_parser inside get function. Only this way it parses the
        # request.
        args = req_parser.parse_args()
        # This queries if input plasmid name is present in db
        # func.lower() function from sqalchemy allows the user to make case
        # insensitive searches
        records = db.session.query(Plasmid).filter(func.lower(
            Plasmid.json_entry["plasmid_name"].astext) == func.lower(
            args.plasmid_name)).first()
        # contains method allows us to query in array that is converted to a
        # string
        return records


class GetAccessionHashes(Resource):
    # @marshal_with(entry_field)
    def get(self):
        # Put req_parser inside get function. Only this way it parses the
        # request.
        args = req_parser.parse_args()

        # convert values to decimal instead of percentages and the convert it
        # back to string
        query_hash_cutoff = float(args.perc_hashes) * 0.01

        # Fetch all entries
        records = db.session.query(Plasmid).all()

        # this is the list that will be returned to front-end
        resulting_obj = {}

        # iterate through all database records
        for record in records:

            linkList = record.json_entry["significantLinks"]

            # checks if linkList is empty, i.e., if the current plasmid_id has
            # links
            if linkList:

                # iterate through each link
                for link in linkList:
                    linked_accession = link["accession"]
                    perc_hashlink = link["percentage_hashes"]
                    if perc_hashlink >= query_hash_cutoff:
                        if record.plasmid_id in resulting_obj.keys():
                            resulting_obj[record.plasmid_id].append(
                                linked_accession)
                        else:
                            resulting_obj[record.plasmid_id] = [
                                linked_accession]

        return resulting_obj
