#!/usr/bin/env python2

# This actually starts the app
from db_app import app

#Debug mode should never be used in a production environment!
app.run(debug=True)
