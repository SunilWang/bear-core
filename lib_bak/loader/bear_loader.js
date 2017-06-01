const assert = require('assert')
const debug = require('debug')('bear-core')
const ContextLoader = require('./context_loader')
const FileLoader = require('./file_loader')
const fs = require('fs')

class BearLoader {
  constructor (options) {
    this.options = options
    assert(fs.existsSync(this.options.baseDir), `${this.options.baseDir} not exists`)
    assert(this.options.app, 'options.app is required')
    assert(this.options.logger, 'options.logger is required')
    debug('EggLoader options %j', options)

    this.app = this.options.app
  }

  loadToContext (directory, property, opt) {
    opt = Object.assign({}, {
      directory,
      property,
      inject: this.app
    }, opt)
    new ContextLoader(opt).load()
  }

  loadToApp (directory, property, opt) {
    const target = this.app[property] = {}
    opt = Object.assign({}, {
      directory,
      target,
      inject: this.app
    }, opt)
    new FileLoader(opt).load()
  }
}

const loaders = [
  require('../mixin/service'),
  require('../mixin/controller')
]

for (const loader of loaders) {
  Object.assign(BearLoader.prototype, loader)
}

module.exports = BearLoader
