import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { title: '仪表板' }
  },
  {
    path: '/apis',
    name: 'Apis',
    component: () => import('@/views/Apis.vue'),
    meta: { title: 'API管理' }
  },
  {
    path: '/testing',
    name: 'Testing',
    component: () => import('@/views/Testing.vue'),
    meta: { title: 'API测试' }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { title: '设置' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  // 设置页面标题
  document.title = `AI API Manager - ${to.meta.title || '首页'}`
  next()
})

export default router