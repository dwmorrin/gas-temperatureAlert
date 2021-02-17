#!/bin/bash
# using DHTXXD, see http://abyz.me.uk/rpi/pigpio/code/DHTXXD.zip
# on Raspberry Pi with sensor connected to GPIO 21

gpioPin=21

# reading should have an error code, temperature in C, and humidity
# output of DHTXXD is read into an array
reading=("$(DHTXXD -g$gpioPin)")

# put reading into JSON
data='{'
if [[ ${reading[0]} != 0 ]]; then
  data+='"error":'"${reading[0]}}"
else
  data+='"temperature":'"${reading[1]}}"
fi
# POST reading to URL
url="https://script.google.com/YourScriptURL/exec"
curl -L -H "Content-Type: application/json" -d '' "$url"
