const proxy = require('http-proxy-middleware')

module.exports = function (app) {
  app.use(
    '/fme',
    proxy({
      target: 'http://localhost:3014',
      changeOrigin: true
    })
  )
}
