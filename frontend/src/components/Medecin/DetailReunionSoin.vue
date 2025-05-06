<template>
    <div class="container mx-auto p-6 bg-white rounded shadow mt-6">
      <div class="mb-4">
        <label class="block text-sm font-medium text-gray-700"
          >Sélectionner un soin :</label
        >
        <select
          v-model="idSoin"
          class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
        >
          <option value="" disabled>Choisissez un soin</option>
          <option v-for="soin in listeSoins" :key="soin.id_soin" :value="soin.id_soin">
            #{{ soin.id_soin }} - {{ soin.soin_description }}
          </option>
        </select>
      </div>
  
      <button
        @click="chargerDetailReunion"
        class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Afficher les détails de la réunion
      </button>
  
      <!-- Affichage des détails de la réunion -->
      <div v-if="reunion" class="mt-6 bg-blue-50 p-4 rounded shadow">
        <h2 class="text-xl font-bold mb-2">
          Réunion #{{ reunion.id_reunion }}
        </h2>
        <div class="space-y-2">
          <p><strong>Date :</strong> {{ formatDate(reunion.date_reunion) }}</p>
          <p><strong>Sujet :</strong> {{ reunion.sujet }}</p>
          <div class="mt-4">
            <h3 class="text-lg font-semibold mb-2">Compte rendu</h3>
            <div class="bg-white p-3 rounded border border-gray-200">
              {{ reunion.compte_rendu || "Aucun compte rendu disponible" }}
            </div>
          </div>
        </div>
      </div>
  
      <div v-if="message" class="mt-4 text-red-600">
        {{ message }}
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        idSoin: "",
        reunion: null,
        message: "",
        listeSoins: []
      };
    },
    
    async mounted() {
      await this.chargerListeSoins();
    },
    
    methods: {
      // Méthode pour formater la date
      formatDate(dateString) {
        if (!dateString) return "Date non spécifiée";
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      },
      
      async chargerListeSoins() {
        try {
          const response = await axios.get("http://localhost:3002/soins");
          this.listeSoins = response.data;
        } catch (error) {
          console.error("Erreur lors du chargement de la liste des soins :", error);
          this.message = "Erreur lors de la récupération de la liste des soins.";
        }
      },
      
      async chargerDetailReunion() {
        this.message = "";
        this.reunion = null;
  
        if (!this.idSoin) {
          this.message = "Veuillez sélectionner un soin.";
          return;
        }
  
        try {
          const response = await axios.get(
            `http://localhost:3002/afficherDetailReunion/${this.idSoin}`
          );
  
          this.reunion = response.data;
          
          if (!this.reunion) {
            this.message = "Aucune réunion associée à ce soin n'a été trouvée.";
          }
        } catch (error) {
          console.error("Erreur lors du chargement des détails de la réunion :", error);
          
          if (error.response && error.response.status === 404) {
            this.message = "Aucune réunion n'est associée à ce soin.";
          } else {
            this.message = "Erreur lors de la récupération des détails de la réunion.";
          }
        }
      }
    }
  };
  </script>
  
  <style scoped>
  button {
    cursor: pointer;
  }
  </style>