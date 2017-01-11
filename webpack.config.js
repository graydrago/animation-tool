"use strict";

let webpack = require('webpack');
let htmlWebpackPlugin = require('html-webpack-plugin');
let nodeExternals = require('webpack-node-externals');

module.exports = [
  {
    context: __dirname,
    entry: "./src/client/core.ts",
    output: {
      path: __dirname + "/build/public/",
      filename: "js/script.js",
    },
    module: {
      loaders: [
        { test: /\.tsx?$/, loader: 'ts-loader' },
        { test: /\.css$/, loader: "style-loader!css-loader" }
      ]
    },
    plugins: [
      new htmlWebpackPlugin({
        template: __dirname + "/src/client/index.template.html",
        filename: "index.html"
      })
    ],
    devtool: "source-map"
  },
  {
    context: __dirname,
    entry: "./src/server/main.ts",
    target: "node",
    externals: [nodeExternals()],
    output: {
      path: __dirname + "/build/server",
      filename: "main.js"
    },
    module: {
      loaders: [
        { test: /\.tsx?$/, loader: 'ts-loader' }
      ]
    },
    devtool: "source-map"
  }
];
