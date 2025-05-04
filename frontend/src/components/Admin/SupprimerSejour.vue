<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Annuler un séjour</h2>
      
      <!-- Filtres pour séjours -->
      <div class="mb-6 bg-white p-4 rounded shadow">
        <h3 class="font-semibold mb-3">Filtrer les séjours</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label class="block mb-1">Statut</label>
            <select 
              v-model="filtreStatut" 
              class="w-full p-2 border rounded"
              @change="appliquerFiltres"
            >
              <option value="a_venir">À venir</option>
              <option value="en_cours">En cours</option>
              <option value="termines">Terminés</option>
              <option value="tous">Tous</option>
            </select>
          </div>
          
          <div>
            <label class="block mb-1">Service</label>
            <select 
              v-model="filtreService" 
              class="w-full p-2 border rounded"
              @change="appliquerFiltres"
            >
              <option value="">Tous les services</option>
              <option v-for="service in services" :key="service.id_service" :value="service.id_service">
                {{ service.nom }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block mb-1">Recherche par nom de patient</label>
            <div class="flex">
              <input 
                v-model="filtrePatient" 
                type="text" 
                class="flex-grow p-2 border rounded-l"
                placeholder="Nom ou prénom"
              />
              <button 
                @click="appliquerFiltres" 
                class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
              >
                Rechercher
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tableau des séjours -->
      <div class="bg-white rounded shadow overflow-hidden">
        <div v-if="chargement" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          <p class="mt-2 text-gray-600">Chargement des séjours...</p>
        </div>
        
        <table v-else class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Service/Chambre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="sejour in sejours" :key="sejour.id_sejour" :class="{'bg-red-50': sejourSelectionne === sejour.id_sejour}">
              <td class="px-6 py-4">
                <div class="font-medium">{{ sejour.patient.nom }} {{ sejour.patient.prenom }}</div>
                <div class="text-sm text-gray-500">Né(e) le {{ formatDate(sejour.patient.date_naissance) }}</div>
              </td>
              <td class="px-6 py-4">
                <div class="font-medium">{{ sejour.service.nom }}</div>
                <div class="text-sm text-gray-500">Chambre {{ sejour.chambre.numero }}, Lit {{ sejour.lit.numero }}</div>
              </td>
              <td class="px-6 py-4">
                <div>Arrivée: {{ formatDate(sejour.date_arrivee) }}</div>
                <div>Sortie prévue: {{ formatDate(sejour.date_sortie_previsionnelle) }}</div>
                <div v-if="sejour.date_sortie_reelle">Sortie réelle: {{ formatDate(sejour.date_sortie_reelle) }}</div>
              </td>
              <td class="px-6 py-4">
                <span 
                  class="px-2 py-1 text-xs rounded-full"
                  :class="getStatutClass(sejour)"
                >
                  {{ getStatutLabel(sejour) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <button 
                  v-if="estAnnulable(sejour)"
                  @click="selectionnerSejour(sejour.id_sejour)" 
                  class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
                >
                  Annuler
                </button>
                <span v-else class="text-sm text-gray-500">
                  {{ getNonAnnulableRaison(sejour) }}
                </span>
              </td>
            </tr>
            
            <tr v-if="sejours.length === 0">
              <td colspan="5" class="px-6 py-4 text-center text-gray-500">
                Aucun séjour trouvé correspondant aux critères de recherche.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <!-- Modal de confirmation d'annulation -->
      <div v-if="modalVisible" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
          <h3 class="text-lg font-bold mb-4 text-red-600">Confirmation d'annulation</h3>
          
          <div v-if="sejourAnnuler">
            <p class="mb-4">Vous êtes sur le point d'annuler le séjour suivant :</p>
            
            <div class="mb-4 bg-gray-50 p-3 rounded">
              <p><span class="font-semibold">Patient :</span> {{ sejourAnnuler.patient.nom }} {{ sejourAnnuler.patient.prenom }}</p>
              <p><span class="font-semibold">Service :</span> {{ sejourAnnuler.service.nom }}</p>
              <p><span class="font-semibold">Dates :</span> {{ formatDate(sejourAnnuler.date_arrivee) }} - {{ formatDate(sejourAnnuler.date_sortie_previsionnelle) }}</p>
              <p><span class="font-semibold">Raison :</span> {{ sejourAnnuler.raison_sejour }}</p>
            </div>
            
            <div class="mb-4">
              <label class="block font-semibold mb-2">Motif d'annulation :</label>
              <textarea 
                v-model="motifAnnulation" 
                rows="3"
                required
                class="w-full p-2 border rounded"
                placeholder="Précisez le motif de l'annulation de ce séjour"
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
        sejours: [],
        services: [],
        filtreStatut: "a_venir",
        filtreService: "",
        filtrePatient: "",
        sejourSelectionne: null,
        sejourAnnuler: null,
        modalVisible: false,
        motifAnnulation: "",
        chargement: true,
        annulationEnCours: false,
        message: "",
        messageClasse: ""
      };
    },
    mounted() {
      this.chargerServices();
      this.chargerSejours();
    },
    methods: {
      chargerServices() {
        axios.get("http://localhost:3002/services")
          .then(response => {
            this.services = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des services:", error);
          });
      },
      
      chargerSejours() {
        this.chargement = true;
        
        // Construction de l'URL avec les paramètres de filtrage
        let url = "http://localhost:3002/sejours";
        const params = new URLSearchParams();
        
        if (this.filtreStatut !== "tous") {
          params.append("statut", this.filtreStatut);
        }
        
        if (this.filtreService) {
          params.append("service", this.filtreService);
        }
        
        if (this.filtrePatient) {
          params.append("patient", this.filtrePatient);
        }
        
        if (params.toString()) {
          url += "?" + params.toString();
        }
        
        axios.get(url)
          .then(response => {
            this.sejours = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des séjours:", error);
            this.afficherMessage("Impossible de charger les séjours", "error");
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      
      appliquerFiltres() {
        this.chargerSejours();
      },
      
      estAnnulable(sejour) {
        // Un séjour est annulable s'il n'a pas encore commencé
        const dateCourante = new Date();
        dateCourante.setHours(0, 0, 0, 0);
        const dateArrivee = new Date(sejour.date_arrivee);
        dateArrivee.setHours(0, 0, 0, 0);
        
        return dateArrivee > dateCourante && !sejour.date_sortie_reelle;
      },
      
      getNonAnnulableRaison(sejour) {
        const dateCourante = new Date();
        dateCourante.setHours(0, 0, 0, 0);
        const dateArrivee = new Date(sejour.date_arrivee);
        dateArrivee.setHours(0, 0, 0, 0);
        
        if (sejour.date_sortie_reelle) {
          return "Séjour terminé";
        }
        
        if (dateArrivee <= dateCourante) {
          return "Séjour déjà commencé";
        }
        
        return "Non annulable";
      },
      
      getStatutLabel(sejour) {
        const dateCourante = new Date();
        dateCourante.setHours(0, 0, 0, 0);
        const dateArrivee = new Date(sejour.date_arrivee);
        dateArrivee.setHours(0, 0, 0, 0);
        
        if (sejour.date_sortie_reelle) {
          return "Terminé";
        }
        
        if (dateArrivee > dateCourante) {
          return "À venir";
        }
        
        return "En cours";
      },
      
      getStatutClass(sejour) {
        const statut = this.getStatutLabel(sejour);
        
        switch (statut) {
          case "À venir":
            return "bg-blue-100 text-blue-800";
          case "En cours":
            return "bg-green-100 text-green-800";
          case "Terminé":
            return "bg-gray-100 text-gray-800";
          default:
            return "bg-gray-100 text-gray-800";
        }
      },
      
      selectionnerSejour(id_sejour) {
        this.sejourSelectionne = id_sejour;
        this.sejourAnnuler = this.sejours.find(s => s.id_sejour === id_sejour);
        
        if (this.sejourAnnuler) {
          this.modalVisible = true;
        }
      },
      
      fermerModal() {
        this.modalVisible = false;
        this.motifAnnulation = "";
      },
      
      confirmerAnnulation() {
        if (!this.motifAnnulation || !this.sejourAnnuler) {
          return;
        }
        
        this.annulationEnCours = true;
        
        axios.delete(`http://localhost:3002/supprimerSejour/${this.sejourAnnuler.id_sejour}`, {
          data: { motif_annulation: this.motifAnnulation }
        })
          .then(() => {
            this.afficherMessage("Le séjour a été annulé avec succès", "success");
            this.chargerSejours();
            this.fermerModal();
          })
          .catch(error => {
            console.error("Erreur lors de l'annulation:", error);
            this.afficherMessage(
              "Erreur lors de l'annulation du séjour: " + 
              (error.response?.data?.error || error.message), 
              "error"
            );
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
          year: 'numeric'
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