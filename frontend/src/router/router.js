import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'


const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },

  {
    path: '/',
    redirect: '/admin/dashboard'
  },
  {
    path: '/admin/dashboard',
    name: 'Admin Dashboard',
    component: AdminDashboard
  },

  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router