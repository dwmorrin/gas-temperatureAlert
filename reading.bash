#!/bin/bash
# Temperature & humidity readings logged locally and on the web.
# Intended to be run on boot (via systemd or similar) and run continuously.

# web app returns JSON, requiring `jq` to parse JSON
command -v jq &>/dev/null || {
  echo "$(basename "$0") requires jq, aborting"
  echo 'try "sudo apt-get update && sudo apt-get install jq"'
  exit 1
}

# Using DHTXXD, see http://abyz.me.uk/rpi/pigpio/code/DHTXXD.zip
# on Raspberry Pi with sensor connected to GPIO 21
gpioPin=21

# number of seconds between readings
interval=120

# name of file to keep a local log in case of network issues
logFile=dhtxxd.log
errorLogFile=dhtxxd.error.log

# calculate max size based on choice of interval
maxLines=$((60*60*24*31/interval)) # ~ number of readings in a month
maxLogSize=$((maxLines * 32)) # estimate 32 bytes per line (reading + timestamp)

truncateLog() {
  # get actual number of lines
  read -r lines _ <<< "$(wc -l "$1")"
  # delete the first half of the file
  sed -i -n $((lines/2))',$p' "$1"
}

logToFile() {
  echo "$(date +"%Y-%m-%dT%H:%M:%S") $2" >>"$1"
  logSize=$(stat --printf="%s" "$1")
  ((logSize > maxLogSize)) && truncateLog "$1"
}

postToWebApp() {
  url="https://script.google.com/YourScriptURL/exec"
  # POST reading to URL, follow redirects, set header to JSON
  curl -L -H "Content-Type: application/json" -d "$1" "$url"
}

# reading should have an error code, temperature in Celcius, and % humidity
# defeating stdbuf so output is immediate
stdbuf --output=0 ./DHTXXD -g"$gpioPin" -i"$interval" \
  | while read -r error temperature humidity; do

    logToFile "$logFile" "$error $temperature $humidity"

    if ((error != 0)); then
      response="$(postToWebApp "{\"error\":$error}")"
    else
      response="$(postToWebApp "{\"temperature\":$temperature,\"humidity\":$humidity}")"
    fi

    # existence of error key means an error occured
    error="$(jq -r .error <<<"$response")"
    if [[ -n $error ]]; then
      logToFile "$errorLogFile" "$error"
    fi

  done
