<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Liste des médicaments</h2>
        <button @click="chargerMedicaments" class="mb-4">Charger les médicaments</button>
  
      <div v-if="chargement">Chargement en cours...</div>
  
      <div v-if="erreur" class="erreur">{{ erreur }}</div>
  
      <!-- Liste des médicaments -->
      <div v-if="!chargement && !erreur && medicaments.length > 0">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nom
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dosage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="medicament in medicaments" :key="medicament.id_medicament">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ medicament.id_medicament }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap font-medium">
                {{ medicament.nom }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ medicament.dosage || "Non spécifié" }}
              </td>
              <td class="px-6 py-4">
                {{ medicament.description || "Aucune description" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
        <div v-if="!chargement && !erreur && medicamentsCherches && medicaments.length === 0">
        Aucun médicament trouvé.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        medicaments: [],
        chargement: false,
        erreur: null,
        medicamentsCherches: false, 
      };
    },
    methods: {
      chargerMedicaments() {
        this.chargement = true;
        this.erreur = null;
  
        axios
          .get("http://localhost:3002/afficherMedicaments")
          .then((response) => {
            if (response.data && Array.isArray(response.data)) {
              this.medicaments = response.data;
            } else if (response.data && response.data.medicaments) {
              this.medicaments = response.data.medicaments;
            } else {
              this.erreur = "Format de réponse incorrect";
              console.error("Format incorrect:", response.data);
            }
            this.medicamentsCherches = true; 
          })
          .catch((error) => {
            this.erreur =
              "Erreur lors du chargement des médicaments: " + error.message;
            console.error("Erreur:", error);
            this.medicamentsCherches = true;
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