<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Modifier la date de sortie d'un patient</h2>
      
      <!-- Sélecteur de patient -->
      <div class="mb-6 bg-white p-4 rounded shadow">
        <label class="block font-semibold mb-2">Sélectionnez un patient :</label>
        <div class="mb-4">
          <select 
            v-model="idSejourSelectionne" 
            class="w-full p-2 border rounded"
            @change="chargerSejourDetails"
          >
            <option value="">-- Sélectionnez un séjour --</option>
            <option v-for="sejour in sejours" :key="sejour.id_sejour" :value="sejour.id_sejour">
              {{ sejour.nom }} {{ sejour.prenom }} - Arrivée: {{ formatDate(sejour.date_arrivee) }} - Chambre: {{ sejour.numero_chambre }}
            </option>
          </select>
        </div>
        
        <!-- Recherche de patient -->
        <div class="mb-4">
          <label class="block font-semibold mb-2">Ou recherchez par nom :</label>
          <div class="flex">
            <input 
              v-model="recherche" 
              type="text" 
              placeholder="Nom ou prénom du patient" 
              class="flex-grow p-2 border rounded-l"
            />
            <button 
              @click="rechercherSejours" 
              class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>
      
      <!-- Détails du séjour sélectionné -->
      <div v-if="sejourSelectionne" class="mb-6 bg-white p-4 rounded shadow">
        <h3 class="font-semibold text-lg mb-3">Détails du séjour</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span class="font-semibold">Patient :</span> {{ sejourSelectionne.nom }} {{ sejourSelectionne.prenom }}</p>
            <p><span class="font-semibold">Date de naissance :</span> {{ formatDate(sejourSelectionne.date_naissance) }}</p>
            <p><span class="font-semibold">Date d'arrivée :</span> {{ formatDate(sejourSelectionne.date_arrivee) }}</p>
          </div>
          <div>
            <p><span class="font-semibold">Service :</span> {{ sejourSelectionne.service }}</p>
            <p><span class="font-semibold">Chambre :</span> {{ sejourSelectionne.numero_chambre }}</p>
            <p><span class="font-semibold">Lit :</span> {{ sejourSelectionne.numero_lit }}</p>
          </div>
        </div>
        
        <div class="mt-4">
          <p><span class="font-semibold">Raison du séjour :</span> {{ sejourSelectionne.raison_sejour }}</p>
          <p><span class="font-semibold">Date de sortie prévisionnelle :</span> {{ formatDate(sejourSelectionne.date_sortie_previsionnelle) || 'Non définie' }}</p>
          <p><span class="font-semibold">Date de sortie réelle :</span> {{ formatDate(sejourSelectionne.date_sortie_reelle) || 'Non définie' }}</p>
        </div>
        
        <!-- Modification de la date de sortie -->
        <div class="mt-6 bg-blue-50 p-4 rounded border border-blue-200">
          <h4 class="font-semibold text-blue-700 mb-2">Modifier la date de sortie réelle</h4>
          
          <div class="mb-4">
            <label class="block mb-2">Nouvelle date de sortie :</label>
            <input 
              type="date" 
              v-model="nouvelleDateSortie" 
              class="w-full p-2 border rounded"
              :max="dateActuelle"
            />
            <p v-if="erreurDate" class="text-red-600 mt-1">{{ erreurDate }}</p>
          </div>
          
          <div class="mb-4">
            <label class="block mb-2">Commentaire (optionnel) :</label>
            <textarea 
              v-model="commentaire" 
              class="w-full p-2 border rounded"
              rows="3"
              placeholder="Raison du changement de date de sortie..."
            ></textarea>
          </div>
          
          <button 
            @click="confirmerModification" 
            class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed"
            :disabled="!nouvelleDateSortie || modificationEnCours || erreurDate"
          >
            {{ modificationEnCours ? 'Modification en cours...' : 'Enregistrer la modification' }}
          </button>
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
        idSejourSelectionne: "",
        sejourSelectionne: null,
        recherche: "",
        nouvelleDateSortie: "",
        commentaire: "",
        modificationEnCours: false,
        message: "",
        messageClasse: "",
        erreurDate: ""
      };
    },
    computed: {
      dateActuelle() {
        const today = new Date();
        return today.toISOString().split('T')[0];
      }
    },
    mounted() {
      this.chargerSejours();
    },
    methods: {
      chargerSejours() {
        axios.get("http://localhost:3002/sejours")
          .then(response => {
            this.sejours = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des séjours:", error);
            this.afficherMessage("Erreur lors du chargement des séjours", "error");
          });
      },
      
      rechercherSejours() {
        if (!this.recherche) {
          this.chargerSejours();
          return;
        }
        
        axios.get(`http://localhost:3002/sejours/recherche?q=${this.recherche}`)
          .then(response => {
            this.sejours = response.data;
          })
          .catch(error => {
            console.error("Erreur lors de la recherche:", error);
            this.afficherMessage("Erreur lors de la recherche de séjours", "error");
          });
      },
      
      chargerSejourDetails() {
        if (!this.idSejourSelectionne) {
          this.sejourSelectionne = null;
          this.nouvelleDateSortie = "";
          this.commentaire = "";
          return;
        }
        
        // Charger les détails du séjour
        axios.get(`http://localhost:3002/sejours/${this.idSejourSelectionne}`)
          .then(response => {
            this.sejourSelectionne = response.data;
            
            if (this.sejourSelectionne.date_sortie_reelle) {
              const date = new Date(this.sejourSelectionne.date_sortie_reelle);
              this.nouvelleDateSortie = date.toISOString().split('T')[0];
            } else {
              this.nouvelleDateSortie = this.dateActuelle;
            }
            
            this.validerDate();
          })
          .catch(error => {
            console.error("Erreur lors du chargement des détails du séjour:", error);
            this.afficherMessage("Erreur lors du chargement des détails du séjour", "error");
          });
      },
      
      validerDate() {
        this.erreurDate = "";
        
        if (!this.nouvelleDateSortie || !this.sejourSelectionne) {
          return;
        }
        
        const dateArrivee = new Date(this.sejourSelectionne.date_arrivee);
        const dateSortie = new Date(this.nouvelleDateSortie);
        const dateAujourdhui = new Date();
        
        if (dateSortie < dateArrivee) {
          this.erreurDate = "La date de sortie doit être postérieure à la date d'arrivée";
          return;
        }
        
        if (dateSortie > dateAujourdhui) {
          this.erreurDate = "La date de sortie ne peut pas être dans le futur";
          return;
        }
      },
      
      confirmerModification() {
        if (!this.nouvelleDateSortie || !this.idSejourSelectionne) {
          return;
        }
        
        this.validerDate();
        if (this.erreurDate) {
          return;
        }
        
        this.modificationEnCours = true;
        this.message = "";
        
        const donneesModification = {
          date_sortie_reelle: this.nouvelleDateSortie,
          commentaire: this.commentaire
        };
        
        axios.put(`http://localhost:3002/modifierDateSortiePatient/${this.idSejourSelectionne}`, donneesModification)
          .then(() => {
            this.afficherMessage("La date de sortie a été modifiée avec succès", "success");

            this.chargerSejours();
            this.chargerSejourDetails();
          })
          .catch(error => {
            console.error("Erreur lors de la modification:", error);
            this.afficherMessage(
              "Erreur lors de la modification de la date de sortie: " + 
              (error.response?.data?.error || error.message), 
              "error"
            );
          })
          .finally(() => {
            this.modificationEnCours = false;
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
        if (!dateString) return "";
        
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric'
        });
      }
    },
    watch: {
      nouvelleDateSortie() {
        this.validerDate();
      }
    }
  };
  </script>
  
  <style scoped>
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #4f46e5;
  }
  </style>