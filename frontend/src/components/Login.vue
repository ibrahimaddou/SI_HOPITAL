<template>
    <div class="login-container">
      <div class="login-form">
        <h2>Connexion</h2>
        <div v-if="error" class="error-message">{{ error }}</div>
        
        <form @submit.prevent="login">
          <div class="form-group">
            <label for="userType">Type d'utilisateur</label>
            <select 
              id="userType" 
              v-model="userType" 
              required
              class="form-select"
            >
              <option value="">Sélectionnez votre rôle</option>
              <option value="admin">Administrateur</option>
              <option value="medecin">Médecin</option>
              <option value="infirmier">Infirmier</option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="username">Nom d'utilisateur</label>
            <input 
              type="text" 
              id="username" 
              v-model="username" 
              required
              placeholder="Entrez votre nom d'utilisateur"
            >
          </div>
          
          <div class="form-group">
            <label for="password">Mot de passe</label>
            <input 
              type="password" 
              id="password" 
              v-model="password" 
              required
              placeholder="Entrez votre mot de passe"
            >
          </div>
          
          <button type="submit" :disabled="loading">
            {{ loading ? 'Connexion en cours...' : 'Se connecter' }}
          </button>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'LoginView',
    data() {
      return {
        username: '',
        password: '',
        userType: '',
        error: null,
        loading: false
      };
    },
    methods: {
      async login() {
        this.error = null;
        
        //  type d'utilisateur
        if (!this.userType) {
          this.error = "Veuillez sélectionner votre type d'utilisateur";
          return;
        }
        
        this.loading = true;
        
        try {
          const response = await axios.post('http://localhost:3002/login', {
            username: this.username,
            password: this.password,
            userType: this.userType
          });
          
          // Stocker le token et les infos utilisateur
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          
          // Redirection selon le rôle
          if (response.data.user.role === 'admin') {
            this.$router.push('/admin/dashboard');
          } else if (response.data.user.role === 'medecin') {
            this.$router.push('/medecin/dashboard');
          } else if (response.data.user.role === 'infirmier') {
            this.$router.push('/infirmier/dashboard');
          }
          
        } catch (error) {
          if (error.response && error.response.data) {
            this.error = error.response.data.message || 'Erreur de connexion';
          } else {
            this.error = 'Erreur de connexion au serveur';
          }
        } finally {
          this.loading = false;
        }
      }
    }
  };
  </script>
  
  <style scoped>
  .login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100vh;
    background-color: #f5f5f5;
  }
  
  .login-form {
    width: 400px;
    padding: 30px;
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  h2 {
    margin-bottom: 20px;
    text-align: center;
    color: #2c3e50;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #2c3e50;
  }
  
  input, .form-select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }
  
  button {
    width: 100%;
    padding: 12px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    font-size: 16px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .error-message {
    padding: 10px;
    margin-bottom: 20px;
    background-color: #ffebee;
    color: #c62828;
    border-radius: 4px;
    text-align: center;
  }
  </style>