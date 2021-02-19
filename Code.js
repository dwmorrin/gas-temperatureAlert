function main(rawRequest) {
  try {
    const { error, reset, temperature } = processRawRequest(rawRequest);
    if (error) {
      // check hardware, turn off this system until manually restarted
      logError({ message: "temperature sensor failure" });
      const email = new Email(env.email);
      email.subject = "Temperature alert: sensor failure";
      email.body = `Sensor reported error code "${error}".  Check hardware.`;
      email.send();
      return response(); // tell client to stop sending messages
    }
    if (reset) {
      const alarm = new TemperatureAlarm();
      alarm.tripped = false;
      return response(); // client is email, nothing to say
    }
    const db = new Database(env.sheet);
    db.log(new Date(), temperature); // record temperature readings
    if (Number(temperature) > env.threshold) {
      const alarm = new TemperatureAlarm();
      if (alarm.tripped) return response(); // ask client to stop?
      alarm.tripped = true;
      const email = new Email(env.email);
      email.body = `Temperature reading: ${temperature}, above limit.`;
      email.appendLink(
        getUrlWithQueryParameters({ reset: true }),
        "Click to reset alert."
      );
      email.send();
    }
    return response(); // HTTP response for client, keep sending updates
  } catch (error) {
    if (error instanceof BadRequestException)
      // assume not a good client
      return errorResponse(error.message);
    else if (error instanceof BadSheetException) {
      logError(error);
      const email = new Email(env.email);
      email.subject = "Temperature alert: could not access sheet";
      email.body = error.message;
      email.send();
      return response(); // tell client to stop sending messages for now
    }
    logError(error);
    return errorResponse("?");
  }
}

// GET requests enter here
function doGet(rawRequest) {
  return main(rawRequest);
}

// POST requests enter here
function doPost(rawRequest) {
  return main(rawRequest);
}

/**
 * @param {{[k: string]: string}} parameters
 * @returns {string} URL of web app with added query parameters
 */
function getUrlWithQueryParameters(parameters) {
  ScriptApp.getService().getUrl() +
    "?" +
    Object.entries(parameters).map((pairs) => pairs.join("=").join("&"));
}

// checks for request data and returns request body or throws error
function processRawRequest(rawRequest) {
  if (!rawRequest) throw new BadRequestException("no request");
  // GET reset=true will set tripped to false
  // this parameter is embedded in a link sent via email when alarm is tripped
  if (
    rawRequest.parameter &&
    rawRequest.parameter.reset &&
    rawRequest.parameter.reset === "true"
  ) {
    return { reset: true };
  }
  if (!rawRequest.postData || !rawRequest.postData.contents)
    throw new BadRequestException("no data");
  const body = tryJsonParse(rawRequest.postData.contents);
  if (!body) throw new BadRequestException("could not parse data");
  return body;
}

// Helper utilities

function tryJsonParse(s) {
  try {
    return JSON.parse(s);
  } catch (e) {
    return null;
  }
}

// on success, returns this to client
function response() {
  return new Response("OK").textOutput;
}

// on error, returns this to client
function errorResponse(message) {
  return new Response(message).textOutput;
}

// Just putting the default error into the console just displays the name
// This tries to unpack the most useful info, falling back to less useful
function logError(error) {
  console.log(error.stack || error.message || error.name);
}
