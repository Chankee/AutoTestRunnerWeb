'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')
const FasterRunner = process.env.FasterRunner ? process.env.FasterRunner : "HttpRunner Framework 3.0--"
module.exports = merge(prodEnv, {
    NODE_ENV: '"development"',
    FasterRunner: "'" + FasterRunner + "'"
})
