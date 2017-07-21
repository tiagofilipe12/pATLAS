#!/usr/bin/env python

# This actually starts the app
from db_app import app

#Debug mode should never be used in a production environment!
app.run(debug=True, threaded=True)
