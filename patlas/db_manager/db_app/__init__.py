from flask import Flask
from flask_sqlalchemy import SQLAlchemy
#from flask_marshmallow import Marshmallow
import os

#defines some key variables
app = Flask(__name__)
app.config.from_pyfile(os.path.join('..', 'config_default.py'))
db = SQLAlchemy(app)
#ma = Marshmallow(app)

#loads required files to be used
try:
    from db_manager.db_app import views, models, resources, api
except ImportError:
    try:
        from db_app import views, models, resources, api
    except ImportError:
        from patlas.db_manager.db_app import views, models, resources, api
# import views, models, resources, api
