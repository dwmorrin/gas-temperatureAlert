# DHTXXD Alert

Web app to collect data from a DHTXXD sensor attached to a Raspberry Pi.

Data is recorded in a Sheet.

If the temperature reading is above a threshold, an email alert is sent.

## Usage

Deploy this as a public web app. Not commited to git is a file named `env.js`
that should look like

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

See `reading.bash` for an example shell script for the Raspberry Pi to post the
data to the web app.

See `dhtxxd.service` for an example systemd service file to run the temperature
readings automatically on boot.
