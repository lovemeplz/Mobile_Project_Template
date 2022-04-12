#!/usr/bin/env node
const httpServer = require('@cci/vue-cli-plugin-http-server/src/http-server')
const { load } = require('@cci/vue-cli-plugin-loadenv')
const path = require('path')
const semver = require('semver')
const rawArgv = process.argv.slice(2)
const args = require('minimist')(rawArgv)
const context = process.env.VUE_CLI_CONTEXT || process.cwd()
const { error } = require('@vue/cli-shared-utils')

const pkg = require('../package.json')

const requiredVersion = pkg.engines.node

if (!semver.satisfies(process.version, requiredVersion)) {
  error(
    `You are using Node ${process.version}, but vue-cli-service ` +
    `requires Node ${requiredVersion}.\nPlease upgrade your Node version.`
  )
  process.exit(1)
}
const env = args.env || args.mode || "development"
const envFile = path.resolve(context, `env/${env}`)
load(envFile)
const projectOptions = require('../vue.config.js')
const rootLocation = projectOptions.baseUrl || "/"
const root = path.resolve(context, projectOptions.outputDir || 'dist')
httpServer(process.cwd(), args, projectOptions.devServer, { root, rootLocation })
