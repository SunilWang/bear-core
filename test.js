// let version = 'v133.558.21'
// //version = 'v1'
// let v = 0
//
// version = version.replace(/[^1-9\\.]/gi, '').split('.').slice(0, 2).join('.')
//
// console.log(parseFloat(version))
//
//
// return
let Koa = require('./index').BearCore

const app = new Koa({baseDir: __dirname})

app.loader.service.load()

// app.use(async (ctx) => {
//   ctx.body = await ctx.service.test.getName()
// })
// response
app.use(function * () {
  this.body = yield this.service.test.getName()
})

app.listen(3000)
