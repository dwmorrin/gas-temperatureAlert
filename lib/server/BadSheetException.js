class BadSheetException {
  constructor(id, name) {
    this.message = `Could not open sheet with id "${id}", name "${name}"`;
  }
}
