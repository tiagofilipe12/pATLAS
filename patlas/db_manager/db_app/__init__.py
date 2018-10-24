from flask import Flask
from flask_sqlalchemy import SQLAlchemy
# from flask_marshmallow import Marshmallow
import os

# defines some key variables
app = Flask(__name__)
app.config.from_pyfile(os.path.join('..', 'config_default.py'))
db = SQLAlchemy(app)

# ma = Marshmallow(app)

# loads required files to be used
try:
    from db_manager.db_app import views, models, resources, api
    from db_manager.cron_delete import super_delete
except ImportError as e:
    try:
        from db_app import views, models, resources, api
        from cron_delete import super_delete
    except ImportError as e:
        from patlas.db_manager.db_app import views, models, resources, api
        from patlas.db_manager.cron_delete import super_delete

# starts the schedule for removing old entries from the psql database that
# stores JSON files from other applications that submit a post request to
# UrlDatabase model. This will in fact also delete entries in FastaDownload
# that are older than 15 minutes.
super_delete(86400)
