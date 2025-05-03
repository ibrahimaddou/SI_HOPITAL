<template>
    <div class="container mx-auto p-4">
      <button @click="chargerChambresVides">Charger les chambres vides</button>
      <div v-if="chargement">Chargement en cours...</div>
      <div v-if="erreur" class="erreur">{{ erreur }}</div>
      <div v-if="!chargement && !erreur && chambresVides.length > 0">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Numéro</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étage</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacité</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(chambre, index) in chambresVides" :key="index">
              <td class="px-6 py-4 whitespace-nowrap">{{ chambre.id_chambre }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ chambre.numero }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ chambre.etage }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ chambre.capacite }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ chambre.nom_service }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!chargement && !erreur && chambresCherchees && chambresVides.length === 0">
        Aucune chambre vide trouvée.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        chambresVides: [],
        chargement: false,
        erreur: null,
        chambresCherchees: false,
      };
    },
    methods: {
      chargerChambresVides() {
        this.chargement = true;
        this.erreur = null;
  
        axios
          .get("http://localhost:3002/chambresVides")
          .then((response) => {
            if (response.data && response.data.chambresVides) {
              this.chambresVides = response.data.chambresVides;
            } else if (Array.isArray(response.data)) {
              this.chambresVides = response.data;
            } else {
              this.erreur = "Format de réponse incorrect";
              console.error("Format incorrect:", response.data);
            }
            this.chambresCherchees = true;
          })
          .catch((error) => {
            this.erreur = "Erreur lors du chargement des chambres vides: " + error.message;
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