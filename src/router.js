import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'

export default createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      component: Home,
    },
    {
      path: '/login',
      component: () => import('@/views/Login.vue'),
    },
    {
      path: '/admin',
      component: () => import('@/views/Admin.vue'),
    },
    {
      path: '/channels',
      component: () => import('@/views/Channels.vue'),
    },
    {
      path: '/channel/:name',
      component: () => import('@/views/Channel.vue'),
    }
  ],
})
