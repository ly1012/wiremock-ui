import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: 'stubs'
    }, {
      path: '/stubs',
      name: 'stubs',
      component: () => import('@/views/stubs/Stubs.vue'),
      meta: {
        title: 'Stubs'
      }
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('@/views/logs/Logs.vue'),
      meta: {
        title: 'Logs'
      }
    }, { 
      path: '/:pathMatch(.*)*', 
      name: 'NotFound', 
      redirect: 'stubs' 
    }
  ]
})

export default router
