const FileLoader = require('./file_loader')
const assert = require('assert')
const is = require('is-type-of')
const CLASSLOADER = Symbol('classLoader')

class ClassLoader {
  constructor (options) {
    assert(options.ctx, 'options.ctx is required')
    const properties = options.properties
    this.cache = new Map()
    this.ctx = options.ctxw

    for (const property in properties) {
      this.defineProperty(property, properties[property])
    }
  }

  defineProperty (property, values) {
    Object.defineProperty(this, property, {
      get () {
        let instance = this.cache.get(property)
        if (!instance) {
          instance = getInstance(values, this.ctx)
          this.cache.set(property, instance)
        }

        instance.ctx = this.ctx

        return instance
      }
    })
  }
}

class ContextLoader extends FileLoader {
  constructor (options) {
    assert(options.property, 'options.property is required')
    assert(options.inject, 'options.inject is required')

    const target = options.target = {}

    if (options.fieldClass) {
      options.inject[options.fieldClass] = target
    }

    super(options)

    const app = this.options.inject
    const property = options.property

    // define ctx.service
    Object.defineProperty(app.context, property, {
      get () {
        if (!this[CLASSLOADER]) {
          this[CLASSLOADER] = new Map()
        }
        const classLoader = this[CLASSLOADER]
        let instance = classLoader.get(property)

        if (!instance) {
          instance = getInstance(target, this)
          classLoader.set(property, instance)
        }

        return instance
      }
    })
  }
}

module.exports = ContextLoader

function getInstance (Value, ctx) {
  // then use ClassLoader
  // const Class = values[EXPORTS] ? values : null
  let Instance = Value

  if (is.class(Instance)) {
    Instance = new Instance(ctx)
  } else {
    Instance = new ClassLoader({ ctx, properties: Instance })
  }

  return Instance
}
