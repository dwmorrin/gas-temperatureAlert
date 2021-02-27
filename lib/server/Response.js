/**
 * Response can be JSON for communicating with the temperature sensor CLI,
 * or a web page to see charted data and control the alarm settings.
 */
class Response {
  /**
   *
   * @param {{alarm: TemperatureAlarm, database: Database, JSON: any}} param0
   */
  constructor({ alarm, database, JSON } = {}) {
    this.alarm = alarm;
    this.database = database;
    this._JSON = JSON || {};
  }

  /**
   * @returns {GoogleAppsScript.Content.TextOutput} JSON text
   */
  get JSON() {
    return ContentService.createTextOutput(
      JSON.stringify(this._JSON)
    ).setMimeType(ContentService.MimeType.JSON);
  }

  get webPage() {
    const page = HtmlService.createTemplateFromFile("WebPageTemplate");
    page.alarm = this.alarm || new TemperatureAlarm();
    page.database = this.database || new Database(env.sheet);
    page.env = env;
    return page.evaluate().setTitle("Temperature Alert");
  }
}
