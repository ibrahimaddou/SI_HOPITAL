<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Liste des services de l'hôpital</h2>
      
      <div v-if="chargement" class="text-center py-4">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Chargement des services...</p>
      </div>
      <div v-if="erreur" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{{ erreur }}</p>
      </div>
      
      <div v-if="!chargement && !erreur" class="bg-white rounded shadow overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Étage</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Médecin référent</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsable administratif</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="service in services" :key="service.id_service" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{{ service.nom }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ service.etage }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ service.medecin_referent ? `${service.medecin_referent.prenom} ${service.medecin_referent.nom}` : 'Non assigné' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ service.responsable_admin ? `${service.responsable_admin.prenom} ${service.responsable_admin.nom}` : 'Non assigné' }}
              </td>
            </tr>
            
            <!-- quand aucun service n'est trouvé -->
            <tr v-if="services.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                Aucun service trouvé.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        services: [],
        chargement: true,
        erreur: null
      };
    },
    mounted() {
      this.chargerServices();
    },
    methods: {
      chargerServices() {
        this.chargement = true;
        this.erreur = null;
        
        axios.get("http://localhost:3002/services")
          .then(response => {
            this.services = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des services:", error);
            this.erreur = "Impossible de charger la liste des services. Veuillez réessayer plus tard.";
          })
          .finally(() => {
            this.chargement = false;
          });
      }
    }
  };
  </script>
  
  <style scoped>
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
  </style>