<template>
    <div class="container mx-auto p-4">
      <button @click="chargerChambresNonNettoyees">Charger les chambres non nettoyées</button>
      <div v-if="chargement">Chargement en cours...</div>
      <div v-if="erreur" class="erreur">{{ erreur }}</div>
      <div v-if="!chargement && !erreur && chambresNonNettoyees.length > 0">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étage</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dernier nettoyage</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(chambre, index) in chambresNonNettoyees" :key="index">
              <td class="px-6 py-4 whitespace-nowrap">{{ chambre.id_chambre }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ chambre.numero }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ chambre.etage }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ chambre.nom_service }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ chambre.dernier_nettoyage || 'Jamais' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!chargement && !erreur && chambresCherchees && chambresNonNettoyees.length === 0">
        Toutes les chambres ont été nettoyées récemment.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        chambresNonNettoyees: [],
        chargement: false,
        erreur: null,
        chambresCherchees: false,
      };
    },
    methods: {
      chargerChambresNonNettoyees() {
        this.chargement = true;
        this.erreur = null;
  
        axios
          .get("http://localhost:3002/chambresNonNettoyees")
          .then((response) => {
            if (response.data && response.data.chambresNonNettoyees) {
              this.chambresNonNettoyees = response.data.chambresNonNettoyees;
            } else if (Array.isArray(response.data)) {
              this.chambresNonNettoyees = response.data;
            } else {
              this.erreur = "Format de réponse incorrect";
              console.error("Format incorrect:", response.data);
            }
            this.chambresCherchees = true;
          })
          .catch((error) => {
            this.erreur = "Erreur lors du chargement des chambres non nettoyées: " + error.message;
            console.error("Erreur:", error);
            this.chambresCherchees = true;
          })
          .finally(() => {
            this.chargement = false;
          });
      },
    },
  };
  </script>
  
  <style scoped>
  .erreur {
    color: red;
    margin: 10px 0;
  }
  
  button {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  thead {
    background-color: #f4f4f4;
  }
  </style>