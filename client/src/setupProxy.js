const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
  app.use(
    '/fme',
    createProxyMiddleware({
      target: 'http://localhost:3014',
      changeOrigin: true
    })
  )
}
