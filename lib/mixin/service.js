const path = require('path')

module.exports = {

  loadService (opt) {
    // 载入到 app.serviceClasses
    opt = Object.assign({
      call: true,
      caseStyle: 'lower',
      fieldClass: 'serviceClasses',
      directory: path.join(this.options.baseDir, 'app/service')
    }, opt)
    const servicePaths = opt.directory
    this.loadToContext(servicePaths, 'service', opt)
  }
}
