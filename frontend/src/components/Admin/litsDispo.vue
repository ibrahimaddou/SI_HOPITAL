<template>
    <div class="container mx-auto p-4">
      <button @click="chargerLitsDisponibles">Charger les lits disponibles</button>
  
      <div v-if="chargement">Chargement en cours...</div>
  
      <div v-if="erreur" class="erreur">{{ erreur }}</div>
  
      <!-- Liste des lits disponibles  -->
      <div v-if="!chargement && !erreur && litsDisponibles.length > 0">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Id Lit
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Numéro
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Chambre
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Étage
              </th>
              <th
                class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Service
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(lit, index) in litsDisponibles" :key="index">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ lit.id_lit }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ lit.numero }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ lit.numero_chambre }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ lit.etage }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ lit.nom_service }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Message si aucun lit disponible trouvé après tentative de chargement -->
      <div
        v-if="
          !chargement && !erreur && litsCherches && litsDisponibles.length === 0
        "
      >
        Aucun lit disponible trouvé.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        litsDisponibles: [],
        chargement: false,
        erreur: null,
        litsCherches: false, // Indique si une recherche a été effectuée
      };
    },
    methods: {
      chargerLitsDisponibles() {
        this.chargement = true;
        this.erreur = null;
  
        axios
          .get("http://localhost:3002/litsDisponibles") // Endpoint pour les lits disponibles
          .then((response) => {
            if (response.data && response.data.litsDisponibles) {
              this.litsDisponibles = response.data.litsDisponibles;
            } else if (Array.isArray(response.data)) {
              this.litsDisponibles = response.data;
            } else {
              this.erreur = "Format de réponse incorrect";
              console.error("Format incorrect:", response.data);
            }
            this.litsCherches = true; 
          })
          .catch((error) => {
            this.erreur =
              "Erreur lors du chargement des lits disponibles: " + error.message;
            console.error("Erreur:", error);
            this.litsCherches = true;
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
  
  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  thead {
    background-color: #f4f4f4;
  }
  </style>