import { createRouter, createWebHashHistory } from 'vue-router';
import { getToken} from '../utils/auth'
const routes = [
  {
    name: 'notFound',
    path: '/:path(.*)+',
    redirect: {
      name: 'login',
    },
  },
  {
    name: 'login',
    path: '/login',
    component: () => import('../views/login/Login.vue'),
    meta: {
      title: '用户登录',
    },
  },
  {
    name: 'home',
    path: '/home',
    component: () => import('../views/home/Home.vue'),
    children: [
    ]
  }
];

const router = createRouter({
  routes,
  history: createWebHashHistory(),
});

router.beforeEach((to, from, next) => {
  // 改变页面标题
  const title = to.meta && to.meta.title;
  if (title) {
    document.title = title;
  }
  // 路由权限   todo 
  if (!getToken() && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
});

export { router };
