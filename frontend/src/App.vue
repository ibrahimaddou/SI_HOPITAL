<template>
  <div id="app">
    <nav class="bg-blue-500 text-white p-4">
      <div class="container mx-auto">
        <h1 class="text-xl font-bold">Système d'Information Hospitalier</h1>
      </div>
    </nav>
    <header>
      <nav class="navbar">
        <div class="nav-buttons">
          <button 
            v-if="!isLoggedIn" 
            @click="goToLogin" 
            class="login-button"
          >
            Se connecter
          </button>
          <button 
            v-else 
            @click="logout" 
            class="logout-button"
          >
            Se déconnecter
          </button>
        </div>
      </nav>
    </header>

    <main class="container mx-auto mt-4">
      <router-view />
      <ListPatient />
    </main>
  </div>
  <footer class="bg-gray-100 p-4 mt-8">
    <div class="container mx-auto text-center text-gray-600">
      &copy; 2025 Système d'Information Hospitalier
    </div>
  </footer>
</template>

<script>
//import DataFetcher from './components/DataFetcher.vue'

import ListPatient from "./components/ListPatient.vue";

//import Login from "./components/Login.vue";
import router from './router/router';


export default {
  name: "App",
  components: {
    
    ListPatient,
    
  },

  data() {
    return {
      isLoggedIn: false
    };
  },
  created() {
    // status de cnx
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      // Vérif token (jwt)
      const token = localStorage.getItem('token');
      this.isLoggedIn = !!token;
    },
    goToLogin() {
      router.push('/login');
    },
    logout() {
      // Supprimer le token et les infos de l'user
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.isLoggedIn = false;
      
      // Rediriger
      router.push('/login');
    }
  },
  watch: {
    $route() {
      // MAJ status cnx
      this.checkLoginStatus();
    }
  }
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

.logo {
  font-weight: bold;
  font-size: 1.5rem;
}

.login-button, .logout-button {
  background-color: #4CAF50;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-button {
  background-color: #f44336;
}
</style>