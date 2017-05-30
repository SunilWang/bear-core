let Koa = require('./index').BearCore

const app = new Koa({baseDir: __dirname})

app.loader.loadService()


app.use(async (ctx) => {
  ctx.body = await ctx.service.test.getName()
})
// response
// app.use(function * (ctx) {
//   console.log(ctx.service)
//   ctx.body = yield ctx.service.test.getName()
//   // ctx.body = 'Hello Koa'
// })

app.listen(3000)
