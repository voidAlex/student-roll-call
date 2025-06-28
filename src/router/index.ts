import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'studentManage',
      component: () => import('../views/StudentManage.vue'),
    },
    {
      path: '/about',
      name: 'about',
      component: () => import('../views/AboutView.vue'),
    },
    {
      path: '/class-manage',
      name: 'classManage',
      component: () => import('../views/ClassManage.vue'),
    },
    {
      path: '/roll-call',
      name: 'rollCall',
      component: () => import('../views/RollCall.vue'),
    },
    {
      path: '/reports',
      name: 'reports',
      component: () => import('../views/Reports.vue'),
    },
    // 在现有路由中添加随机点名路由
    {
      path: '/random-call',
      name: 'randomCall',
      component: () => import('../views/RandomCall.vue'),
    }
  ],
})

export default router
