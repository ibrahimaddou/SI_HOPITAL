<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Ajouter une nouvelle réunion</h2>
      
      <form @submit.prevent="soumettreFormulaire" class="bg-white p-4 rounded shadow">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Informations sur la réunion -->
          <div>
            <h3 class="font-semibold mb-2">Informations sur la réunion</h3>
            
            <div class="mb-3">
              <label class="block mb-1">Date et heure de la réunion *</label>
              <input 
                v-model="reunion.date_reunion" 
                type="datetime-local" 
                required
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div class="mb-3">
              <label class="block mb-1">Sujet *</label>
              <input 
                v-model="reunion.sujet" 
                type="text" 
                required
                class="w-full p-2 border rounded"
                placeholder="Sujet de la réunion"
              />
            </div>
            
            <div class="mb-3">
              <label class="block mb-1">Compte rendu</label>
              <textarea 
                v-model="reunion.compte_rendu" 
                class="w-full p-2 border rounded"
                rows="5"
                placeholder="Le compte rendu peut être ajouté ultérieurement"
              ></textarea>
            </div>
          </div>
          
          <!-- Participants -->
          <div>
            <h3 class="font-semibold mb-2">Participants</h3>
            
            <div class="mb-3">
              <label class="block mb-1">Médecins participants</label>
              <div class="max-h-64 overflow-y-auto border rounded p-2">
                <div v-for="medecin in medecins" :key="medecin.id_medecin" class="mb-1">
                  <label class="flex items-center">
                    <input 
                      type="checkbox"
                      :value="medecin.id_medecin"
                      v-model="reunion.medecinIds"
                      class="mr-2"
                    />
                    {{ medecin.nom }} {{ medecin.prenom }} ({{ medecin.specialite }})
                  </label>
                </div>
                <div v-if="medecins.length === 0" class="text-gray-500 italic">
                  Aucun médecin disponible
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="block mb-1">Infirmiers participants</label>
              <div class="max-h-64 overflow-y-auto border rounded p-2">
                <div v-for="infirmier in infirmiers" :key="infirmier.id_infirmier" class="mb-1">
                  <label class="flex items-center">
                    <input 
                      type="checkbox"
                      :value="infirmier.id_infirmier"
                      v-model="reunion.infirmierIds"
                      class="mr-2"
                    />
                    {{ infirmier.nom }} {{ infirmier.prenom }} ({{ infirmier.qualification }})
                  </label>
                </div>
                <div v-if="infirmiers.length === 0" class="text-gray-500 italic">
                  Aucun infirmier disponible
                </div>
              </div>
            </div>
            
            <div class="mb-3">
              <p class="text-sm text-gray-600">
                Au moins un participant est requis pour la réunion
              </p>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <button 
            type="submit" 
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            :disabled="envoiEnCours || !isFormValid"
          >
            {{ envoiEnCours ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </div>
        
        <div v-if="message" class="mt-4 p-2 rounded" :class="messageClasse">
          {{ message }}
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        reunion: {
          date_reunion: "",
          sujet: "",
          compte_rendu: "",
          medecinIds: [],
          infirmierIds: []
        },
        medecins: [],
        infirmiers: [],
        envoiEnCours: false,
        message: "",
        messageClasse: ""
      };
    },
    computed: {
      isFormValid() {
        return this.reunion.date_reunion && 
               this.reunion.sujet && 
               (this.reunion.medecinIds.length > 0 || this.reunion.infirmierIds.length > 0);
      }
    },
    mounted() {
      this.chargerDonnees();
    },
    methods: {
      chargerDonnees() {
        // Charger les médecins
        axios.get("http://localhost:3002/medecins")
          .then(response => {
            this.medecins = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des médecins:", error);
            this.afficherMessage("Erreur lors du chargement des médecins", "error");
          });
        
        // Charger les infirmiers
        axios.get("http://localhost:3002/infirmiers")
          .then(response => {
            this.infirmiers = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des infirmiers:", error);
            this.afficherMessage("Erreur lors du chargement des infirmiers", "error");
          });
      },
      
      soumettreFormulaire() {
        // Vérification des champs obligatoires
        if (!this.reunion.date_reunion || !this.reunion.sujet) {
          this.afficherMessage("Veuillez remplir tous les champs obligatoires", "error");
          return;
        }
        
        // Vérifier qu'au moins un participant est sélectionné
        if (this.reunion.medecinIds.length === 0 && this.reunion.infirmierIds.length === 0) {
          this.afficherMessage("Veuillez sélectionner au moins un participant", "error");
          return;
        }
        
        this.envoiEnCours = true;
        this.message = "";
        
        axios
          .post("http://localhost:3002/reunions", this.reunion)
          .then(() => {
            this.afficherMessage("Réunion ajoutée avec succès", "success");
            this.reinitialiserFormulaire();
          })
          .catch(error => {
            console.error("Erreur lors de l'ajout:", error);
            this.afficherMessage(
              "Erreur lors de l'ajout de la réunion: " + 
              (error.response?.data?.error || error.message), 
              "error"
            );
          })
          .finally(() => {
            this.envoiEnCours = false;
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
      
      reinitialiserFormulaire() {
        this.reunion = {
          date_reunion: "",
          sujet: "",
          compte_rendu: "",
          medecinIds: [],
          infirmierIds: []
        };
      }
    }
  };
  </script>
  
  <style scoped>
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #4f46e5;
  }
  
  .error {
    color: red;
  }
  </style>