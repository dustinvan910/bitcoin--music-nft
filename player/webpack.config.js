const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/js/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.min.js'
  },
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log']
          },
          mangle: true,
          output: {
            comments: false
          }
        },
        extractComments: false
      })
    ]
  },
  devServer: {
    static: path.resolve(__dirname, './'),
    hot: true,
    port: 3000,
    open: true
  },
  module: {
    rules: [
    ]
  }
};