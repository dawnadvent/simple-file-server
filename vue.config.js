module.exports = {
  baseUrl: '/file-server',
  outputDir: 'dist',
  devServer: {
    host: '0.0.0.0',
    port: 9090,
    proxy: {
      '/chfs': {
        target: 'http://localhost:2000/',
        changeOrigin: true,
        pathRewrite: {
          '/chfs': ''
        }
      }
    }
  }
}