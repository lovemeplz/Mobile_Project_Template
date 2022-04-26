process.env.VUE_CLI_RELEASE = true

const execa = require('execa')
const inquirer = require('inquirer')
const excludes = ['origin/master', 'origin/develop']
const review = async() => {
  console.log('Code review')

  console.log('')
  console.log('> Update remote branch list')
  console.log('')
  // 同步远程分支列表
  await execa('git', ['remote', 'update', '-p'], { stdio: 'inherit' })

  const { stdout } = await execa('git', ['branch', '-r'])
  const branchList = stdout.split('\n')
    .map(b => b.trim())
    .filter(branch => excludes.indexOf(branch) === -1)
    .map(b => {
      return { "name": b, "value": b }
    })
  const { branch } = await inquirer.prompt([
    {
      name: 'branch',
      message: 'Select review branch:',
      type: 'list',
      choices: branchList
    }
  ])

  const { yes } = await inquirer.prompt([{
    name: 'yes',
    message: `Confirm review ${branch}?`,
    type: 'confirm'
  }])
  if (yes) {
    const localBranch = branch.replace(/^origin\//, '')

    console.log('')
    console.log('> 1. Checkout develop branch')
    console.log('')
    // 切换到 develop 分支
    await execa('git', ['checkout', 'develop'], { stdio: 'inherit' })

    console.log('')
    console.log('> 2. pull develop branch')
    console.log('')
    // 拉取最新的 develop 分支
    await execa('git', ['pull', 'origin', 'develop'], { stdio: 'inherit' })
    try {
      // 拉取要 code review 的分支到本地
      await execa('git', ['checkout', '-b', `${localBranch}`, `${branch}`])
    } catch (error) {
      if (error.message && error.message.includes('already exists')) {
        console.log(`A branch named '${localBranch}' already exists!!!`)
        await execa('git', ['checkout', `${localBranch}`], { stdio: 'inherit' })
        await execa('git', ['pull', 'origin', `${localBranch}`], { stdio: 'inherit' })
      } else {
        throw error
      }
    }
    console.log('')
    console.log(`> 3. Checkout into ${localBranch}`)
    console.log('')
    // 切换分支到要 code review 的分支
    await execa('git', ['checkout', `${localBranch}`], { stdio: 'inherit' })
    // console.log('')
    // console.log(`> 4. Merge ${localBranch} to develop`)
    // console.log('')
    // // 合并最新 develop 到要 code review 的分支
    // await execa('git', ['merge', `${localBranch}`], { stdio: 'inherit' })

    console.log('')
    console.log(`> 4. Show diff file name`)
    console.log('')
    const { stdout } = await execa('git', ['merge-base', 'develop', `${localBranch}`])
    const base = stdout && stdout.trim()
    if (base) {
      // 比较 develop 和要 code review 的分支不同的文件
      await execa('git', ['diff', `${base}`, `${localBranch}`, '--name-only'], { stdio: 'inherit' })
    }
    console.log('')
    console.log("Branch clone complete！！！")
  }
}

review().catch(err => {
  console.error(err)
  process.exit(1)
})
