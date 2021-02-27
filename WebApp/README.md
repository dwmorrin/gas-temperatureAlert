This directory is synced with Google Apps Script via [clasp](https://github.com/google/clasp).

index.js is the entry point (contains doGet and doPost).
All other js needs to be built by concatenating all files in lib/server in a bundle.js here.
(Should be handled in the makefile.)

This web app should run as the user accessing the app, and should use the data Spreadsheet
permissions to determine authorization.
