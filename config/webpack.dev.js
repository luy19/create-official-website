/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const path = require('path');
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const common = require('./webpack.common');
const { DEVELOPMENT } = require('./constants');

module.exports = merge(common, {
  mode: DEVELOPMENT,
  output: {
    filename: '[name].js',
  },
  devtool: 'eval-source-map',
  devServer: {
    static: {
      directory: path.join(__dirname, '..', 'public'),
    },
    compress: true,
    hot: 'only',
    client: {
      overlay: {
        errors: true,
        warnings: false,
      },
    },
  },
  stats: true,
  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        use: ['style-loader', 'css-loader', 'less-loader'],
      },
    ],
  },
});
