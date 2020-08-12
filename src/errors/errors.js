/**
 * GenericError must be a generic error from db, independently of the db used under the hood
 */
class GenericError {
  constructor(code, name, message) {
    this.code = code;
    this.name = name;
    this.message = message;
  }

  // All errors must have this
  toString() {
    return `${this.name}(${this.code}): ${this.message}`;
  }
}

module.exports = { GenericError };
