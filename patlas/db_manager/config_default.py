import os
import sys
basedir = os.path.abspath(os.path.dirname(__file__))

# try except statement to set database name if none is provided then use default
# 'plasmid_db_stable'.
try:
    db_name = sys.argv[1]
except IndexError:
    db_name = "plasmid_db_stable"

# or 'postgresql://localhost/plasmid_db'
SQLALCHEMY_DATABASE_URI = "postgresql:///{}".format(db_name)

SQLALCHEMY_MIGRATE_REPO = os.path.join(basedir, "db_repository")