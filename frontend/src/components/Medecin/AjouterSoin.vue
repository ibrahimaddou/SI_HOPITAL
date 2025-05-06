<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Ajouter un nouveau soin</h2>
      
      <form @submit.prevent="soumettreFormulaire" class="bg-white p-4 rounded shadow">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Informations sur le soin -->
          <div>
            <h3 class="font-semibold mb-2">Informations sur le soin</h3>
            
            <div class="mb-3">
              <label class="block mb-1">Patient *</label>
              <select 
                v-model="soin.id_patient" 
                required
                class="w-full p-2 border rounded"
              >
                <option value="">Sélectionnez un patient</option>
                <option v-for="patient in patients" :key="patient.id_patient" :value="patient.id_patient">
                  {{ patient.nom }} {{ patient.prenom }}
                </option>
              </select>
            </div>
            
            <div class="mb-3">
              <label class="block mb-1">Réunion de décision *</label>
              <select 
                v-model="soin.id_reunion_decision" 
                required
                class="w-full p-2 border rounded"
              >
                <option value="">Sélectionnez une réunion</option>
                <option v-for="reunion in reunions" :key="reunion.id_reunion" :value="reunion.id_reunion">
                  {{ formatDate(reunion.date_reunion) }} - {{ reunion.sujet }}
                </option>
              </select>
            </div>
            
            <div class="mb-3">
              <label class="block mb-1">Description du soin *</label>
              <textarea 
                v-model="soin.description" 
                required
                class="w-full p-2 border rounded"
                rows="4"
                placeholder="Décrivez le soin à administrer"
              ></textarea>
            </div>
          </div>
          
          <!-- Médicaments associés -->
          <div>
            <h3 class="font-semibold mb-2">Médicaments associés</h3>
            
            <div class="mb-3">
              <label class="block mb-1">Sélectionner un médicament</label>
              <div class="flex space-x-2">
                <select 
                  v-model="medicamentSelectionne.id_medicament"
                  class="w-full p-2 border rounded"
                >
                  <option value="">Sélectionnez un médicament</option>
                  <option v-for="med in medicaments" :key="med.id_medicament" :value="med.id_medicament">
                    {{ med.nom }} ({{ med.dosage }})
                  </option>
                </select>
                <button 
                  type="button"
                  @click="ajouterMedicament"
                  class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  :disabled="!medicamentSelectionne.id_medicament || !medicamentSelectionne.quantite"
                >
                  +
                </button>
              </div>
            </div>
            
            <div class="mb-3" v-if="medicamentSelectionne.id_medicament">
              <label class="block mb-1">Quantité / Posologie</label>
              <input 
                v-model="medicamentSelectionne.quantite" 
                type="text" 
                class="w-full p-2 border rounded"
                placeholder="Ex: 1 comprimé x 3/jour pendant 7 jours"
              />
            </div>
            
            <div class="mb-3" v-if="medicamentSelectionne.id_medicament">
              <div class="text-sm mb-2">
                <strong>Médicament sélectionné:</strong> 
                {{ medicaments.find(m => m.id_medicament === medicamentSelectionne.id_medicament)?.nom }}
                ({{ medicaments.find(m => m.id_medicament === medicamentSelectionne.id_medicament)?.dosage }})
              </div>
              <div class="text-sm text-gray-600" v-if="medicaments.find(m => m.id_medicament === medicamentSelectionne.id_medicament)?.description">
                {{ medicaments.find(m => m.id_medicament === medicamentSelectionne.id_medicament)?.description }}
              </div>
            </div>
            
            <div class="mb-3" v-if="soin.medicaments.length > 0">
              <label class="block mb-1">Médicaments ajoutés</label>
              <div class="border rounded p-2 max-h-48 overflow-y-auto">
                <div v-for="(med, index) in soin.medicaments" :key="index" class="mb-2 p-2 bg-gray-50 rounded">
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold">
                        {{ medicaments.find(m => m.id_medicament === med.id_medicament)?.nom }}
                        ({{ medicaments.find(m => m.id_medicament === med.id_medicament)?.dosage }})
                      </div>
                      <div class="text-sm">{{ med.quantite }}</div>
                    </div>
                    <button 
                      type="button"
                      @click="supprimerMedicament(index)"
                      class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="mt-4">
          <button 
            type="submit" 
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            :disabled="envoiEnCours"
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
        soin: {
          id_patient: "",
          id_reunion_decision: "",
          description: "",
          medicaments: []
        },
        medicamentSelectionne: {
          id_medicament: "",
          quantite: ""
        },
        patients: [],
        reunions: [],
        medicaments: [],
        envoiEnCours: false,
        message: "",
        messageClasse: ""
      };
    },
    mounted() {
      this.chargerDonnees();
    },
    methods: {
      chargerDonnees() {
        // Charger les patients
        axios.get("http://localhost:3002/patients")
          .then(response => {
            this.patients = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des patients:", error);
            this.afficherMessage("Erreur lors du chargement des patients", "error");
          });
        
        // Charger les réunions récentes
        axios.get("http://localhost:3002/reunions")
          .then(response => {
            this.reunions = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des réunions:", error);
            this.afficherMessage("Erreur lors du chargement des réunions", "error");
          });
        
        // Charger les médicaments
        axios.get("http://localhost:3002/afficherMedicaments")
          .then(response => {
            this.medicaments = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des médicaments:", error);
            this.afficherMessage("Erreur lors du chargement des médicaments", "error");
          });
      },
      
      formatDate(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
      },
      
      ajouterMedicament() {
        if (!this.medicamentSelectionne.id_medicament || !this.medicamentSelectionne.quantite) {
          this.afficherMessage("Veuillez sélectionner un médicament et indiquer la quantité", "error");
          return;
        }
        
        // Vérifier si le médicament est déjà dans la liste
        const medicamentExistant = this.soin.medicaments.find(
          med => med.id_medicament === this.medicamentSelectionne.id_medicament
        );
        
        if (medicamentExistant) {
          this.afficherMessage("Ce médicament a déjà été ajouté", "error");
          return;
        }
        
        // Ajouter le médicament à la liste
        this.soin.medicaments.push({ ...this.medicamentSelectionne });
        
        // Réinitialiser le médicament sélectionné
        this.medicamentSelectionne = {
          id_medicament: "",
          quantite: ""
        };
      },
      
      supprimerMedicament(index) {
        this.soin.medicaments.splice(index, 1);
      },
      
      soumettreFormulaire() {
        // Vérification des champs obligatoires
        if (!this.soin.id_patient || !this.soin.id_reunion_decision || !this.soin.description) {
          this.afficherMessage("Veuillez remplir tous les champs obligatoires", "error");
          return;
        }
        
        this.envoiEnCours = true;
        this.message = "";
        
        axios
          .post("http://localhost:3002/soins", this.soin)
          .then(() => {
            this.afficherMessage("Soin ajouté avec succès", "success");
            this.reinitialiserFormulaire();
          })
          .catch(error => {
            console.error("Erreur lors de l'ajout:", error);
            this.afficherMessage(
              "Erreur lors de l'ajout du soin: " + 
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
        this.soin = {
          id_patient: "",
          id_reunion_decision: "",
          description: "",
          medicaments: []
        };
        this.medicamentSelectionne = {
          id_medicament: "",
          quantite: ""
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