const execa = require('execa')
const path = require('path')
const fs = require('fs')
const pkg = require('../package.json')
const imageName = `${pkg.name}:${pkg.version}`
// const rawArgv = process.argv.slice(2)
// const args = require('minimist')(rawArgv)
// const context = process.env.VUE_CLI_CONTEXT || process.cwd()

// const env = args.env || args.mode || "development"
// const envFile = path.resolve(context, `env/${env}`)

const deployment = `apiVersion: apps/v1
kind: Deployment
metadata:
  name: ccuap-${pkg.name}
spec:
  selector:
    matchLabels:
      app: ccuap-${pkg.name}
  replicas: 2
  template:
    metadata:
      labels:
        app: ccuap-${pkg.name}
    spec:
      containers:
      - name: ccuap-${pkg.name}
        image: "10.12.107.25:5000/ccuap/${pkg.name}:${pkg.version}"
        ports:
        - containerPort: 80
        env:
        - name: VUE_APP_BASEURL
          value: "/admin/"
        - name: VUE_APP_API_URL
          value: "http://10.12.107.44:7080/"
        - name: VUE_APP_FILE_URL
          value: "http://10.12.102.195:9888/"
        - name: VUE_APP_SOCKET_URL
          value: "10.12.102.140:8762/"
        - name: VUE_APP_CODE_URL
          value: "http://10.12.102.195:9888/js/CodeData.js"
        - name: VUE_APP_CODE_CONFIG_URL
          value: "http://10.12.102.195:9888/js/CodeConfigData.js"
        - name: VUE_APP_CAS
          value: "0"
        - name: VUE_APP_ACTIVITIDEMO
          value: "1"
        - name: VUE_APP_ACTIVITIDEMOURL
          value: "http://10.12.107.44:8889"
        - name: VUE_APP_GATEWAY_URL
          value: "http://10.12.102.211:8001"
---
apiVersion: v1
kind: Service
metadata:
  name: ccuap-${pkg.name}
spec:
  externalIPs:
  - 10.12.107.44
  selector:
    app: ccuap-${pkg.name}
  ports:
  - protocol: "TCP"
    port: 8090
    targetPort: 80
  type: LoadBalancer`

fs.writeFileSync(path.resolve(__dirname, '../tmp/deployment.yml'), deployment)
function tag() {
  return execa('docker', ['tag', `${imageName}`, `10.12.107.25:5000/ccuap/${imageName}`], { stdio: 'inherit' })
}
function push() {
  return execa('docker', ['push', `10.12.107.25:5000/ccuap/${imageName}`], { stdio: 'inherit' })
}
// async function configMap() {
//   const { code, stdout } = await execa('kubectl', ['get', 'configmaps', `ccuap-env-${pkg.name}-${env}`])
//   if (code === 0 && stdout !== '') { // 获取到了旧的配置文件
//     // 删除旧的配置
//     await execa('kubectl', ['delete', 'configmap', `ccuap-env-${pkg.name}-${env}`])
//   }
//   return execa('kubectl', ['create', 'configmap', `ccuap-env-${pkg.name}-${env}`, `--from-file=${envFile}`], { stdio: 'inherit' })
// }
function apply() {
  const subprocess = execa('kubectl', ['apply', '--validate=false', '-f', '-'], { stdout: 'inherit' })
  execa('echo', [`${deployment}`]).stdout.pipe(subprocess.stdin)
  return subprocess
}

execa('docker', ['build', `.`, `-t`, `${imageName}`], { stdio: 'inherit' })
  .then(tag)
  .then(push)
  .then(apply)
  .catch(err => {
    console.error(err)
    process.exit(1)
  })
