const Base = require('./base')
const path = require('path')

class Service extends Base {
  load (opt) {
    // 载入到 app.serviceClasses
    opt = Object.assign({
      call: true,
      caseStyle: 'lower',
      fieldClass: 'serviceClasses',
      directory: path.join(this.options.baseDir, 'app/service')
    }, opt)

    const servicePaths = opt.directory

    this.bearLoader.loadToContext(servicePaths, 'service', opt)
  }

  getT () {
    return 1
  }
}

module.exports = Service
