import os
basedir = os.path.abspath(os.path.dirname(__file__))

## or 'postgresql://localhost/plasmid_db'
SQLALCHEMY_DATABASE_URI = "postgresql:///plasmid_db"
SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, "db_repository")