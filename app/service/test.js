module.exports = app => {
  class Test {
    async getName () {
      return 'hello world'
    }
  }

  return Test
}
