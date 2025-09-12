// this class permits to create the class on dynamic way
class ClassAdBuilder {
  constructor(fields = {}) {
    this.fields = fields;
  }

  setFields(fields) {
    this.fields = { ...this.fields, ...fields };
    return this;
  }

  build() {
    return Object.entries(this.fields)
      .filter(([_, v]) => v !== undefined && v !== null && v !== "")
      .map(([k, v]) => `${k} = ${v}`)
      .join("\n");
  }
}

export default ClassAdBuilder;
