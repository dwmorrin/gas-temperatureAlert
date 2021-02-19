/**
 * high level model of the temperature alarm system.
 * An alarm system should have a state made up of:
 * - tripped: true means the alarm is "ringing" and requires a manual reset
 * - fault: true means the alarm may be broken and requires manual intervention
 */
class TemperatureAlarm {
  constructor() {
    this.properties = PropertiesService.getScriptProperties();
  }

  get fault() {
    return this.properties.getProperty("fault");
  }

  set fault(faultDetected) {
    if (faultDetected) this.properties.setProperty("fault", faultDetected);
    else this.properties.deleteProperty("fault");
  }

  get tripped() {
    return this.properties.getProperty("tripped");
  }

  set tripped(isTripped) {
    if (isTripped) this.properties.setProperty("tripped", "true");
    else this.properties.deleteProperty("tripped");
  }
}
