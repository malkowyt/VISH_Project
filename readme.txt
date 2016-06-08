D3 Visualization Toolkit
========================

Volker Ahlers, Hochschule Hannover, 2012


Example Files
-------------

bubbles_simple.html: bubble chart as presented in the lecture

bubbles.html: extended bubble chart

- SVG parameters determined from data

- alternative event callback function to modify data


Opening a Visualization File
----------------------------

For security reasons, a running HTTP server is required to load local files
in JavaScript.

1. Open a console (shell) in directory containing D3 project files.

2. Start a HTTP server, which is required for loading local files.

   - Python 2.7 (or lower):
   
     python -m SimpleHTTPServer 8080

   - Python 3.0 (or higher):

     python -m http.server 8080     
   
   - Alternatively, use shell scripts for Windows and Linux, respectively:
   
     start_http_server.bat
     start_http_server.sh
     
   - Python is installed in most Linux distributions.
     Windows installation files are available at
     
     http://www.python.org/download/
     
     After installation, add the Python directory to the PATH environment
     variable.
     
3. Open browser and enter address

   http://localhost:8080/
   
4. Select HTML file with D3 visualization.

 