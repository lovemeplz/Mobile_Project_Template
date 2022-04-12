
const path = require('path')
const fs = require('fs')
const {
  sync
} = require('glob')
const {
  createRoutes
} = require('../../src/utils/createRoutes')

const root = path.join(__dirname, '../../')
// 设置 页面文件夹
const pageLib = 'views'
const routerDir = path.join(root, 'src/router')
const files = sync(`src/${pageLib}/**/*.vue`)

const filterFiles = files.map(file => {
  return file.split('src/')[1]
})

// createRoutes 传入三个参数分别是页面目录文件数组，项目根路径， 页面目录名
let routes = createRoutes(filterFiles, root, pageLib)

routes.concat({
  path: '*',
  redirect: '/404'
})

const hiddenRoutes = [
  '/',
  '/login',
  '/404',
  '*'
]

routes = routes.map(route => {
  if (hiddenRoutes.findIndex(item => item === route.path) > -1) {
    route.hidden = true
  }

  if (route.children) {
    // 自定义重定向路由
    route.redirect = `${route.path}${route.children[0].path.indexOf('/') > -1 ? route.children[0].path : '/' + route.children[0].path}`
    route.component = '@/layout'
    if (route.path === '/') {
      route.redirect = `/${route.children[0].path}`
    }
  }
  return route
})

const arr2String = (arr) => `[
  ${arr.map(a => `{
    ${
  Object.keys(a).map(key =>
    key === 'component'
      ? `${key}: () => import("@${a[key].toString().indexOf(`${pageLib}`) === -1 ? a[key].toString() : `/${pageLib}` + a[key].toString().split(`${pageLib}`)[1]}")`
    // ? `${key}: () => import()`
      : typeof a[key] === 'string'
        ? `${key}: '${a[key]}'`
        : a[key] instanceof Array
          ? `${key}: ${arr2String(a[key])}`
          : `${key}: ${a[key]}`
  )
}
  }`)
}]`

const routerTpl = `
/* eslint-disable */
import Vue from 'vue'
import Router from 'vue-router'

// in development-env not use lazy-loading, because lazy-loading too many pages will cause webpack hot update too slow. so only in production use lazy-loading;
// detail: https://panjiachen.github.io/vue-element-admin-site/#/lazy-loading

Vue.use(Router)

/**
* hidden: true                   if 'hidden:true' will not show in the sidebar(default is false)
* alwaysShow: true               if set true, will always show the root menu, whatever its child routes length
*                                if not set alwaysShow, only more than one route under the children
*                                it will becomes nested mode, otherwise not show the root menu
* redirect: noredirect           if 'redirect:noredirect' will no redirct in the breadcrumb
* name:'router-name'             the name is used by <keep-alive> (must set!!!)
* meta : {
    title: 'title'               the name show in submenu and breadcrumb (recommend set)
    icon: 'svg-name'             the icon show in the sidebar,
  }
**/

export const constantRouterMap = ${arr2String(routes)}

export default new Router({
  // mode: 'history', //后端支持可开
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
`

if (!fs.existsSync(routerDir)) {
  fs.mkdirSync(routerDir)
  fs.writeFileSync(path.join(routerDir, 'index.js'), routerTpl)
} else {
  fs.writeFileSync(path.join(routerDir, 'index.js'), routerTpl)
}
