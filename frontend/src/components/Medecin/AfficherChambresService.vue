<template>
    <div class="container mx-auto p-4">
      <!-- Sélection du service -->
      <div class="mb-4">
        <label for="serviceId" class="mr-2">Service:</label>
        <select 
          id="serviceId" 
          v-model="serviceId" 
          class="border rounded px-2 py-1 mr-2"
        >
          <option value="">Sélectionnez un service</option>
          <option v-for="service in services" :key="service.id_service" :value="service.id_service">
            {{ service.id_service }} - {{ service.nom }}
          </option>
        </select>
        <button @click="chargerChambres" class="ml-2">Afficher les chambres</button>
      </div>
  
      <!-- Informations du service -->
      <div v-if="nomService" class="bg-gray-100 p-4 rounded mb-4">
        <h2 class="text-xl font-bold">Service: {{ nomService }}</h2>
      </div>
  
      <div v-if="chargement">Chargement en cours...</div>
  
      <div v-if="erreur" class="erreur">{{ erreur }}</div>
  
      <!-- Liste des chambres -->
      <div v-if="!chargement && !erreur && chambres.length > 0">
        <h3 class="text-lg font-semibold mb-2">Chambres disponibles</h3>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Étage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacité
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lits Total
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lits Occupés
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Lits Disponibles
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="chambre in chambres" :key="chambre.id_chambre">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ chambre.numero }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ chambre.etage }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ chambre.capacite }} personnes
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ chambre.nombre_lits_total }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ chambre.nombre_lits_occupes }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap" :class="{'text-green-600': chambre.nombre_lits_disponibles > 0, 'text-red-600': chambre.nombre_lits_disponibles === 0}">
                {{ chambre.nombre_lits_disponibles }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <div v-if="!chargement && !erreur && chambresCherchees && chambres.length === 0">
        Aucune chambre trouvée pour ce service.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        serviceId: "", 
        nomService: "", 
        chambres: [],
        services: [], 
        chargement: false,
        erreur: null,
        chambresCherchees: false,  
      };
    },
    created() {
       this.chargerServices();
    },
    methods: {
       chargerServices() {
        this.chargement = true;
        
        axios
          .get('http://localhost:3002/services')
          .then(response => {
            if (response.data && Array.isArray(response.data)) {
              this.services = response.data;
            } else {
              console.error("Format de réponse incorrect pour les services:", response.data);
            }
          })
          .catch(error => {
            console.error("Erreur lors du chargement des services:", error);
            this.erreur = "Erreur lors du chargement des services";
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      
      chargerChambres() {
        if (!this.serviceId) {
          this.erreur = "Veuillez sélectionner un service";
          return;
        }
  
        this.chargement = true;
        this.erreur = null;
        this.chambres = [];
        this.nomService = "";
  
        //service sélectionné
        const serviceSelectionne = this.services.find(s => s.id_service == this.serviceId);
        if (serviceSelectionne) {
          this.nomService = serviceSelectionne.nom;
        }
  
         axios
          .get(`http://localhost:3002/afficherChambres/${this.serviceId}`)
          .then((response) => {
             if (response.data && Array.isArray(response.data) && response.data.length > 0) {
              this.chambres = response.data;
             } else if (response.data && Array.isArray(response.data) && response.data.length === 0) {
               this.erreur = "Aucune chambre trouvée pour ce service";
            } else {
              this.erreur = "Format de réponse incorrect";
              console.error("Format incorrect:", response.data);
            }
            this.chambresCherchees = true;  
          })
          .catch((error) => {
            if (error.response && error.response.status === 404) {
              this.erreur = "Service non trouvé";
            } else {
              this.erreur = "Erreur lors du chargement des données: " + (error.response?.data?.error || error.message);
            }
            console.error("Erreur:", error);
            this.chambresCherchees = true;
          })
          .finally(() => {
            this.chargement = false;
          });
      }
    },
  };
  </script>
  
  <style scoped>
  .erreur {
    color: red;
    margin: 10px 0;
  }
  
  button {
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
    margin-top: 15px;
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