## the actual file that does the structure to be imported in the database

try:
    from db_manager.db_app import db
except ImportError:
    try:
        from db_app import db
    except ImportError:
        from patlas.db_manager.db_app import db

from sqlalchemy.dialects.postgresql import JSON


class Plasmid(db.Model):
    __tablename__ = "plasmids"
    plasmid_id = db.Column(db.String, primary_key=True)
    json_entry = db.Column(JSON)

    def __repr__(self):
        return "<Plasmid %r>" % (self.json_entry)

## in order to add an entry to the database one should use something like the example below

# models.Plasmid(plasmid_id="1345", json=json.dumps({"names":"buh", "distances":{"gi_1":"21388213", "gi_2":"398393"}}))
# db.session.add(row)
# db.session.commit()


class Card(db.Model):
    __tablename__ = "card"
    plasmid_id = db.Column(db.String, primary_key=True)
    json_entry = db.Column(JSON)

    def __repr__(self):
         return "<Card %r>" % (self.json_entry)


class Positive(db.Model):
    __tablename__ = "positive"
    plasmid_id = db.Column(db.String, primary_key=True)
    json_entry = db.Column(JSON)

    def __repr__(self):
         return "<Positive %r>" % (self.json_entry)


class Database(db.Model):
    __tablename__ = "database"
    plasmid_id = db.Column(db.String, primary_key=True)
    json_entry = db.Column(JSON)

    def __repr__(self):
        return "<Database %r>" % (self.json_entry)


class SequenceDB(db.Model):
    __tablename__ = "sequence_db"
    plasmid_id = db.Column(db.String, primary_key=True)
    sequence_entry = db.Column(db.String)

    def __repr__(self):
        return "<SequenceDB %r>" % (self.sequence_entry)
