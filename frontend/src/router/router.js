import { createRouter, createWebHistory } from 'vue-router'
import Login from '../components/Login.vue'
import AdminDashboard from '@/components/AdminDashboard.vue'
import MedecinDashboard from '@/components/MedecinDashboard.vue'
import InfirmierDashboard from '@/components/InfirmierDashboard.vue'
import PersonnelNettDashboard from '@/components/PersonnelNettDashboard.vue'


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
  {
    path: '/personnelNett/dashboard',
    name: 'Personnel Nettoyage Dashboard',
    component: PersonnelNettDashboard,
    meta: {
      requiresAuth: true,
      role: 'personnelNett'
    }
  },

  
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// guard de navigation
router.beforeEach((to) => {
  // Récupération du token JWT
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  
  // Si l'utilisateur n'est pas authentifié
  if (to.meta.requiresAuth && !isAuthenticated) {
    return { path: '/Accueil', query: { redirect: to.fullPath } };
  }
  
  if (isAuthenticated && to.meta.role) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      
      // Vérif de l'expiration du token
      if (payload.exp && payload.exp < Date.now() / 1000) {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        return { path: '/Accueil', query: { reason: 'session_expired' } };
      }
      
      // vérification du rôle
      const userRole = payload.role || localStorage.getItem('role');
      if (to.meta.role !== userRole) {
        return { path: '/login', query: { reason: 'unauthorized' } };
      }
    } catch (error) {
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      return { path: '/login', query: { reason: 'invalid_token' } };
    }
  }
  
  // Si tout est OK
  return true;
});

export default router