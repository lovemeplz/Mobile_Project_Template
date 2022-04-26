const fs = require('fs')
const assert = require('assert')
const chokidar = require('chokidar')
const chalk = require('chalk')
const proxy = require('express-http-proxy')
const url = require('url')
const { join, resolve } = require('path')
// const bodyParser = require('body-parser')

const error = null
const paths = getPaths(process.cwd())
const MOCK_DIR = './mock'

function winPath(path) {
  return path.replace(/\\/g, '/')
}

function getPaths(cwd) {
  const appDirectory = fs.realpathSync(cwd)
  function resolveApp(relativePath) {
    return resolve(appDirectory, relativePath)
  }

  return {
    appBuild: resolveApp('dist'),
    appPackageJson: resolveApp('package.json'),
    appSrc: resolveApp('src'),
    appNodeModules: resolveApp('node_modules'),
    resolveApp,
    appDirectory
  }
}

function getConfig(dir) {
  const resolvedMockPath = paths.resolveApp(dir)
  if (fs.existsSync(resolvedMockPath)) {
    const files = []
    const config = {}
    fs.readdirSync(resolvedMockPath).filter(file => { return file.charAt(0) !== '_' }).forEach(function(file) {
      const filename = paths.resolveApp('./mock/' + file)
      delete require.cache[filename]
      files.push(filename)
      Object.assign(config, require(filename))
    })
    return { config, files }
  } else {
    return {
      config: {},
      files: []
    }
  }
}

function createMockHandler(method, path, value) {
  return function mockHandler(req, res, next) {
    // const res = args[1];
    if (typeof value === 'function') {
      // eslint-disable-next-line
      value.call(null, req, res, next)
    } else {
      res.json(value)
    }
  }
}

function createProxy(method, path, target) {
  return proxy(target, {
    filter(req) {
      return method ? req.method.toLowerCase() === method.toLowerCase() : true
    },
    forwardPath(req) {
      let matchPath = req.baseUrl
      const matches = matchPath.match(path)
      if (matches.length > 1) {
        matchPath = matches[1]
      }
      return join(winPath(url.parse(target).path), matchPath)
    }
  })
}

function applyMock(app) {
  const ret = getConfig(MOCK_DIR)
  const config = ret.config
  const files = ret.files
  console.log(ret)

  Object.keys(config).forEach((key) => {
    const keyParsed = parseKey(key)
    assert(
      !!app[keyParsed.method],
      `method of ${key} is not valid`
    )
    assert(
      typeof config[key] === 'function' ||
      typeof config[key] === 'object' ||
      typeof config[key] === 'string',
      `mock value of ${key} should be function or object or string, but got ${typeof config[key]}`
    )
    if (typeof config[key] === 'string') {
      let path = keyParsed.path
      if (/\(.+\)/.test(keyParsed.path)) {
        path = new RegExp(`^${keyParsed.path}$`)
      }
      app.use(
        path,
        createProxy(keyParsed.method, path, config[key])
      )
    } else {
      app[keyParsed.method](
        keyParsed.path,
        createMockHandler(keyParsed.method, keyParsed.path, config[key])
      )
    }
  })

  // 调整 stack，把 historyApiFallback 放到最后
  let lastIndex = null
  app._router.stack.forEach((item, index) => {
    // console.log(item);
    if (item.name === 'launchEditorMiddleware') {
      lastIndex = index
    }
  })
  const mockAPILength = app._router.stack.length - 1 - lastIndex
  /* if (lastIndex && lastIndex > 0) {
    const newStack = app._router.stack
    newStack.push(newStack[lastIndex - 1])
    newStack.push(newStack[lastIndex])
    newStack.splice(lastIndex - 1, 2)
    app._router.stack = newStack
  } */

  const watcher = chokidar.watch(files, {
    ignored: /node_modules/,
    persistent: true
  })
  watcher.on('change', (path) => {
    console.log(chalk.green('CHANGED'), path.replace(paths.appDirectory, '.'))
    watcher.close()

    // 删除旧的 mock api
    app._router.stack.splice(lastIndex + 1, mockAPILength)

    applyMock(app)
  })
}

function parseKey(key) {
  let method = 'get'
  let path = key

  if (key.indexOf(' ') > -1) {
    const splited = key.split(' ')
    method = splited[0].toLowerCase()
    path = splited[1]
  }

  return { method, path }
}

function outputError() {
  if (!error) return

  const filePath = error.message.split(': ')[0]
  const relativeFilePath = filePath.replace(paths.appDirectory, '.')
  const errors = error.stack.split('\n')
    .filter(line => line.trim().indexOf('at ') !== 0)
    .map(line => line.replace(`${filePath}: `, ''))
  errors.splice(1, 0, [''])

  console.log(chalk.red('Failed to parse mock config.'))
  console.log()
  console.log(`Error in ${relativeFilePath}`)
  console.log(errors.join('\n'))
  console.log()
}

exports.outputError = outputError
exports.applyMock = applyMock
exports.getConfig = getConfig
