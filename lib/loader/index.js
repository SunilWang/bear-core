const mods = require('./modules')
const BearLoader = require('./common/bear_loader')
const LOADER_CACHE = Symbol('LoaderCache')
const BEAR_LOADER = Symbol('BearLoader')

module.exports = function (options) {
  if (!this[BEAR_LOADER]) {
    this[BEAR_LOADER] = new BearLoader(options)
  }

  if (!this[LOADER_CACHE]) {
    this[LOADER_CACHE] = new Map()
  }

  const self = this

  return new Proxy(mods, {
    get (target, propKey) {
      if (self[LOADER_CACHE].has(propKey)) {
        return self[LOADER_CACHE].get(propKey)
      }

      if (!Reflect.has(target, propKey)) {
        throw new TypeError(`not find \`${propKey}\` modules!`)
      }

      const ModuleClass = Reflect.get(target, propKey)
      const module = new ModuleClass({bearLoader: self[BEAR_LOADER]})

      self[LOADER_CACHE].set(propKey, module)
      return module
    }
  })
}