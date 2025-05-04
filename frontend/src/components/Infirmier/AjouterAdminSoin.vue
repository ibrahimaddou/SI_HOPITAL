<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Enregistrer l'administration d'un soin</h2>
      
      <div v-if="chargementDonnees" class="my-4">Chargement des données...</div>
     
      <div v-if="erreur" class="erreur my-4">{{ erreur }}</div>
      
      <div v-if="messageSucces" class="succes my-4">{{ messageSucces }}</div>
      
      <!-- Formulaire d'ajout d'administration de soin -->
      <form @submit.prevent="enregistrerAdministration" class="bg-gray-100 p-4 rounded" v-if="!chargementDonnees">
        
        <!-- Sélection du patient -->
        <div class="mb-4">
          <label for="patient" class="block mb-1 font-medium">Patient:</label>
          <select 
            id="patient" 
            v-model="selectedPatientId" 
            @change="chargerSoinsPatient" 
            class="w-full p-2 border rounded"
            required
          >
            <option value="">Sélectionnez un patient</option>
            <option v-for="patient in patients" :key="patient.id_patient" :value="patient.id_patient">
              {{ patient.prenom }} {{ patient.nom }} (ID: {{ patient.id_patient }})
            </option>
          </select>
        </div>
        
        <!-- Détails du patient -->
        <div v-if="selectedPatientId && patientDetails" class="mb-4 p-3 bg-blue-50 rounded">
          <h3 class="font-medium">Informations du patient</h3>
          <p><strong>Nom:</strong> {{ patientDetails.prenom }} {{ patientDetails.nom }}</p>
          <p><strong>Date de naissance:</strong> {{ formatDate(patientDetails.date_naissance) }}</p>
          <p><strong>Antécédents:</strong> {{ patientDetails.antecedents_medicaux || "Aucun antécédent enregistré" }}</p>
        </div>
        
        <!-- soin -->
        <div class="mb-4">
          <label for="soin" class="block mb-1 font-medium">Soin à administrer:</label>
          <select 
            id="soin" 
            v-model="formulaire.id_soin" 
            @change="chargerDetailsSoin" 
            class="w-full p-2 border rounded"
            required
            :disabled="!selectedPatientId || soinsPatient.length === 0"
          >
            <option value="">Sélectionnez un soin</option>
            <option v-for="soin in soinsPatient" :key="soin.id_soin" :value="soin.id_soin">
              {{ soin.description }} (ID: {{ soin.id_soin }})
            </option>
          </select>
          <p v-if="selectedPatientId && soinsPatient.length === 0" class="text-red-500 mt-1">
            Aucun soin prévu pour ce patient
          </p>
        </div>
        
        <!-- soin sélectionné -->
        <div v-if="formulaire.id_soin && soinDetails" class="mb-4 p-3 bg-green-50 rounded">
          <h3 class="font-medium">Détails du soin</h3>
          <p><strong>Description:</strong> {{ soinDetails.description }}</p>
          <div v-if="soinDetails.medicaments && soinDetails.medicaments.length > 0">
            <h4 class="font-medium mt-2">Médicaments associés:</h4>
            <ul class="list-disc ml-5">
              <li v-for="(med, index) in soinDetails.medicaments" :key="index">
                {{ med.nom }} ({{ med.dosage }}) - {{ med.quantite }}
              </li>
            </ul>
          </div>
        </div>
        
        <!-- Sélection de l'infirmier -->
        <div class="mb-4">
          <label for="infirmier" class="block mb-1 font-medium">Infirmier responsable:</label>
          <select 
            id="infirmier" 
            v-model="formulaire.id_infirmier" 
            class="w-full p-2 border rounded"
            required
          >
            <option value="">Sélectionnez un infirmier</option>
            <option v-for="infirmier in infirmiers" :key="infirmier.id_infirmier" :value="infirmier.id_infirmier">
              {{ infirmier.prenom }} {{ infirmier.nom }} - {{ infirmier.qualification || "Sans qualification spécifique" }}
            </option>
          </select>
        </div>
        
        <!-- Date et heure de l'administration -->
        <div class="mb-4">
          <label for="date_heure" class="block mb-1 font-medium">Date et heure de l'administration:</label>
          <input 
            id="date_heure" 
            type="datetime-local" 
            v-model="formulaire.date_heure" 
            class="w-full p-2 border rounded"
            required
          />
        </div>
        
        <!-- Commentaires -->
        <div class="mb-4">
          <label for="commentaires" class="block mb-1 font-medium">Commentaires:</label>
          <textarea 
            id="commentaires" 
            v-model="formulaire.commentaires" 
            class="w-full p-2 border rounded"
            rows="4"
            placeholder="Commentaires sur l'administration du soin..."
          ></textarea>
        </div>
        
        <!-- Boutons d'action -->
        <div class="flex justify-between">
          <button 
            type="submit" 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            :disabled="envoiEnCours"
          >
            {{ envoiEnCours ? 'Enregistrement...' : 'Enregistrer l\'administration' }}
          </button>
          <button 
            type="button" 
            @click="reinitialiserFormulaire" 
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Réinitialiser
          </button>
        </div>
      </form>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        // Données pour les listes 
        patients: [],
        infirmiers: [],
        soinsPatient: [],
        
        // Détails des éléments sélectionnés
        patientDetails: null,
        soinDetails: null,
        selectedPatientId: "",
        
        // Données du formulaire
        formulaire: {
          id_soin: "",
          id_infirmier: "",
          date_heure: this.getDefaultDateTime(),
          commentaires: ""
        },
        
        chargementDonnees: false,
        envoiEnCours: false,
        erreur: null,
        messageSucces: null
      };
    },
    mounted() {
      this.chargerDonneesInitiales();
    },
    methods: {
      chargerDonneesInitiales() {
        this.chargementDonnees = true;
        this.erreur = null;
        
        const patientsPromise = axios.get("http://localhost:3002/patients");
        
        const infirmiersPromise = axios.get("http://localhost:3002/infirmiers");
        
        Promise.all([patientsPromise, infirmiersPromise])
          .then(([patientsResponse, infirmiersResponse]) => {
            // Traitement des patients
            if (patientsResponse.data && Array.isArray(patientsResponse.data)) {
              this.patients = patientsResponse.data;
            } else if (patientsResponse.data && patientsResponse.data.patients) {
              this.patients = patientsResponse.data.patients;
            } else {
              console.error("Format de réponse patients incorrect:", patientsResponse.data);
            }
            
            // Traitement des infirmiers
            if (infirmiersResponse.data && Array.isArray(infirmiersResponse.data)) {
              this.infirmiers = infirmiersResponse.data;
            } else if (infirmiersResponse.data && infirmiersResponse.data.infirmiers) {
              this.infirmiers = infirmiersResponse.data.infirmiers;
            } else {
              console.error("Format de réponse infirmiers incorrect:", infirmiersResponse.data);
            }
          })
          .catch(error => {
            this.erreur = "Erreur lors du chargement des données initiales: " + error.message;
            console.error("Erreur:", error);
          })
          .finally(() => {
            this.chargementDonnees = false;
          });
      },
      
      chargerSoinsPatient() {
        if (!this.selectedPatientId) {
          this.soinsPatient = [];
          this.patientDetails = null;
          return;
        }
        
        this.chargementDonnees = true;
        this.erreur = null;
        
        const patientPromise = axios.get(`http://localhost:3002/patients/${this.selectedPatientId}`);
        
        const soinsPromise = axios.get(`http://localhost:3002/afficherSoinsPatient/${this.selectedPatientId}`);
        
        Promise.all([patientPromise, soinsPromise])
          .then(([patientResponse, soinsResponse]) => {
            // Traitement des détails du patient
            this.patientDetails = patientResponse.data;
            
            // Traitement des soins
            if (soinsResponse.data && Array.isArray(soinsResponse.data)) {
              this.soinsPatient = soinsResponse.data;
            } else if (soinsResponse.data && soinsResponse.data.soins) {
              this.soinsPatient = soinsResponse.data.soins;
            } else {
              this.soinsPatient = [];
              console.error("Format de réponse soins incorrect:", soinsResponse.data);
            }
            
            this.formulaire.id_soin = "";
            this.soinDetails = null;
          })
          .catch(error => {
            this.erreur = "Erreur lors du chargement des soins du patient: " + error.message;
            console.error("Erreur:", error);
          })
          .finally(() => {
            this.chargementDonnees = false;
          });
      },
      
      chargerDetailsSoin() {
        if (!this.formulaire.id_soin) {
          this.soinDetails = null;
          return;
        }
        
        this.soinDetails = this.soinsPatient.find(soin => soin.id_soin == this.formulaire.id_soin);
      },
      
      enregistrerAdministration() {
        this.envoiEnCours = true;
        this.erreur = null;
        this.messageSucces = null;
        
        //données à envoyer
        const donnees = {
          id_soin: this.formulaire.id_soin,
          id_infirmier: this.formulaire.id_infirmier,
          date_heure: this.formulaire.date_heure,
          commentaires: this.formulaire.commentaires
        };
        
        axios.post("http://localhost:3002/administrationSoin", donnees)
          .then(response => {
            this.messageSucces = "Administration de soin enregistrée avec succès !";
            this.reinitialiserFormulaire();
          })
          .catch(error => {
            this.erreur = "Erreur lors de l'enregistrement: " + error.message;
            console.error("Erreur:", error);
          })
          .finally(() => {
            this.envoiEnCours = false;
          });
      },
      
      reinitialiserFormulaire() {
        this.selectedPatientId = "";
        this.patientDetails = null;
        this.soinsPatient = [];
        this.soinDetails = null;
        
        this.formulaire = {
          id_soin: "",
          id_infirmier: "",
          date_heure: this.getDefaultDateTime(),
          commentaires: ""
        };
      },
      
      getDefaultDateTime() {
        //  format date
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      },
      
      formatDate(dateString) {
        if (!dateString) return "Non spécifiée";
      
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR");
      }
    }
  };
  </script>
  
  <style scoped>
  .erreur {
    color: red;
    margin: 10px 0;
    padding: 10px;
    background-color: #ffeeee;
    border-radius: 4px;
    border-left: 3px solid red;
  }
  
  .succes {
    color: green;
    margin: 10px 0;
    padding: 10px;
    background-color: #eeffee;
    border-radius: 4px;
    border-left: 3px solid green;
  }
  
  button {
    padding: 8px 16px;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  select, input, textarea {
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 8px;
    font-size: 14px;
  }
  
  select:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
  </style>