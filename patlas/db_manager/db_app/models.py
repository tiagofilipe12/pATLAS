# the actual file that does the structure to be imported in the database

try:
    from db_manager.db_app import db
except ImportError:
    try:
        from db_app import db
    except ImportError:
        from patlas.db_manager.db_app import db

from sqlalchemy.dialects.postgresql import JSON
from datetime import datetime


class Plasmid(db.Model):
    __tablename__ = "plasmids"
    plasmid_id = db.Column(db.String, primary_key=True)
    json_entry = db.Column(JSON)

    def __repr__(self):
        return "<Plasmid %r>" % (self.json_entry)

# in order to add an entry to the database one should use something like
# the example below
# models.Plasmid(plasmid_id="1345", json=json.dumps({"names":"buh",
# "distances":{"gi_1":"21388213", "gi_2":"398393"}}))
# db.session.add(row)
# db.session.commit()


class Card(db.Model):
    """
    Class that defines the structure to use for the resistance database. It now
    stores entries for the card and resfinder database.
    """

    __tablename__ = "card"
    plasmid_id = db.Column(db.String, primary_key=True)
    json_entry = db.Column(JSON)

    def __repr__(self):
         return "<Card %r>" % (self.json_entry)


class Positive(db.Model):
    """
    Class that defines the structure to use for the virulence database. It now
    stores entries for the vfdb database.
    """
    __tablename__ = "positive"
    plasmid_id = db.Column(db.String, primary_key=True)
    json_entry = db.Column(JSON)

    def __repr__(self):
         return "<Positive %r>" % (self.json_entry)


class Database(db.Model):
    """
    Class that defines the structure to use for the plasmidfinder database.
    """

    __tablename__ = "database"
    plasmid_id = db.Column(db.String, primary_key=True)
    json_entry = db.Column(JSON)

    def __repr__(self):
        return "<Database %r>" % (self.json_entry)


class SequenceDB(db.Model):
    """
    Database model that is used to stored sequence strings in the databases.
    That can be then used to download sequences from pATLAS.
    """

    __tablename__ = "sequence_db"
    plasmid_id = db.Column(db.String, primary_key=True)
    sequence_entry = db.Column(db.String)

    def __repr__(self):
        return "<SequenceDB %r>" % (self.sequence_entry)


class UrlDatabase(db.Model):
    """
    The class that configures the psql database entries that allow to store
    information from JSON files sent via post request and that are accessible
    through GET method in pATLAS.
    """
    __tablename__ = "url_database"
    id = db.Column(db.String, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    json_entry = db.Column(JSON)


class FastaDownload(db.Model):
    """
    The class that configures the psql database entries that allow to store
    information from JSON files sent via post request and that are accessible
    through GET method in pATLAS.
    """
    __tablename__ = "fasta_database"
    unique_id = db.Column(db.String, primary_key=True)
    timestamp = db.Column(db.DateTime, default=datetime.utcnow)
    accessions = db.Column(db.String)


class MetalDatabase(db.Model):
    """
    The class that configures the psql database entries for metal resistance
    databases. For now it only has entries for the bacmet database.
    """
    __tablename__ = "metal_database"
    plasmid_id = db.Column(db.String, primary_key=True)
    json_entry = db.Column(JSON)

    def __repr__(self):
         return "<MetalDatabase %r>" % (self.json_entry)
