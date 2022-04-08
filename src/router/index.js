import { createRouter, createWebHashHistory } from 'vue-router';

const routes = [
  {
    name: 'notFound',
    path: '/:path(.*)+',
    redirect: {
      name: 'Layout',
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
  const title = to.meta && to.meta.title;
  if (title) {
    document.title = title;
  }
  next();
});

export { router };
