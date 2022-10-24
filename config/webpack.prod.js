/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const webpack = require('webpack');
const merge = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const ObsoleteWebpackPlugin = require('obsolete-webpack-plugin');
const ScriptExtHtmlWebpackPlugin = require('script-ext-html-webpack-plugin');
const fs = require('fs');
const appInfo = require('./getAppInfo.js');
const common = require('./webpack.common.js');
const {
  PRODUCTION,
  HASH_DIGEST_LENGTH,
  NODE_MODULES_REG,
  NODE_MODULES_WITH_NAME_REG,
} = require('./constants.js');

const obsoleteBuffer = fs.readFileSync('./config/obsolete.html');
const obsoleteTemplate = obsoleteBuffer.toString();

module.exports = merge(common, {
  mode: PRODUCTION,
  entry: {
    app: './config/app.js',
  },
  output: {
    filename: `js/[name].[chunkhash:${HASH_DIGEST_LENGTH}].js`,
  },
  optimization: {
    moduleIds: 'hashed',
    runtimeChunk: 'single',
    splitChunks: {
      cacheGroups: {
        vendor: {
          test: NODE_MODULES_REG,
          chunks: 'all',
          name(module) {
            const packageName = module.context.match(
              NODE_MODULES_WITH_NAME_REG,
            )[1];
            const safePackageName = packageName.replace('@', '');
            return `npm.${safePackageName}`;
          },
        },
      },
    },
    minimizer: [
      new TerserJSPlugin({
        parallel: true,
        cache: true,
        terserOptions: {
          ie8: true,
          safari10: true,
          compress: {
            drop_console: true,
          },
          output: {
            comments: false,
          },
        },
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorPluginOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      }),
    ],
  },
  stats: {
    children: false,
    entrypoints: false,
    modules: false,
  },
  module: {
    rules: [
      {
        test: /\.(le|c)ss$/,
        use: [
          MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader',
          'less-loader',
        ],
      },
    ],
  },
  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      'process.env.APP_INFO': JSON.stringify(appInfo),
    }),
    new ObsoleteWebpackPlugin({
      name: 'obsolete',
      template: obsoleteTemplate,
    }),
    new ScriptExtHtmlWebpackPlugin({
      async: 'obsolete',
    }),
    new CopyPlugin([
      {
        from: 'public',
        ignore: ['.DS_Store'],
      },
    ]),
    new MiniCssExtractPlugin({
      filename: `css/[name].[contenthash:${HASH_DIGEST_LENGTH}].css`,
    }),
    new CompressionPlugin({
      test: /\.(js)|(css)$/,
      cache: true,
      threshold: 8192,
    }),
  ],
});
