<template>
    <div class="container mx-auto p-4">
      <div v-if="chargementEnCours" class="text-center py-8">
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        <p class="mt-2">Chargement en cours...</p>
      </div>
      
      <div v-else>
        <h2 class="text-xl font-bold mb-4">Modifier le soin #{{ idSoin }}</h2>
        
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
              
              <div class="mb-3" v-if="administrations && administrations.length > 0">
                <h4 class="font-semibold text-sm mb-1">Historique des administrations</h4>
                <div class="border p-2 rounded max-h-48 overflow-y-auto">
                  <div v-for="admin in administrations" :key="admin.id_administration" class="mb-2 p-2 bg-gray-50 text-sm rounded">
                    <div class="font-semibold">{{ formatDate(admin.date_heure) }}</div>
                    <div>Infirmier: {{ admin.prenom_infirmier }} {{ admin.nom_infirmier }}</div>
                    <div v-if="admin.commentaires">Commentaire: {{ admin.commentaires }}</div>
                  </div>
                </div>
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
                <label class="block mb-1">Médicaments associés</label>
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
          
          <div class="mt-4 flex space-x-4">
            <button 
              type="submit" 
              class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              :disabled="envoiEnCours"
            >
              {{ envoiEnCours ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>
            
            <button 
              type="button" 
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              @click="$router.go(-1)"
            >
              Annuler
            </button>
          </div>
          
          <div v-if="message" class="mt-4 p-2 rounded" :class="messageClasse">
            {{ message }}
          </div>
        </form>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        idSoin: this.$route.params.id,
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
        administrations: [],
        patients: [],
        reunions: [],
        medicaments: [],
        chargementEnCours: true,
        envoiEnCours: false,
        message: "",
        messageClasse: ""
      };
    },
    mounted() {
      this.chargerDonnees();
    },
    methods: {
      async chargerDonnees() {
        try {
          this.chargementEnCours = true;
          
          // Charger les données de base (patients, réunions, médicaments)
          const [patientsResponse, reunionsResponse, medicamentsResponse] = await Promise.all([
            axios.get("http://localhost:3002/patients"),
            axios.get("http://localhost:3002/reunions"),
            axios.get("http://localhost:3002/afficherMedicamentsPatient")
          ]);
          
          this.patients = patientsResponse.data;
          this.reunions = reunionsResponse.data;
          this.medicaments = medicamentsResponse.data;
          
          // Charger les informations du soin à modifier
          const soinResponse = await axios.get(`http://localhost:3002/soins/${this.idSoin}`);
          const soinData = soinResponse.data;
          
          // Mettre en forme les données du soin
          this.soin = {
            id_patient: soinData.id_patient,
            id_reunion_decision: soinData.id_reunion_decision,
            description: soinData.description,
            medicaments: soinData.medicaments.map(med => ({
              id_medicament: med.id_medicament,
              quantite: med.quantite
            }))
          };
          
          // Récupérer l'historique des administrations si disponible
          if (soinData.administrations) {
            this.administrations = soinData.administrations;
          }
          
        } catch (error) {
          console.error("Erreur lors du chargement des données:", error);
          this.afficherMessage(
            "Erreur lors du chargement des données: " + 
            (error.response?.data?.message || error.message), 
            "error"
          );
        } finally {
          this.chargementEnCours = false;
        }
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
      
      async soumettreFormulaire() {
        // Vérification des champs obligatoires
        if (!this.soin.id_patient || !this.soin.id_reunion_decision || !this.soin.description) {
          this.afficherMessage("Veuillez remplir tous les champs obligatoires", "error");
          return;
        }
        
        this.envoiEnCours = true;
        this.message = "";
        
        try {
          const response = await axios.put(`http://localhost:3002/modifierSoin/${this.idSoin}`, this.soin);
          
          if (response.data.success) {
            this.afficherMessage("Soin modifié avec succès", "success");
            
            // Mettre à jour les données affichées
            if (response.data.soin) {
              this.soin = {
                id_patient: response.data.soin.id_patient,
                id_reunion_decision: response.data.soin.id_reunion_decision,
                description: response.data.soin.description,
                medicaments: response.data.soin.medicaments.map(med => ({
                  id_medicament: med.id_medicament,
                  quantite: med.quantite
                }))
              };
            }
          } else {
            this.afficherMessage(response.data.message || "Une erreur est survenue", "error");
          }
        } catch (error) {
          console.error("Erreur lors de la modification:", error);
          this.afficherMessage(
            "Erreur lors de la modification du soin: " + 
            (error.response?.data?.message || error.message), 
            "error"
          );
        } finally {
          this.envoiEnCours = false;
        }
      },
      
      afficherMessage(message, type) {
        this.message = message;
        if (type === "error") {
          this.messageClasse = "bg-red-100 text-red-700 border border-red-500";
        } else {
          this.messageClasse = "bg-green-100 text-green-700 border border-green-500";
        }
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