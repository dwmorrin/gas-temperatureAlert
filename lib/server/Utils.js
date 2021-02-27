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
 * Appends a row of data to the database Sheet
 * @param  {...string|number|Date} data
 */
function log(...data) {
  new Database(env.sheet).log(...data);
}
