const fs = require('fs')
const path = require('path')
const is = require('is-type-of')

class FileProcess {
  constructor () {
    this.path = path
    this.fs = fs
    this.sep = path.sep
  }

  // hello$world.js > helloWorld.js
  // hello-world > helloWorld
  // hello_world.js > helloWorld.js
  // helloWorld.js  > HelloWorld.js
  // HelloWorld.js  > HelloWorld.js
  // HelloWorld.js  > helloWorld.js (if `caseStyle` eq 'lower')
  nameToHump (fName, caseStyle) {
    fName = fName
      // -hello-world.js > hello-world.js
      // 0$hello-world > hello-world
      .replace(/^[^A-Za-z]*/ig, '')
      // hello-world.js$ > hello-world.js
      .replace(/[^A-Za-z0-9]*$/ig, '')
      // hello--world.js > helloWorld.js
      .replace(/[^A-Za-z0-9\\.]+[a-z]/ig, s => s[s.length - 1].toUpperCase())

    let first = fName[0]

    switch (caseStyle) {
      case 'lower':
        first = first.toLowerCase()
        break
      case 'upper':
        first = first.toUpperCase()
        break
      default:
    }

    return first + fName.substring(1)
  }

  fullPathToHump (filepath, caseStyle) {
    let desc = path.parse(filepath)
    let dir = !desc.root ? desc.dir : desc.dir.replace(desc.root, '')
    let fName = path.join(dir, desc.name)
    let fNames = fName.split(this.sep)
    let lastFName = this.nameToHump(fNames.pop(), caseStyle)

    fNames = fNames.map(f => this.nameToHump(f))
    fNames.push(lastFName)

    let fullPath = path.format(desc)
    let pathName = fNames.join('.')

    return {desc, fNames, fullPath, pathName}
  }

  loadModel (filepath) {
    try {
      // require js module
      const obj = require(filepath)
      if (!obj) return obj
      // it's es module
      if (obj.__esModule) return 'default' in obj ? obj.default : obj
      return obj
    } catch (err) {
      err.message = '[bear-core] load model: ' + filepath + ', error: ' + err.message
      throw err
    }
  }

  getExports (fullpath, {initializer, call, inject}, pathName) {
    let exports = this.loadModel(fullpath)

    // process exports as you like
    if (initializer) {
      exports = initializer(exports, { path: fullpath, pathName })
    }

    // return exports when it's a class or generator
    //
    // module.exports = class Service {};
    // or
    // module.exports = function*() {}
    if (is.class(exports) || is.generatorFunction(exports)) {
      return exports
    }

    // return exports after call when it's a function
    //
    // module.exports = function(app) {
    //   return {};
    // }
    if (call && is.function(exports)) {
      exports = exports(inject)
      if (exports !== null) {
        return exports
      }
    }

    // return exports what is
    return exports
  }
}

module.exports = FileProcess
