/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const common = require('./webpack.common.js');
const { DEVELOPMENT } = require('./constants.js');

module.exports = merge(common, {
  mode: DEVELOPMENT,
  output: {
    filename: '[name].js',
  },
  devtool: 'eval-source-map',
  devServer: {
    contentBase: path.join(__dirname, '../public'),
    hot: true,
    hotOnly: true,
    stats: 'errors-only',
  },
  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
  plugins: [new webpack.HotModuleReplacementPlugin()],
});
