class Database {
  constructor({ id = "", name = "" }) {
    const ss = SpreadsheetApp.openById(id);
    if (!ss) throw new BadSheetException(id, name);
    const sheet = ss.getSheetByName(name);
    if (!sheet) throw new BadSheetException(id, name);
    this.sheet = sheet;
  }

  /**
   * @param {...string|number|Date} data
   */
  log(...data) {
    this.sheet.appendRow(data);
  }
}
