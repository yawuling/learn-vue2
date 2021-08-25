const webpack = require('webpack')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const alias = require('../scripts/alias')
const featureFlags = require('../scripts/feature-flags')

module.exports = {
  mode: 'development',
  entry: path.resolve(__dirname, './index.js'),
  resolve: {
    alias: alias
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
  devServer: {
    clientLogLevel: 'warning',
    compress: true,
    port: 8115,
    hot: true,
  },
  plugins: [
    new webpack.DefinePlugin({
      __WEEX__: false,
      'process.env': {
        TRANSITION_DURATION: process.env.CI ? 100 : 50,
        TRANSITION_BUFFER: 10,
        ...featureFlags
      }
    }),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, './index.html'),
      filename: 'index.html',
      inject: true
    }),
    new webpack.HotModuleReplacementPlugin()
  ],
  devtool: 'source-map'
}