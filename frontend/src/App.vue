<template>
  <div id="app">
    <nav class="bg-blue-500 text-white p-4">
      <div class="container mx-auto">
        <h1 class="text-xl font-bold">Système d'Information Hospitalier</h1>
      </div>
    </nav>
    <header>
      <nav class="navbar">
        <div class="logo">Hôpital SI</div>
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
      <ListeMedecins />
      <ListeInfirm />
      <ListPersAdmin />
      <ListPatient />
      <AjouterMedecin />
      <ListPersNet />
      <Login />
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
import AjouterMedecin from "./components/AjouterMedecin.vue";
import ListeInfirm from "./components/ListeInfirm.vue";
import ListeMedecins from "./components/ListeMedecins.vue";
import ListPatient from "./components/ListPatient.vue";
import ListPersAdmin from "./components/ListPersAdmin.vue";
import ListPersNet from "./components/ListPersNet.vue";
import Login from "./components/Login.vue";
import router from './router'; 


export default {
  name: "App",
  components: {
    ListeMedecins,
    ListeInfirm,
    ListPatient,
    ListPersAdmin,
    ListPersNet,
    AjouterMedecin,
    Login,
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
</style>
