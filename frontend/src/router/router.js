import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import MedecinDashboard from '@/components/MedecinDashboard.vue'
import InfirmierDashboard from '@/components/InfirmierDashboard.vue'


const routes = [
  {
    path: '/',
    redirect: '/acceuil'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/admin/dashboard',
    name: 'Admin Dashboard',
    component: AdminDashboard,
    meta: {
      requiresAuth: true,
      role: 'admin'
    }

  },
  {
    path: '/medecin/dashboard',
    name: 'Medecin Dashboard',
    component: MedecinDashboard,
    meta: {
      requiresAuth: true,
      role: 'medecin'
    }
  },
  {
    path: '/infirmier/dashboard',
    name: 'Infirmier Dashboard',
    component: InfirmierDashboard,
    meta: {
      requiresAuth: true,
      role: 'infirmier'
    }
  },


  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// guard de navigation
router.beforeEach(async (to, from) => {
  //si l'utilisateur est authentifié
  const isAuthenticated = localStorage.getItem('token') !== null
  const userRole = localStorage.getItem('role')
  
  // si l'utilisateur n'est pas connecté
  if (to.meta.requiresAuth && !isAuthenticated) {
    // redirect vers page accueil
    return { path: '/accueil', query: { redirect: to.fullPath } }
  }
  
  if (to.meta.role && to.meta.role !== userRole) {
    // le cas ou l' utilisateur n'a pas le bon rôle
      return { path: '/login' }
   
  }
  
  // si tout est OK
  return true
})

export default router