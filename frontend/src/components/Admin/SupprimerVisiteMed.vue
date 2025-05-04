<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Visites Médicales</h2>
      
      <!-- Tableau des visites -->
      <div class="bg-white rounded shadow overflow-hidden mb-4">
        <div v-if="chargement" class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p class="mt-2 text-gray-600">Chargement des visites médicales...</p>
        </div>
        
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left">ID</th>
              <th class="px-4 py-2 text-left">Patient</th>
              <th class="px-4 py-2 text-left">Médecin</th>
              <th class="px-4 py-2 text-left">Date</th>
              <th class="px-4 py-2 text-left">Examens</th>
              <th class="px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="visite in visites" :key="visite.id_visite" class="hover:bg-gray-50">
              <td class="px-4 py-2">{{ visite.id_visite }}</td>
              <td class="px-4 py-2">{{ visite.patient.nom }} {{ visite.patient.prenom }}</td>
              <td class="px-4 py-2">Dr. {{ visite.medecin.nom }}</td>
              <td class="px-4 py-2">{{ formatDateTime(visite.date_visite) }}</td>
              <td class="px-4 py-2">
                {{ visite.examens_pratiques ? (visite.examens_pratiques.length > 30 ? visite.examens_pratiques.substring(0, 30) + '...' : visite.examens_pratiques) : 'Aucun' }}
              </td>
              <td class="px-4 py-2">
                <button 
                  @click="supprimerVisite(visite.id_visite)" 
                  class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Supprimer
                </button>
              </td>
            </tr>
            
            <tr v-if="visites.length === 0">
              <td colspan="6" class="px-4 py-2 text-center text-gray-500">
                Aucune visite médicale trouvée.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Modal de confirmation -->
      <div v-if="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 class="text-lg font-bold mb-4 text-red-600">Confirmation de suppression</h3>
          
          <p class="mb-4">Êtes-vous sûr de vouloir supprimer cette visite médicale ?</p>
          <p class="mb-4">Cette action est irréversible.</p>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="annulerSuppression" 
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Annuler
            </button>
            <button 
              @click="confirmerSuppression" 
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              :disabled="suppressionEnCours"
            >
              {{ suppressionEnCours ? 'Suppression...' : 'Supprimer' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Message de résultat -->
      <div v-if="message" class="mt-4 p-4 rounded" :class="messageClasse">
        {{ message }}
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        visites: [],
        chargement: true,
        modalVisible: false,
        visiteIdASupprimer: null,
        suppressionEnCours: false,
        message: "",
        messageClasse: ""
      };
    },
    mounted() {
      this.chargerVisites();
    },
    methods: {
      chargerVisites() {
        this.chargement = true;
        
        axios.get("http://localhost:3002/afficherVisitesMedicales")
          .then(response => {
            this.visites = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des visites:", error);
            this.afficherMessage("Impossible de charger les visites médicales", "error");
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      
      supprimerVisite(id) {
        this.visiteIdASupprimer = id;
        this.modalVisible = true;
      },
      
      confirmerSuppression() {
        if (!this.visiteIdASupprimer) return;
        
        this.suppressionEnCours = true;
        
        axios.delete(`http://localhost:3002/supprimerVisiteMedicale/${this.visiteIdASupprimer}`)
          .then(() => {
            this.afficherMessage("La visite médicale a été supprimée avec succès", "success");
            this.chargerVisites();
          })
          .catch(error => {
            console.error("Erreur lors de la suppression:", error);
            this.afficherMessage(
              "Erreur lors de la suppression de la visite: " + 
              (error.response?.data?.error || error.message), 
              "error"
            );
          })
          .finally(() => {
            this.suppressionEnCours = false;
            this.modalVisible = false;
            this.visiteIdASupprimer = null;
          });
      },
      
      annulerSuppression() {
        this.modalVisible = false;
        this.visiteIdASupprimer = null;
      },
      
      afficherMessage(message, type) {
        this.message = message;
        if (type === "error") {
          this.messageClasse = "bg-red-100 text-red-700 border border-red-500";
        } else {
          this.messageClasse = "bg-green-100 text-green-700 border border-green-500";
        }
      },
      
      formatDateTime(dateTimeString) {
        if (!dateTimeString) return "Non définie";
        
        const date = new Date(dateTimeString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
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