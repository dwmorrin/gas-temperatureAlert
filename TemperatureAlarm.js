class TemperatureAlarm {
  constructor() {
    this.properties = PropertiesService.getScriptProperties();
  }

  get tripped() {
    return this.properties.getProperty("tripped");
  }

  set tripped(isTripped) {
    if (isTripped) this.properties.setProperty("tripped", "true");
    else this.properties.deleteProperty("tripped");
  }
}
