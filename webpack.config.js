const webpack = require('webpack')
const path = require('path')

// variables
const isProduction = process.argv.indexOf('-p') >= 0
const sourcePath = path.join(__dirname, './src')
const outPath = path.join(__dirname, './dist')
const nodePath = path.join(__dirname, './node_modules')

// plugins
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const WebpackCleanupPlugin = require('webpack-cleanup-plugin')

module.exports = {
  context: sourcePath,
  entry: {
    app: './main.tsx',
  },
  output: {
    path: outPath,
    filename: 'bundle.js',
    chunkFilename: '[chunkhash].js',
    publicPath: '/',
  },
  target: 'web',
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.json'],
    // Fix webpack's default behavior to not load packages with jsnext:main module
    // (jsnext:main directs not usually distributable es6 format, but es6 sources)
    // mainFields: ["module", "browser", "main"],
    alias: {
      action: path.resolve(__dirname, './src/action/'),
      component: path.resolve(__dirname, './src/component/'),
      container: path.resolve(__dirname, './src/container/'),
      middleware: path.resolve(__dirname, './src/middleware/'),
      reducer: path.resolve(__dirname, './src/reducer/'),
      store: path.resolve(__dirname, './src/store/'),
      wiretap: path.resolve(__dirname, './src/wiretap/'),
      tools: path.resolve(__dirname, './src/tools/'),
      enum: path.resolve(__dirname, './src/enum/'),
      image: path.resolve(__dirname, './src/image/'),
    },
  },
  module: {
    rules: [
      // .ts, .tsx
      {
        // Include ts, tsx, and js files.
        test: /\.(tsx?)|(js)$/,
        exclude: /node_modules/,
        loader: 'babel-loader',
      },
      // css
      {
        test: /\.(css|sass|scss)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader',
              query: {
                modules: true,
                sourceMap: !isProduction,
                importLoaders: 1,
                // localIdentName: "[local]__[hash:base64:5]"
                localIdentName: '[local]',
              },
            },
            {
              loader: 'postcss-loader',
              options: {
                ident: 'postcss',
                plugins: [
                  require('postcss-import')({ addDependencyTo: webpack }),
                  require('postcss-url')(),
                  require('postcss-cssnext')(),
                  require('postcss-reporter')(),
                  require('postcss-browser-reporter')({
                    disabled: isProduction,
                  }),
                  require('postcss-inline-svg')({
                    path: './src',
                  }),
                ],
              },
            },
            {
              loader: 'sass-loader',
              options: {
                outputStyle: isProduction ? 'collapsed' : 'expanded',
                sourceMap: isProduction,
                includePaths: [sourcePath, nodePath],
              },
            },
          ],
        }),
      },
      // static assets
      { test: /\.html$/, use: 'html-loader' },
      { test: /\.(png|svg)$/, use: 'url-loader?limit=10000' },
      { test: /\.(jpg|gif)$/, use: 'file-loader' },
      {
        test: /\.[ot]tf$/,
        exclude: /node_modules/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 65000,
            mimetype: 'application/octet-stream',
            name: 'static/font/[name].[ext]',
          },
        },
      },
      {
        test: /\.woff$/,
        exclude: /node_modules/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 65000,
            mimetype: 'application/font-woff',
            name: 'static/font/[name].[ext]',
          },
        },
      },
      {
        test: /\.woff2$/,
        exclude: /node_modules/,
        use: {
          loader: 'url-loader',
          options: {
            limit: 65000,
            mimetype: 'application/font-woff2',
            name: 'static/font/[name].[ext]',
          },
        },
      },
    ],
  },
  optimization: {
    splitChunks: {
      name: true,
      cacheGroups: {
        commons: {
          chunks: 'initial',
          minChunks: 2,
        },
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all',
          priority: -10,
        },
      },
    },
    runtimeChunk: true,
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
      DEBUG: false,
    }),
    new WebpackCleanupPlugin(),
    new ExtractTextPlugin({
      filename: 'styles.css',
    }),
    new HtmlWebpackPlugin({
      title: 'WWII Online WebMap',
      template: 'assets/index.html',
      production: isProduction,
    }),
  ],
  devServer: {
    contentBase: sourcePath,
    hot: true,
    inline: true,
    historyApiFallback: {
      disableDotRule: true,
    },
    stats: 'minimal',
  },
  node: {
    fs: 'empty',
    net: 'empty',
  },
}
