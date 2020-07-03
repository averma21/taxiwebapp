const { createProxyMiddleware } = require("http-proxy-middleware");

const options = {
  target: "http://localhost:8080", // target host
  changeOrigin: true, // needed for virtual hosted sites
  pathRewrite: {
    "^/api/v1": "/api/v1" // rewrite path
  }
};

module.exports = function(app) {
  app.use("/api/v1", createProxyMiddleware(options));
};
