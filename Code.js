// GET requests enter here
function doGet(rawRequest) {
  const { reset } = processGetRequest(rawRequest);
  const alarm = new TemperatureAlarm();
  if (reset) alarm.tripped = false;
  return webPage(alarm);
}

// POST requests enter here
function doPost(rawRequest) {
  const alarm = new TemperatureAlarm();
  try {
    const { error, temperature } = processPostRequest(rawRequest);

    if (error) {
      if (alarm.fault) {
        // we're already aware there's an error
        return response();
      }
      // new fault detected, may want an email or may want to catch several
      // before sounding an alert, TBD
      alarm.fault = error;
      logError({ message: `temperature sensor failure code ${error}` });
      return response();
    } else {
      // no fault detected... should we clear a previously set one?
      if (alarm.fault) {
        console.log("clearing previous alarm");
        alarm.fault = false;
      }
    }

    log(new Date(), temperature);

    // Check temperature and sound alarm if threshold exceeded
    if (Number(temperature) > env.threshold.alarm) {
      if (!alarm.tripped) {
        alarm.tripped = true;
        const email = new Email(env.email);
        email.body = `Temperature reading: ${temperature}, above limit.`;
        email.appendLink(
          getUrlWithQueryParameters({ reset: true }),
          "Click to reset alert."
        );
        email.send();
      }
    } else if (Number(temperature) <= env.threshold.reset) {
      // room has sufficiently cooled to automatically reset the alarm
      if (alarm.tripped) alarm.tripped = false;
    }
    return response();
  } catch (error) {
    if (error instanceof BadRequestException)
      // assume not a good client
      return errorResponse(error.message);
    else if (error instanceof BadSheetException) {
      logError(error);
      if (alarm.fault != error.message) {
        // we only need to get this notification once
        alarm.fault = error.message;
        const message = "could not access sheet";
        const email = new Email(env.email);
        email.subject = `Temperature alert: ${message}`;
        email.body = error.message;
        email.send();
      }

      return errorResponse(message);
    }

    logError(error);
    return errorResponse("?");
  }
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

function processGetRequest(rawRequest) {
  // GET reset=true will set tripped to false
  // this parameter is embedded in a link sent via email when alarm is tripped
  if (
    rawRequest.parameter &&
    rawRequest.parameter.reset &&
    rawRequest.parameter.reset === "true"
  ) {
    return { reset: true };
  }
  return {};
}

/**
 * @param {{postData: {contents: {[k: string]: string}}}} rawRequest
 * @returns {{[k: string]: string|number}
 * @throws BadRequestException
 */
function processPostRequest(rawRequest) {
  if (!rawRequest) throw new BadRequestException("no request");
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

/**
 * @param {{[k: string]: string}?} body Object to be JSON serialized
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function response(body = { status: "OK" }) {
  return new Response(body).JSON;
}

/**
 * @param {string} message
 * @returns {GoogleAppsScript.Content.TextOutput} JSON response
 */
function errorResponse(message) {
  return new Response({ error: true, message }).JSON;
}

// Just putting the default error into the console just displays the name
// This tries to unpack the most useful info, falling back to less useful
function logError(error) {
  console.log(error.stack || error.message || error.name);
}

/**
 * @param {TemperatureAlarm} alarm
 */
function webPage(alarm) {
  return new Response({ alarm }).webPage;
}

/**
 * Appends a row of data to the database Sheet
 * @param  {...string|number|Date} data
 */
function log(...data) {
  new Database(env.sheet).log(...data);
}
