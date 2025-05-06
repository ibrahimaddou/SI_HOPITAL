<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Annuler une réunion</h2>
      
      <!-- Tableau des réunions -->
      <div class="bg-white rounded shadow overflow-hidden">
        <div v-if="chargement" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p class="mt-2 text-gray-600">Chargement des réunions...</p>
        </div>
        
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sujet</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Compte rendu</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="reunion in reunions" :key="reunion.id_reunion" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">{{ reunion.id_reunion }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(reunion.date_reunion) }}</td>
              <td class="px-6 py-4">
                {{ reunion.sujet.length > 50 ? reunion.sujet.substring(0, 50) + '...' : reunion.sujet }}
              </td>
              <td class="px-6 py-4">
                {{ reunion.compte_rendu ? (reunion.compte_rendu.length > 50 ? reunion.compte_rendu.substring(0, 50) + '...' : reunion.compte_rendu) : 'Aucun' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button 
                  v-if="estAnnulable(reunion)"
                  @click="selectionnerReunion(reunion.id_reunion)" 
                  class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Annuler
                </button>
                <span v-else class="text-sm text-gray-500">
                  {{ getNonAnnulableRaison(reunion) }}
                </span>
              </td>
            </tr>
            
            <tr v-if="reunions.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                Aucune réunion trouvée.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Modal de confirmation d'annulation -->
      <div v-if="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 class="text-lg font-bold mb-4 text-red-600">Confirmation d'annulation</h3>
          
          <div v-if="reunionAnnuler">
            <p class="mb-4">Vous êtes sur le point d'annuler la réunion suivante :</p>
            
            <div class="mb-4 bg-gray-50 p-3 rounded">
              <p><span class="font-semibold">ID de la réunion :</span> {{ reunionAnnuler.id_reunion }}</p>
              <p><span class="font-semibold">Date :</span> {{ formatDate(reunionAnnuler.date_reunion) }}</p>
              <p><span class="font-semibold">Sujet :</span> {{ reunionAnnuler.sujet }}</p>
              <p v-if="reunionAnnuler.compte_rendu"><span class="font-semibold">Compte rendu :</span> {{ reunionAnnuler.compte_rendu }}</p>
            </div>
            
            <div class="mb-4">
              <label class="block font-semibold mb-2">Motif d'annulation :</label>
              <textarea 
                v-model="motifAnnulation" 
                rows="3"
                required
                class="w-full p-2 border rounded"
                placeholder="Précisez le motif de l'annulation de cette réunion"
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
                @click="confirmerAnnulation" 
                class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
                :disabled="!motifAnnulation || annulationEnCours"
              >
                {{ annulationEnCours ? 'Annulation en cours...' : 'Confirmer l\'annulation' }}
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
        reunions: [],
        reunionSelectionnee: null,
        reunionAnnuler: null,
        modalVisible: false,
        motifAnnulation: "",
        chargement: true,
        annulationEnCours: false,
        message: "",
        messageClasse: ""
      };
    },
    mounted() {
      this.chargerReunions();
    },
    methods: {
      chargerReunions() {
        this.chargement = true;
        
        axios.get("http://localhost:3002/reunions")
          .then(response => {
            this.reunions = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des réunions:", error);
            this.afficherMessage("Impossible de charger les réunions", "error");
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      
      estAnnulable(reunion) {
        // Une réunion est annulable si elle n'a pas encore eu lieu
        const dateCourante = new Date();
        const dateReunion = new Date(reunion.date_reunion);
        
        // On vérifie aussi s'il n'y a pas de soins associés
        // Note: Cette vérification pourrait nécessiter un appel API spécifique
        // Pour simplifier, nous supposons qu'une réunion future est annulable
        return dateReunion > dateCourante;
      },
      
      getNonAnnulableRaison(reunion) {
        const dateCourante = new Date();
        const dateReunion = new Date(reunion.date_reunion);
        
        if (dateReunion <= dateCourante) {
          return "Réunion déjà passée";
        }
        
        // Si nous avions des informations sur les soins associés
        // return "Soins associés";
        
        return "Non annulable";
      },
      
      selectionnerReunion(id_reunion) {
        this.reunionSelectionnee = id_reunion;
        this.reunionAnnuler = this.reunions.find(r => r.id_reunion === id_reunion);
        
        if (this.reunionAnnuler) {
          this.modalVisible = true;
        }
      },
      
      fermerModal() {
        this.modalVisible = false;
        this.motifAnnulation = "";
      },
      
      confirmerAnnulation() {
        if (!this.motifAnnulation || !this.reunionAnnuler) {
          return;
        }
        
        this.annulationEnCours = true;
        
        axios.delete(`http://localhost:3002/supprimerReunion/${this.reunionAnnuler.id_reunion}`, {
          data: { motif_annulation: this.motifAnnulation }
        })
          .then(() => {
            this.afficherMessage("La réunion a été annulée avec succès", "success");
            this.chargerReunions();
            this.fermerModal();
          })
          .catch(error => {
            console.error("Erreur lors de l'annulation:", error);
            let messageErreur = "Erreur lors de l'annulation de la réunion";
            
            if (error.response && error.response.data) {
              if (error.response.data.message) {
                messageErreur = error.response.data.message;
              } else if (error.response.data.error) {
                messageErreur = error.response.data.error;
              }
            }
            
            this.afficherMessage(messageErreur, "error");
          })
          .finally(() => {
            this.annulationEnCours = false;
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
      
      formatDate(dateString) {
        if (!dateString) return "Non définie";
        
        const date = new Date(dateString);
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