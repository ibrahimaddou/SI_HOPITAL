<template>
    <div>
      <h2>Liste des Médecins</h2>
      <button @click="chargerMedecins">Charger les médecins</button>
      
      <div v-if="chargement">Chargement en cours...</div>
      
      <div v-if="erreur">{{ erreur }}</div>
      
      <ul v-if="medecins.length > 0">
        <li v-for="medecin in medecins" :key="medecin.id">
          {{ medecin.nom }} {{ medecin.prenom }}
          <!-- Affichez d'autres propriétés selon la structure de vos données -->
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    data() {
      return {
        medecins: [],
        chargement: false,
        erreur: null
      }
    },
    methods: {
      chargerMedecins() {
        this.chargement = true;
        this.erreur = null;
        
        axios.get('http://localhost:3002/medecins')
          .then(response => {
            this.medecins = response.data;
          })
          .catch(error => {
            this.erreur = "Erreur lors du chargement des médecins: " + error.message;
            console.error('Erreur:', error);
          })
          .finally(() => {
            this.chargement = false;
          });
      }
    },
    // Si vous voulez charger les médecins dès le chargement du composant
    mounted() {
      this.chargerMedecins();
    }
  }
  </script>