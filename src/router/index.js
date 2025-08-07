import { createRouter, createWebHistory } from 'vue-router';
import MainLayout from '@/layout/MainLayout.vue';

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录', public: true } // Mark this route as public
  },
  {
    path: '/',
    component: MainLayout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '仪表板', requiresAuth: true }
      },
      {
        path: 'apis',
        name: 'Apis',
        component: () => import('@/views/Apis.vue'),
        meta: { title: 'API管理', requiresAuth: true }
      },
      {
        path: 'testing',
        name: 'Testing',
        component: () => import('@/views/Testing.vue'),
        meta: { title: 'API测试', requiresAuth: true }
      },
      {
        path: 'settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '设置', requiresAuth: true }
      }
    ]
  },
  // Redirect any unknown paths to the dashboard
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// Navigation Guard
router.beforeEach(async (to, from, next) => {
  // Set page title
  document.title = `AI API Manager - ${to.meta.title || '首页'}`;

  // Dynamically import the store only when needed
  const { useAuthStore } = await import('@/stores/auth.store.js');
  const authStore = useAuthStore();
  const isAuthenticated = authStore.isAuthenticated;

  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

  if (requiresAuth && !isAuthenticated) {
    // If not authenticated and trying to access a protected route, redirect to login
    return next({ name: 'Login', query: { redirect: to.fullPath } });
  } else if (isAuthenticated && to.name === 'Login') {
    // If authenticated and trying to access login page, redirect to dashboard
    return next({ name: 'Dashboard' });
  } else {
    // Otherwise, allow navigation
    next();
  }
});

export default router;