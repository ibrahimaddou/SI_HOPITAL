<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Supprimer une visite médicale</h2>
    
    <!-- Tableau des visites -->
    <div class="bg-white rounded shadow overflow-hidden">
      <div v-if="chargement" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-2 text-gray-600">Chargement des visites médicales...</p>
      </div>
      
      <table v-else class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date visite</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Examens pratiqués</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Commentaires</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="visite in visites" :key="visite.id_visite" class="hover:bg-gray-50">
            <td class="px-6 py-4 whitespace-nowrap">{{ visite.id_visite }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ formatDateTime(visite.date_visite) }}</td>
            <td class="px-6 py-4">
              {{ visite.examens_pratiques ? (visite.examens_pratiques.length > 30 ? visite.examens_pratiques.substring(0, 30) + '...' : visite.examens_pratiques) : 'Aucun' }}
            </td>
            <td class="px-6 py-4">
              {{ visite.commentaires ? (visite.commentaires.length > 30 ? visite.commentaires.substring(0, 30) + '...' : visite.commentaires) : 'Aucun' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button 
                v-if="peutEtreSupprimee(visite)"
                @click="selectionnerVisite(visite.id_visite)" 
                class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Supprimer
              </button>
              <span v-else class="text-sm text-gray-500">
                {{ getRaisonNonSupprimable(visite) }}
              </span>
            </td>
          </tr>
          
          <tr v-if="visites.length === 0">
            <td colspan="5" class="px-6 py-4 text-center text-gray-500">
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
        
        <div v-if="visiteASupprimer">
          <p class="mb-4">Vous êtes sur le point de supprimer la visite médicale suivante :</p>
          
          <div class="mb-4 bg-gray-50 p-3 rounded">
            <p><span class="font-semibold">ID :</span> {{ visiteASupprimer.id_visite }}</p>
            <p><span class="font-semibold">Date :</span> {{ formatDateTime(visiteASupprimer.date_visite) }}</p>
            <p v-if="visiteASupprimer.examens_pratiques">
              <span class="font-semibold">Examens pratiqués :</span> {{ visiteASupprimer.examens_pratiques }}
            </p>
          </div>
          
          <div class="mb-4">
            <label class="block font-semibold mb-2">Raison de l'annulation :</label>
            <textarea 
              v-model="raisonSuppression" 
              rows="3"
              required
              class="w-full p-2 border rounded"
              placeholder="Précisez pourquoi cette visite médicale doit être annulée"
            ></textarea>
          </div>
          
          <div class="flex justify-end space-x-3">
            <button 
              @click="fermerModal" 
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Annuler
            </button>
            <button 
              @click="confirmerSuppression" 
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
              :disabled="!raisonSuppression || suppressionEnCours"
            >
              {{ suppressionEnCours ? 'Suppression en cours...' : 'Supprimer définitivement' }}
            </button>
          </div>
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
      visiteSelectionnee: null,
      visiteASupprimer: null,
      modalVisible: false,
      raisonSuppression: "",
      chargement: true,
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
    
    peutEtreSupprimee(visite) { 
      const dateVisite = new Date(visite.date_visite);
      const maintenant = new Date();
      
      if (dateVisite > maintenant) {
        return true; // Visite future
      }
      
      if (!visite.examens_pratiques && !visite.commentaires) {
        return true; // Visite passée sans éléments indiquant qu'elle a eu lieu
      }
      
      return false;
    },
    
    getRaisonNonSupprimable(visite) {
      const dateVisite = new Date(visite.date_visite);
      const maintenant = new Date();
      
      if (dateVisite <= maintenant && (visite.examens_pratiques || visite.commentaires)) {
        return "Visite déjà effectuée";
      }
      
      return "Non supprimable";
    },
    
    selectionnerVisite(id_visite) {
      this.visiteSelectionnee = id_visite;
      this.visiteASupprimer = this.visites.find(v => v.id_visite === id_visite);
      
      if (this.visiteASupprimer) {
        this.modalVisible = true;
      }
    },
    
    fermerModal() {
      this.modalVisible = false;
      this.raisonSuppression = "";
    },
    
    confirmerSuppression() {
      if (!this.raisonSuppression || !this.visiteASupprimer) {
        return;
      }
      
      this.suppressionEnCours = true;
      
      axios.delete(`http://localhost:3002/supprimerVisiteMedicale/${this.visiteASupprimer.id_visite}`, {
        data: { raison_annulation: this.raisonSuppression }
      })
        .then(() => {
          this.afficherMessage("La visite médicale a été supprimée avec succès", "success");
          this.chargerVisites();
          this.fermerModal();
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
        });
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

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4f46e5;
}
</style>