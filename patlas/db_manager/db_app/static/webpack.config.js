const webpack = require("webpack")
const UglifyJSPlugin = require('uglifyjs-webpack-plugin')

module.exports = {
  entry: "./entry-point.js",
  devtool: "source-map",
  output: {
    filename: 'bundle.min.js'
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [ "style-loader", "css-loader" ]
      },
      {
        test: /\.(png|woff|woff2|eot|ttf|svg)$/,
        loader: "url-loader?limit=100000"
      }
    ]
  },
  plugins: [
    new UglifyJSPlugin({
      include: /\.min\.js$/,
      // minimize: true
    })
  ]
}
