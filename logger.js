class Logger {
  constructor(prefix) {
    this.prefix = prefix;
  }

  _log(level, message, ...data) {
    console.log(`${new Date().toLocaleTimeString()} ${level.toUpperCase()}: [${this.prefix}] ${message}`, ...data);
  }
}

['info', 'warn', 'error'].forEach((level) => {
  Logger.prototype[level] = function(message, ...data) {
    this._log(level, message, ...data);
  };
});

module.exports = Logger;
