const Base = require('./base')

class Plugin extends Base {
  load (opt) {
    return this.loader.service.getT()
  }
}

module.exports = Plugin
