#!/bin/sh
# Start HTTP server, giving access to current directory via
# http://localhost:8080/

# Python 2.x
python -m SimpleHTTPServer 8080

# Python 3.x
#python -m http.server 8080
