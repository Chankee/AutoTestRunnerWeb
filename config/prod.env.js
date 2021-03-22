'use strict'
const FasterRunner = process.env.FasterRunner ? process.env.FasterRunner : "HttpRunner Framework 3.0--"
module.exports = {
    NODE_ENV: '"production"',
    FasterRunner: "'" + FasterRunner + "'"
}
