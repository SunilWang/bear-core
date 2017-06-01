const assert = require('assert')
const debug = require('debug')('bear-core:loader')
const path = require('path')
const fs = require('fs')
const globby = require('globby')
const is = require('is-type-of')
const lSet = require('lodash.set')
const FileProcess = require('./file_process')

const defaults = {
  directory: null,
  target: null,
  match: undefined,
  ignore: undefined,
  caseStyle: 'camel',
  call: true,
  inject: undefined,
  filter: null
}

class FileLoader extends FileProcess {
  constructor (options = {}) {
    assert(options.directory, 'options.directory is required')
    assert(options.target, 'options.target is required')
    super()
    this.options = Object.assign({}, defaults, options)
  }

  load () {
    const items = this.parse()
    const target = this.options.target

    items.map(item => {
      debug('loading item %j', item)
      lSet(target, item.properties.join('.'), item.exports)
    })

    return target
  }

  parse () {
    let files = this.options.match || [ '**/*.js' ]
    let ignore = this.options.ignore
    let directories = this.options.directory

    files = Array.isArray(files) ? files : [ files ]

    if (ignore) {
      ignore = Array.isArray(ignore)
        ? ignore
        : [ ignore ]

      ignore = ignore
        .filter(f => !!f)
        .filter(f => is.string(f) && f.length > 0)
        .map(f => f[0] === '!' ? f : ('!' + f))

      files = files.concat(ignore)
    }

    if (!Array.isArray(directories)) {
      directories = [ directories ]
    }

    const filter = is.function(this.options.filter) ? this.options.filter : null
    const items = []
    debug('parsing %j', directories)
    for (let directory of directories) {
      // $HOME/bear-core/lib/ > $HOME/bear-core/lib
      directory = this.path.resolve(directory)

      const filepaths = globby.sync(files, { cwd: directory })

      for (const filepath of filepaths) {
        const fullpath = path.join(directory, filepath)

        if (!fs.statSync(fullpath).isFile()) continue

        let fInfo = this.fullPathToHump(filepath, this.options.caseStyle)

        // get properties
        // app/service/foo/bar.js => [ 'foo', 'bar' ]
        const properties = fInfo.fNames
        // app/service/foo/bar.js => service.foo.bar
        const pathName = directory.split(this.sep).slice(-1) + '.' + fInfo.pathName
        // get exports from the file
        const exports = this.getExports(fullpath, this.options, pathName)

        // ignore exports when it's null or false returned by filter function
        if (exports == null || (filter && filter(exports) === false)) continue

        // set properties of class
        if (is.class(exports)) {
          exports.prototype.pathName = pathName
          exports.prototype.fullPath = fullpath
        }

        items.push({ fullpath, properties, exports })
        debug('parse %s, properties %j, export %j', fullpath, properties, exports)
      }
    }

    return items
  }
}

module.exports = FileLoader

//let files = new FileLoader({directory: path.join(__dirname, '../'), target: {}})
//
// console.dir(files.parse())
// console.dir(files.parse()[1])
// console.dir(files.parse()[1].exports.prototype.pathName)

// console.log('==')
// console.log(files.load())
