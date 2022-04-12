process.env.VUE_CLI_RELEASE = true

const execa = require('execa')
const semver = require('semver')
const inquirer = require('inquirer')
const cc = require('conventional-changelog')
const join = require('path').join
const readFileSync = require('fs').readFileSync

const curVersion = require('../package.json').version

const release = async() => {
  console.log(`Current version: ${curVersion}`)

  const bumps = ['patch', 'minor', 'major', 'prerelease']
  const versions = {}
  bumps.forEach(b => { versions[b] = semver.inc(curVersion, b) })
  const bumpChoices = bumps.map(b => ({ name: `${b} (${versions[b]})`, value: b }))

  const { bump, customVersion } = await inquirer.prompt([
    {
      name: 'bump',
      message: 'Select release type:',
      type: 'list',
      choices: [
        ...bumpChoices,
        { name: 'custom', value: 'custom' }
      ]
    },
    {
      name: 'customVersion',
      message: 'Input version:',
      type: 'input',
      when: answers => answers.bump === 'custom'
    }
  ])

  const version = customVersion || versions[bump]

  const { yes } = await inquirer.prompt([{
    name: 'yes',
    message: `Confirm releasing ${version}?`,
    type: 'confirm'
  }])

  if (yes) {
    delete process.env.PREFIX
    // 拉取最新的 develop 分支
    await execa('git', ['pull', 'origin', 'develop'])
    // // 发布前提交本地修改
    // await execa('git', ['add', '-A'], { stdio: 'inherit' })
    // await execa('git', ['commit', '-m', 'chore: pre release sync'], { stdio: 'inherit' })
    // 生成 changelog.md
    const fileStream = require('fs').createWriteStream(`CHANGELOG.md`)
    cc({
      preset: 'angular',
      releaseCount: 0,
      pkg: {
        transform(pkg) {
          pkg.version = `${version}`
          return pkg
        }
      }
    }, {
      "commit": "commit",
      "bugUrl": "http://10.12.102.214:8081/zentao"
    }, null, null, {
      commitPartial: readFileSync(join(__dirname, 'templates_commit.hbs'), 'utf-8')
    }).pipe(fileStream).on('close', async() => {
      // 提交 changelog.md
      await execa('git', ['add', '-A'], { stdio: 'inherit' })
      await execa('git', ['commit', '-m', `chore: ${version} changelog`], { stdio: 'inherit' })
      await execa('git', ['push', 'origin', 'develop'])
      // 修改 package.json version
      await execa('npm', ['version', `${version}`, '-m', `chore: Upgrade to ${version}`, '-f'])
      // 生成 release 分支
      await execa('git', ['checkout', '-b', `release-${version}`, 'develop'])
      // merge 到 master 分支
      await execa('git', ['checkout', 'master'])
      await execa('git', ['pull', 'origin', 'master'])
      await execa('git', ['merge', '--no-ff', `release-${version}`])
      await execa('git', ['push', 'origin', 'master'])
      // merge 到 develop 分支
      await execa('git', ['checkout', 'develop'])
      await execa('git', ['merge', '--no-ff', `release-${version}`])
      await execa('git', ['push', 'origin', 'develop'])
      // // 打 tag
      // await execa('git', ['tag', '-a', `v${version}`, 'master', '-m', `tag release v${version}`])
      // // 提交 tags
      // await execa('git', ['push', 'origin', '--tags'])
      // 提交本次tag
      await execa('git', ['push', 'origin', `v${version}`])
    })
  }
}

release().catch(err => {
  console.error(err)
  process.exit(1)
})
