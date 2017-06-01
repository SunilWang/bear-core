const assert = require('assert')

class Base {
  constructor (options = {}) {
    assert(options.bearLoader, 'options.bearLoader is required')

    this.bearLoader = options.bearLoader
    this.options = Object.assign({}, this.bearLoader.options, options)
  }

  load () {
    throw new Error('load function must be overwritten!')
  }
}

module.exports = Base
