<template>
  <div class="ajouter-visite">
    <h2>Planifier une visite médicale</h2>
    
    <!-- Message d'alerte -->
    <div v-if="message" class="alert">
      {{ message.text }}
    </div>
    
    <form @submit.prevent="submitForm" class="visite-form">
      <div class="form-section">
        <h3>Informations générales</h3>
        
        <div class="form-group">
          <label for="patient">Patient :</label>
          <select 
            id="patient" 
            v-model="formData.idPatient" 
            class="form-control"
            required
          >
            <option value="">Sélectionnez un patient</option>
            <option v-for="patient in patients" :key="patient.id_patient" :value="patient.id_patient">
              {{ patient.nom }} {{ patient.prenom }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="medecin">Médecin :</label>
          <select 
            id="medecin" 
            v-model="formData.idMedecin" 
            class="form-control"
            required
          >
            <option value="">Sélectionnez un médecin</option>
            <option v-for="medecin in medecins" :key="medecin.id_personne" :value="medecin.id_personne">
              {{ medecin.nom }} {{ medecin.prenom }} ({{ medecin.specialite }})
            </option>
          </select>
        </div>
        
        <div class="form-row">
          <div class="form-group">
            <label for="date-visite">Date de la visite :</label>
            <input 
              type="date" 
              id="date-visite" 
              v-model="formData.dateVisiteDate" 
              class="form-control"
              required
              :min="minDate"
            >
          </div>
          
          <div class="form-group">
            <label for="heure-visite">Heure de la visite :</label>
            <input 
              type="time" 
              id="heure-visite" 
              v-model="formData.dateVisiteTime" 
              class="form-control"
              required
            >
          </div>
        </div>
        
        <div class="form-group" v-if="patientSejours.length > 0">
          <label for="sejour">Séjour associé (optionnel) :</label>
          <select 
            id="sejour" 
            v-model="formData.idSejour" 
            class="form-control"
          >
            <option value="">Aucun séjour spécifique</option>
            <option v-for="sejour in patientSejours" :key="sejour.id_sejour" :value="sejour.id_sejour">
              Séjour du {{ formatDate(sejour.date_arrivee) }} 
              {{ sejour.date_sortie_reelle ? `au ${formatDate(sejour.date_sortie_reelle)}` : '(en cours)' }}
            </option>
          </select>
        </div>
      </div>
      
      <div class="form-section">
        <h3>Détails de la visite</h3>
        
        <div class="form-group">
          <label for="compte-rendu">Compte-rendu préliminaire :</label>
          <textarea 
            id="compte-rendu" 
            v-model="formData.compteRendu" 
            class="form-control"
            rows="4"
            placeholder="Décrivez le motif de la visite et les objectifs..."
            required
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="examens">Examens prévus :</label>
          <textarea 
            id="examens" 
            v-model="formData.examens" 
            class="form-control"
            rows="3"
            placeholder="Listez les examens qui seront effectués..."
          ></textarea>
        </div>
        
        <div class="form-group">
          <label for="prescriptions">Prescriptions prévues :</label>
          <textarea 
            id="prescriptions" 
            v-model="formData.prescriptions" 
            class="form-control"
            rows="3"
            placeholder="Listez les prescriptions envisagées..."
          ></textarea>
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="resetForm">Annuler</button>
        <button type="submit" class="btn-save" :disabled="!isFormValid">Planifier la visite</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AjouterVisiteMedicale',
  data() {
    return {
      patients: [],
      medecins: [],
      sejours: [],
      message: null,
      formData: {
        idPatient: '',
        idMedecin: '',
        dateVisiteDate: '',
        dateVisiteTime: '09:00',
        idSejour: '',
        compteRendu: '',
        examens: '',
        prescriptions: ''
      },
      loading: {
        patients: false,
        medecins: false,
        sejours: false,
        submit: false
      }
    };
  },
  computed: {
    minDate() {
      // La date d'aujourd'hui au format YYYY-MM-DD pour le champ date
      const today = new Date();
      return today.toISOString().split('T')[0];
    },
    patientSejours() {
      // Filtrer les séjours du patient sélectionné
      if (!this.formData.idPatient) return [];
      return this.sejours.filter(sejour => sejour.id_patient == this.formData.idPatient);
    },
    isFormValid() {
      return (
        this.formData.idPatient && 
        this.formData.idMedecin && 
        this.formData.dateVisiteDate && 
        this.formData.dateVisiteTime && 
        this.formData.compteRendu
      );
    }
  },
  mounted() {
    console.log("Composant AjouterVisiteMedicale monté");
    this.fetchPatients();
    this.fetchMedecins();
    this.fetchSejours();
    
    // Initialiser la date à aujourd'hui
    this.formData.dateVisiteDate = new Date().toISOString().split('T')[0];
  },
  methods: {
    async fetchPatients() {
      try {
        this.loading.patients = true;
        console.log("Récupération des patients...");
        const response = await axios.get('http://localhost:3002/patients');
        this.patients = response.data;
        console.log("Patients récupérés:", this.patients);
      } catch (error) {
        console.error("Erreur lors de la récupération des patients:", error);
        this.message = {
          type: 'error',
          text: "Erreur lors du chargement des patients. Veuillez réessayer."
        };
      } finally {
        this.loading.patients = false;
      }
    },
    
    async fetchMedecins() {
      try {
        this.loading.medecins = true;
        console.log("Récupération des médecins...");
        const response = await axios.get('http://localhost:3002/medecins');
        this.medecins = response.data;
        console.log("Médecins récupérés:", this.medecins);
      } catch (error) {
        console.error("Erreur lors de la récupération des médecins:", error);
        this.message = {
          type: 'error',
          text: "Erreur lors du chargement des médecins. Veuillez réessayer."
        };
      } finally {
        this.loading.medecins = false;
      }
    },
    
    async fetchSejours() {
      try {
        this.loading.sejours = true;
        console.log("Récupération des séjours...");
        const response = await axios.get('http://localhost:3002/sejours');
        this.sejours = response.data;
        console.log("Séjours récupérés:", this.sejours);
      } catch (error) {
        console.error("Erreur lors de la récupération des séjours:", error);
        this.message = {
          type: 'error',
          text: "Erreur lors du chargement des séjours. Veuillez réessayer."
        };
      } finally {
        this.loading.sejours = false;
      }
    },
    
    resetForm() {
      this.formData = {
        idPatient: '',
        idMedecin: '',
        dateVisiteDate: new Date().toISOString().split('T')[0],
        dateVisiteTime: '09:00',
        idSejour: '',
        compteRendu: '',
        examens: '',
        prescriptions: ''
      };
      
      this.message = null;
    },
    
    async submitForm() {
  if (!this.isFormValid) {
    this.message = {
      type: 'error',
      text: "Veuillez remplir tous les champs obligatoires."
    };
    return;
  }
  
  try {
    this.loading.submit = true;
    
    // Combiner la date et l'heure en un format ISO sans millisecondes
    const dateVisite = new Date(`${this.formData.dateVisiteDate}T${this.formData.dateVisiteTime}`);
    // Format compatible avec ce qui fonctionne dans Postman
    const dateVisiteString = dateVisite.toISOString().split('.')[0];
    
    const requestData = {
      idPatient: this.formData.idPatient,
      idMedecin: this.formData.idMedecin,
      dateVisite: dateVisiteString,
      compteRendu: this.formData.compteRendu,
      diagnostics: this.formData.examens || "", // Jamais null
      prescriptions: this.formData.prescriptions || ""
      // Ne pas inclure idSejour du tout
    };
    
    console.log("Envoi des données pour créer une visite:", requestData);
    
    const response = await axios.post('http://localhost:3002/afficherVisitesMedicales', requestData);
    
    console.log("Réponse du serveur:", response);
    
    this.message = {
      type: 'success',
      text: "La visite médicale a été planifiée avec succès."
    };
    
    // Réinitialiser le formulaire après un succès
    this.resetForm();
    
  } catch (error) {
    // Reste du code inchangé
  }
},
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    }
  }
};
</script>

<style scoped>
.ajouter-visite {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.alert {
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
}

.visite-form {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.form-section {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.form-section h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  font-size: 14px;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
}

textarea.form-control {
  resize: vertical;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  background-color: #ccc;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save {
  background-color: #ddd;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-save:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-cancel:hover, .btn-save:hover {
  background-color: #bbb;
}
</style>