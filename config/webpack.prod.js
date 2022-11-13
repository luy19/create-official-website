/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const webpack = require('webpack');
const { merge } = require('webpack-merge');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const CompressionPlugin = require('compression-webpack-plugin');
const WebpackObsoletePlugin = require('webpack-obsolete-plugin');
const appInfo = require('./getAppInfo');
const common = require('./webpack.common');
const {
  PRODUCTION,
  HASH_DIGEST_LENGTH,
  NODE_MODULES_REG,
  NODE_MODULES_WITH_NAME_REG,
} = require('./constants');

const fs = require('fs');
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
    moduleIds: 'deterministic',
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
      new CssMinimizerPlugin({
        minimizerOptions: {
          preset: ['default', { discardComments: { removeAll: true } }],
        },
      }),
    ],
  },
  stats: 'minimal',
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
    new WebpackObsoletePlugin({
      template: obsoleteTemplate,
      isStrict: true,
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          globOptions: {
            dot: false,
            gitignore: true,
            ignore: ['**/.DS_Store'],
          },
        },
      ],
    }),
    new MiniCssExtractPlugin({
      filename: `css/[name].[contenthash:${HASH_DIGEST_LENGTH}].css`,
    }),
    new CompressionPlugin({
      test: /\.(js|css)$/,
      algorithm: 'gzip',
      compressionOptions: { level: 1 },
      threshold: 8192,
    }),
  ],
});
