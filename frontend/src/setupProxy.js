const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'https://ai-backend-a0agdpdtfafhfcay.canadacentral-01.azurewebsites.net',
      changeOrigin: true,
      pathRewrite: {
        '^/api': '', // remove base path
      },
    })
  );
};
