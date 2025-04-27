import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import AdminDashboard from '@/components/Admin/AdminDashboard.vue'


const routes = [
  {
    path: '/',
    redirect: '/Acceuil'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin/dashboard',
    name: 'Admin Dashboard',
    component: AdminDashboard
  },
  {
    path: '/medecin/dashboard',
    name: 'Medecin Dashboard',
    component: AdminDashboard
  },
  {
    path: '/infirmier/dashboard',
    name: 'Infirmier Dashboard',
    component: AdminDashboard
  },


  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router