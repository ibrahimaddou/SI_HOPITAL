<template>
    <div class="container mx-auto p-4">
      <!-- Bouton pour charger les réunions -->
      <button @click="chargerReunions" class="btn-primary">Charger les réunions</button>
  
      <!-- Indicateur de chargement -->
      <div v-if="chargement" class="mt-4">Chargement en cours...</div>
  
      <!-- Message d'erreur -->
      <div v-if="erreur" class="erreur mt-4">{{ erreur }}</div>
  
      <!-- Liste des réunions (visible uniquement après chargement) -->
      <div v-if="!chargement && !erreur && reunions.length > 0" class="mt-4">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sujet
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Compte rendu
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Soins décidés
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Médecins participants
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Infirmiers participants
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(reunion, index) in reunions" :key="index">
              <td class="px-6 py-4 whitespace-nowrap">{{ reunion.id_reunion }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(reunion.date_reunion) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ reunion.sujet }}</td>
              <td class="px-6 py-4">
                <div class="max-h-32 overflow-y-auto">
                  {{ reunion.compte_rendu || "Aucun compte rendu disponible" }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">{{ reunion.nombre_soins }}</td>
              <td class="px-6 py-4">
                {{ reunion.medecins_participants || "Aucun médecin" }}
              </td>
              <td class="px-6 py-4">
                {{ reunion.infirmiers_participants || "Aucun infirmier" }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Message si aucune réunion trouvée après tentative de chargement -->
      <div v-if="!chargement && !erreur && reunionsCherchees && reunions.length === 0" class="mt-4">
        Aucune réunion trouvée.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        reunions: [],
        chargement: false,
        erreur: null,
        reunionsCherchees: false, // Indique si une recherche a été effectuée
      };
    },
    methods: {
      chargerReunions() {
        this.chargement = true;
        this.erreur = null;
  
        axios
          .get("http://localhost:3002/reunions")
          .then((response) => {
            // Vérifiez la structure de votre réponse
            if (response.data && Array.isArray(response.data)) {
              this.reunions = response.data;
            } else {
              this.erreur = "Format de réponse incorrect";
              console.error("Format incorrect:", response.data);
            }
            this.reunionsCherchees = true; // Marquer que la recherche a été effectuée
          })
          .catch((error) => {
            this.erreur =
              "Erreur lors du chargement des réunions: " + error.message;
            console.error("Erreur:", error);
            this.reunionsCherchees = true;
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      formatDate(dateString) {
        if (!dateString) return "Non spécifiée";
  
        // Format de date pour l'affichage (ex: 15/04/2023)
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
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
  
  .btn-primary {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  .btn-primary:hover {
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