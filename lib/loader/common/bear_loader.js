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

  getBearPath () {

  }

  getLoadUnits () {
    if (this.dirs) {
      return this.dirs
    }

    const dirs = this.dirs = []

    // framework or egg path
    for (const bearPath of this.bearPaths) {
      dirs.push({
        path: bearPath,
        type: 'framework'
      })
    }

    // application
    dirs.push({
      path: this.options.baseDir,
      type: 'app'
    })

    debug('Loaded dirs %j', dirs)
    return dirs
  }
}

module.exports = BearLoader
