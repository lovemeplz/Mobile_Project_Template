const fs = require('fs')
const path = require('path')
const packagesDir = path.resolve(__dirname, '../src/components/')
const exclude = ['index.js']
const Components = fs.readdirSync(packagesDir).filter(name => { return !~exclude.indexOf(name) })
module.exports.Components = Components
