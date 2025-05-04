<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Liste des soins à effectuer</h2>
      
      <div v-if="chargement" class="text-center py-4">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Chargement des soins...</p>
      </div>
      <div v-if="erreur" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
        <p>{{ erreur }}</p>
      </div>
      
      <div v-if="!chargement && !erreur" class="bg-white rounded shadow overflow-hidden">      
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type de soin</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="soin in soins" :key="soin.id_soin" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{{ soin.patient ? `${soin.patient.prenom} ${soin.patient.nom}` : (soin.prenom_patient && soin.nom_patient ? `${soin.prenom_patient} ${soin.nom_patient}` : 'Patient non spécifié') }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ soin.type_soin || 'Non spécifié' }}</td>
              <td class="px-6 py-4">{{ soin.description || 'Aucune description' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(soin.statut)" class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full">
                  {{ soin.statut || 'Non défini' }}
                </span>
              </td>
            </tr>
            
            <!-- quand aucun soin n'est trouvé -->
            <tr v-if="soins.length === 0">
              <td colspan="4" class="px-6 py-4 text-center text-gray-500">
                Aucun soin à effectuer trouvé.
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
        soins: [],
        chargement: true,
        erreur: null,
        idInfirmier: null
      };
    },
    mounted() {
      // Récupérer l'ID de l'infirmier connecté (à adapter selon votre système d'authentification)
      this.idInfirmier = localStorage.getItem('idInfirmier') || '1'; // Utilisez '1' comme valeur par défaut ou autre logique
      this.chargerSoins();
    },
    methods: {
      async chargerSoins() {
        this.chargement = true;
        this.erreur = null;
        
        try {
          const response = await axios.get(`http://localhost:3002/afficherSoinsAEffectuer/${this.idInfirmier}`);
          console.log("Données reçues de l'API:", response.data);
          this.soins = response.data;
        } catch (error) {
          console.error("Erreur lors du chargement des soins:", error);
          this.erreur = "Impossible de charger la liste des soins. Veuillez réessayer plus tard.";
        } finally {
          this.chargement = false;
        }
      },
      
      getStatusClass(statut) {
        if (!statut) return 'bg-gray-100 text-gray-800';
        
        switch (String(statut).toLowerCase()) {
          case 'planifié':
          case 'planifie':
            return 'bg-blue-100 text-blue-800';
          case 'effectué':
          case 'effectue':
            return 'bg-green-100 text-green-800';
          case 'en attente':
            return 'bg-yellow-100 text-yellow-800';
          case 'annulé':
          case 'annule':
            return 'bg-red-100 text-red-800';
          case 'en retard':
            return 'bg-orange-100 text-orange-800';
          default:
            return 'bg-gray-100 text-gray-800';
        }
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