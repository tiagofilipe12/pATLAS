#!/usr/bin/env python3

# This actually starts the app
from db_manager.db_app import app

#Debug mode should never be used in a production environment!
app.run(debug=True, threaded=True)
