const assert = require('assert')
const debug = require('debug')('bear-core')
const fs = require('fs')
const isGeneratorFunction = require('is-generator-function')
const convert = require('koa-convert')
const KoaApplication = require('koa')
const BEAR_LOADER = Symbol.for('bear#loader')

class Bear extends KoaApplication {
  constructor (options = {}) {
    options.baseDir = options.baseDir || process.cwd()

    assert(typeof options.baseDir === 'string', 'options.baseDir required, and must be a string')
    assert(fs.existsSync(options.baseDir), `Directory ${options.baseDir} not exists`)
    assert(fs.statSync(options.baseDir).isDirectory(), `Directory ${options.baseDir} is not a directory`)
    super()

    this._options = options
    this.console = console

    const Loader = this[BEAR_LOADER]
    assert(Loader, 'Symbol.for(\'bear#loader\') is required')

    this.loader = new Loader({
      baseDir: options.baseDir,
      app: this,
      plugins: options.plugins,
      logger: this.console
    })
  }

  use (fn) {
    if (typeof fn !== 'function') throw new TypeError('middleware must be a function!')
    if (isGeneratorFunction(fn)) {
      fn = convert(fn)
    }
    debug('use %s', fn._name || fn.name || '-')
    this.middleware.push(fn)
    return this
  }

  get baseDir () {
    return this._options.baseDir
  }

  get [BEAR_LOADER] () {
    return require('./loader/bear_loader')
  }
}

module.exports = Bear
