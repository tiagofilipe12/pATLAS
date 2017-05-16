from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_marshmallow import Marshmallow
import os

app = Flask(__name__)
app.config.from_pyfile(os.path.join('..', 'config_default.py'))
db = SQLAlchemy(app)
ma = Marshmallow(app)

import views, models, resources, api
