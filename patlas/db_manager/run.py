#!/usr/bin/env python3

# This actually starts the app
try:
    from db_app import app
except ImportError as e:
    from patlas.db_manager.db_app import app

#Debug mode should never be used in a production environment!
app.run(debug=True, threaded=True)
