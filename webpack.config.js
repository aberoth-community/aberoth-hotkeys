const { join } = require('path')

const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCssAssetsPlugin = require('optimize-css-assets-webpack-plugin')
const TerserWebpackPlugin = require('terser-webpack-plugin')

const cwd = process.cwd()
const input = './src'
const output = './build'

/**
 * Build mode
 * @type {'development' | 'production'}
 */
const mode = process.env.NODE_ENV === 'development' ? 'development' : 'production'

const isEnvDevelopment = mode === 'development'
const isEnvProduction = mode === 'production'
const isEnvSourceMaps = process.env.SOURCEMAPS === 'true'

/** Babel configuration
 * @type {import('@babel/core').TransformOptions}
 */
const babelOptions = {
  babelrc: false,
  configFile: false,
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  plugins: ['@babel/plugin-proposal-class-properties'],
}

/**
 * Webpack config
 * @type {import('webpack').Configuration}
 */
const config = {
  devtool: isEnvProduction
    ? isEnvSourceMaps
      ? 'inline-sourcemaps'
      : false
    : isEnvDevelopment && 'eval-cheap-module-source-map',
  mode,
  entry: {
    about: join(cwd, input, 'views/About/index.ts'),
    alerts: join(cwd, input, 'views/Alerts/index.ts'),
  },
  output: {
    filename: 'js/[name]-[contenthash].min.js',
    path: join(cwd, output),
  },
  resolve: { extensions: ['.js', '.ts'] },
  target: ['browserslist'],
  module: {
    rules: [
      {
        test: /\.(js|ts)$/,
        use: {
          loader: 'babel-loader',
          options: babelOptions,
        },
      },
      {
        test: /\.html$/,
        use: 'html-loader',
      },
      {
        test: /\.scss$/,
        use: [
          MiniCssExtractPlugin.loader,
          { loader: 'css-loader', options: { importLoaders: 1 } },
          'sass-loader',
        ],
      },
    ],
  },
  optimization: {
    minimizer: [new OptimizeCssAssetsPlugin(), new TerserWebpackPlugin()],
  },
  plugins: [
    new MiniCssExtractPlugin({
      filename: 'css/[name]-[contenthash].css',
    }),
    new HtmlWebpackPlugin({
      chunks: ['about'],
      filename: 'about.html',
      template: join(cwd, input, 'views/About/index.html'),
    }),
    new HtmlWebpackPlugin({
      chunks: ['alerts'],
      filename: 'alerts.html',
      template: join(cwd, input, 'views/Alerts/index.html'),
    }),
  ],
}
module.exports = config
