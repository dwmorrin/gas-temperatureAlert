This directory is synced with Google Apps Script via [clasp](https://github.com/google/clasp).

index.js is the entry point (contains doGet and doPost).
all other js needs to be built by concatenating all files in lib/server in a bundle.js here.
(should be handled in the makefile.)

This Web App is a public app that temperature sensors can report temperatures to.

Care should be taken to not allow the HTTP request to do anything other than append temperature data to sheets.
