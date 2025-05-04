<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Supprimer un patient</h2>
      
      <!-- Sélecteur de patient -->
      <div class="mb-6 bg-white p-4 rounded shadow">
        <label class="block font-semibold mb-2">Sélectionnez un patient à supprimer :</label>
        <div class="mb-4">
          <select 
            v-model="idPatientSelectionne" 
            class="w-full p-2 border rounded"
            @change="chargerPatientDetails"
          >
            <option value="">-- Sélectionnez un patient --</option>
            <option v-for="patient in patients" :key="patient.id_patient" :value="patient.id_patient">
              {{ patient.nom }} {{ patient.prenom }} ({{ formatDate(patient.date_naissance) }})
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
              @click="rechercherPatients" 
              class="bg-blue-500 text-white px-4 py-2 rounded-r hover:bg-blue-600"
            >
              Rechercher
            </button>
          </div>
        </div>
      </div>
      
      <!-- Détails du patient sélectionné -->
      <div v-if="patientSelectionne" class="mb-6 bg-white p-4 rounded shadow">
        <h3 class="font-semibold text-lg mb-3">Détails du patient</h3>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><span class="font-semibold">Nom :</span> {{ patientSelectionne.nom }}</p>
            <p><span class="font-semibold">Prénom :</span> {{ patientSelectionne.prenom }}</p>
            <p><span class="font-semibold">Date de naissance :</span> {{ formatDate(patientSelectionne.date_naissance) }}</p>
            <p><span class="font-semibold">Adresse :</span> {{ patientSelectionne.adresse || 'Non renseignée' }}</p>
          </div>
          <div>
            <p><span class="font-semibold">Téléphone :</span> {{ patientSelectionne.telephone || 'Non renseigné' }}</p>
            <p><span class="font-semibold">Email :</span> {{ patientSelectionne.email || 'Non renseigné' }}</p>
            <p><span class="font-semibold">Antécédents médicaux :</span> {{ patientSelectionne.antecedents_medicaux || 'Aucun' }}</p>
          </div>
        </div>
        
        <!-- Données associées -->
        <div class="mt-4">
          <h4 class="font-semibold mb-2">Données associées qui seront également supprimées :</h4>
          <ul class="list-disc pl-5">
            <li>{{ donneesSejours.length }} séjour(s)</li>
            <li>{{ donneesVisites.length }} visite(s) médicale(s)</li>
            <li>{{ donneesSoins.length }} soin(s)</li>
          </ul>
        </div>
        
        <!-- Confirmation de suppression -->
        <div class="mt-6 bg-red-50 p-4 rounded border border-red-200">
          <h4 class="font-semibold text-red-700 mb-2">Attention ! Cette action est irréversible</h4>
          <p class="mb-4">La suppression du patient entraînera également la suppression de toutes ses données associées, y compris ses séjours, visites médicales et soins.</p>
          
          <div class="flex items-center mb-4">
            <input 
              v-model="confirmationSuppression" 
              type="checkbox" 
              id="confirmation" 
              class="mr-2"
            />
            <label for="confirmation">Je confirme vouloir supprimer définitivement ce patient et toutes ses données associées</label>
          </div>
          
          <button 
            @click="confirmerSuppression" 
            class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
            :disabled="!confirmationSuppression || suppressionEnCours"
          >
            {{ suppressionEnCours ? 'Suppression en cours...' : 'Supprimer définitivement' }}
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
        patients: [],
        idPatientSelectionne: "",
        patientSelectionne: null,
        recherche: "",
        donneesSejours: [],
        donneesVisites: [],
        donneesSoins: [],
        confirmationSuppression: false,
        suppressionEnCours: false,
        message: "",
        messageClasse: ""
      };
    },
    mounted() {
      this.chargerPatients();
    },
    methods: {
      chargerPatients() {
        axios.get("http://localhost:3002/patients")
          .then(response => {
            this.patients = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des patients:", error);
            this.afficherMessage("Erreur lors du chargement des patients", "error");
          });
      },
      
      rechercherPatients() {
        if (!this.recherche) {
          this.chargerPatients();
          return;
        }
        
        axios.get(`http://localhost:3002/patients/recherche?q=${this.recherche}`)
          .then(response => {
            this.patients = response.data;
          })
          .catch(error => {
            console.error("Erreur lors de la recherche:", error);
            this.afficherMessage("Erreur lors de la recherche de patients", "error");
          });
      },
      
      chargerPatientDetails() {
        if (!this.idPatientSelectionne) {
          this.patientSelectionne = null;
          return;
        }
        
        // Charger les détails du patient
        axios.get(`http://localhost:3002/patients/${this.idPatientSelectionne}`)
          .then(response => {
            this.patientSelectionne = response.data;
            
            // Charger les données associées
            this.chargerDonneesAssociees();
          })
          .catch(error => {
            console.error("Erreur lors du chargement des détails du patient:", error);
            this.afficherMessage("Erreur lors du chargement des détails du patient", "error");
          });
      },
      
      chargerDonneesAssociees() {
        // Charger les séjours
        axios.get(`http://localhost:3002/sejours/patient/${this.idPatientSelectionne}`)
          .then(response => {
            this.donneesSejours = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des séjours:", error);
            this.donneesSejours = [];
          });
        
        // Charger les visites médicales
        axios.get(`http://localhost:3002/visitesMedicales/patient/${this.idPatientSelectionne}`)
          .then(response => {
            this.donneesVisites = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des visites médicales:", error);
            this.donneesVisites = [];
          });
        
        // Charger les soins
        axios.get(`http://localhost:3002/soins/patient/${this.idPatientSelectionne}`)
          .then(response => {
            this.donneesSoins = response.data;
          })
          .catch(error => {
            console.error("Erreur lors du chargement des soins:", error);
            this.donneesSoins = [];
          });
      },
      
      confirmerSuppression() {
        if (!this.confirmationSuppression || !this.idPatientSelectionne) {
          return;
        }
        
        this.suppressionEnCours = true;
        this.message = "";
        
        axios.delete(`http://localhost:3002/patients/${this.idPatientSelectionne}`)
          .then(() => {
            this.afficherMessage("Le patient et toutes ses données associées ont été supprimés avec succès", "success");
            this.reinitialiser();
          })
          .catch(error => {
            console.error("Erreur lors de la suppression:", error);
            this.afficherMessage(
              "Erreur lors de la suppression du patient: " + 
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
      
      reinitialiser() {
        this.idPatientSelectionne = "";
        this.patientSelectionne = null;
        this.recherche = "";
        this.donneesSejours = [];
        this.donneesVisites = [];
        this.donneesSoins = [];
        this.confirmationSuppression = false;
        this.chargerPatients();
      },
      
      formatDate(dateString) {
        if (!dateString) return "Non renseignée";
        
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
  input:focus, select:focus {
    outline: none;
    border-color: #4f46e5;
  }
  </style>