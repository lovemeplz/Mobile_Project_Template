const fs = require('fs')
const path = require('path')
const { Components } = require('./getComponents.js')
const basePath = path.resolve(__dirname, '../src/')

function fileExists(filePath) {
  try {
    return fs.statSync(filePath).isFile()
  } catch (err) {
    return false
  }
}
const theme = 'styles'
let indexContent = '@import "./base.scss";\n'
Components.forEach(function(key) {
  const fileName = key + '.scss'
  indexContent += '@import "./' + fileName + '";\n'
  const filePath = path.resolve(basePath, theme, 'src', fileName)
  if (!fileExists(filePath)) {
    fs.writeFileSync(filePath, '', 'utf8')
    console.log(theme, ' 创建遗漏的 ', fileName, ' 文件')
  }
})
fs.writeFileSync(path.resolve(basePath, theme, 'src', 'index.scss'), indexContent)
