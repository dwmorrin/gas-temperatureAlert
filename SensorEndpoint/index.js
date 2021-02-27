// GET requests enter here
// No GET functionality enabled
function doGet() {
  return errorResponse("nothing here");
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
          env.app.url,
          "For more info, click here to go to the web app."
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
