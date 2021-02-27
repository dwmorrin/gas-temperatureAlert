# DHTXXD Alert

Web app to collect data from a DHTXXD sensor attached to a Raspberry Pi.

Data is recorded in a Sheet.

If the temperature reading is above a threshold, an email alert is sent.

## Build

Building is done with `make` and requires something to inline the client JS and CSS files
into a HTML files (limitation of the Google Apps Script web app platform).

Currently using python and the [Beautiful Soup](https://www.crummy.com/software/BeautifulSoup/bs4/doc/)
library to accomplish this chore.

```shell
# install beautiful soup (assuming you have python installed)
pip3 install bs4 # might just be pip install bs4 on your system
wget https://raw.githubusercontent.com/dwmorrin/py-inline-html/master/inline.py
# put this file somewhere in your PATH
# I prefer ~/bin; place it wherever you like
mv inline.py ~/bin/inline && chmod +x ~/bin/inline
```

The other chore, which `make` handles nicely, is sharing code between two web apps.
My preference is for the temperature sensors to not store any credentials on them,
so the sensors report to a public web app. Authorized users can see the data and
control the email alarm system via a private web app. Server code is shared in the
`lib/server` directory, and `make` concatenates all these JavaScript files together
to and copies them into each web app directory.

To push changes to script.google.com, install [`clasp`](https://github.com/google/clasp)

```shell
npm install -g @google/clasp
# if your editor can utilize typescript definitions, also run
npm i
```

`make push` handles pushing to both apps. It does not automatically rebuild the bundles, so run
`make && make push` to do both.

The bundles are not tracked by git.

## Usage

### `env.js`

Not committed to git is a file named `env.js` that should look like

```js
var env = {
  email: {
    to: "your_email@gmail.com",
    subject: "Default subject line",
  },
  sheet: {
    id: "id of sheet",
    name: "name of sheet to record data to",
  },
  threshold: {
    alarm: 25, // degrees C, send alert email if exceeded
    reset: 22, // degrees C, automatically resets alarm if at or below
  },
};
```

and any other private info and customization can be placed in there.
These settings could also be read from a Sheet (probably will migrate to that in an update.)

### SensorEndpoint

Publish SensorEndpoint as a public web app so the sensors don't need any special credentials.
Note: If you are OK with storing credentials on your sensors,
then you don't need to bother with the dual web apps.

### WebApp

Publish WebApp as where the app runs as the authenticated Google user. Use the Sheet permissions
as an authorization system. (Or just allow yourself to access it.)

### Raspberry Pi setup

Currently using Raspberry Pis for the sensors. Certainly cheaper hardware could be used, but
using Pis makes the software for running internet stuff quite easy.

See `pi/reading.bash` for an example shell script for the Raspberry Pi to post the
data to the web app. This repo doesn't cover how to setup the GPIO-to-sensor system, but
the script has a link to a great library and example app that I simply installed, ran, and it
"just worked."

See `pi/dhtxxd.service` for an example systemd service file to run the temperature
readings automatically on boot. See the pigpio library for more info on starting the pigpiod
service as well.
