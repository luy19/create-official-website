/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
const path = require('path');

const webpack = require('webpack');

const StylelintPlugin = require('stylelint-webpack-plugin');

const HtmlWebpackPlugin = require('html-webpack-plugin');
const { HASH_DIGEST_LENGTH, NODE_MODULES_REG } = require('./constants.js');

const { publicPath } = require('../src/app.json');

const routes = require('../src/routes.js');

const routeNames = routes.map(route => route.name);
if (
  routeNames.some(
    (name, index) =>
      ['main', 'app'].includes(name) || routeNames.lastIndexOf(name) !== index,
  )
) {
  throw new Error(
    '入口名不能是 main, app 或入口名重复，请检查 src/routes.js 文件中的 name 。',
  );
}

function generateEntries() {
  return routes.reduce((entries, route) => {
    const routeName = route.name;
    return {
      ...entries,
      [routeName]: `./src/pages/${routeName}/${routeName}.js`,
    };
  }, {});
}

function excludeOtherRouteNames(routeName) {
  return routes
    .filter(route => route.name !== routeName)
    .map(route => route.name);
}

function generatePages() {
  return routes.map(route => {
    const { name, title, keywords, description } = route;
    return new HtmlWebpackPlugin({
      filename: `${name}.html`,
      template: path.join(__dirname, '../src/pages', `${name}/${name}.ejs`),
      favicon: path.join(__dirname, '../public/favicon.ico'),
      title,
      meta: {
        keywords,
        description,
      },
      excludeChunks: excludeOtherRouteNames(name),
      minify: {
        collapseWhitespace: true,
        removeComments: true,
      },
    });
  });
}

module.exports = {
  entry: {
    main: './src/main.js',
    ...generateEntries(),
  },
  output: {
    path: path.join(__dirname, '../dist'),
    publicPath,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '../src'),
    },
  },
  module: {
    rules: [
      {
        enforce: 'pre',
        test: /\.js$/,
        exclude: NODE_MODULES_REG,
        use: {
          loader: 'eslint-loader',
          options: {
            cache: true,
            emitError: true,
            emitWarning: true,
          },
        },
      },
      {
        test: /\.js$/,
        exclude: NODE_MODULES_REG,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true,
          },
        },
      },
      {
        test: /\.(png|svg|jpg|gif)$/,
        use: {
          loader: 'file-loader',
          options: {
            name: `[name].[hash:${HASH_DIGEST_LENGTH}].[ext]`,
            outputPath: 'img',
            publicPath: `${publicPath}img/`,
          },
        },
      },
      {
        test: /\.ejs/,
        use: {
          loader: '@testerum/ejs-compiled-loader-webpack4-nodeps',
          options: {
            ejsOptions: {
              compileDebug: true,
            },
          },
        },
      },
      {
        test: require.resolve('jquery'),
        use: [
          {
            loader: 'expose-loader',
            options: 'jQuery',
          },
          {
            loader: 'expose-loader',
            options: '$',
          },
        ],
      },
    ],
  },
  plugins: [
    new webpack.DefinePlugin({
      'process.env.BASE_URL': `"${publicPath}"`,
    }),
    new webpack.ProvidePlugin({
      $: 'jquery',
      jQuery: 'jquery',
      'window.jQuery': 'jquery',
      'window.$': 'jquery',
    }),
    new StylelintPlugin({
      files: './src/**/*.(le|c)ss',
      emitError: true,
      emitWarning: true,
    }),
    ...generatePages(),
  ],
};
