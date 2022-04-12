#!/usr/bin/env node
const cc = require('conventional-changelog')
const join = require('path').join
const readFileSync = require('fs').readFileSync

const command = async() => {
  // 生成 changelog.md
  const fileStream = require('fs').createWriteStream(`CHANGELOG.md`)
  cc({
    preset: 'angular',
    releaseCount: 0
  }, {
    "commit": "commit",
    "bugUrl": "http://10.12.102.214:8081/zentao"
  }, null, null, {
    commitPartial: readFileSync(join(__dirname, 'templates_commit.hbs'), 'utf-8')
  }).pipe(fileStream).on('close', () => {
    console.log('changelog done!')
  })
}

command().catch(err => {
  console.error(err)
  process.exit(1)
})
