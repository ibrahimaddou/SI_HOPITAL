<template>
  <div class="ajouter-reunion">
    <h2>Planifier une réunion</h2>
    
    <!-- Message d'alerte -->
    <div v-if="message" class="alert">
      {{ message.text }}
    </div>
    
    <form @submit.prevent="submitForm" class="reunion-form">
      <div class="form-section">
        <h3>Informations générales</h3>
        
        <div class="form-row">
          <div class="form-group">
            <label for="date-reunion">Date de la réunion :</label>
            <input 
              type="date" 
              id="date-reunion" 
              v-model="formData.dateReunionDate" 
              class="form-control"
              required
              :min="minDate"
            >
          </div>
          
          <div class="form-group">
            <label for="heure-reunion">Heure de la réunion :</label>
            <input 
              type="time" 
              id="heure-reunion" 
              v-model="formData.dateReunionTime" 
              class="form-control"
              required
            >
          </div>
        </div>
        
        <div class="form-group">
          <label for="sujet">Sujet de la réunion :</label>
          <input 
            type="text" 
            id="sujet" 
            v-model="formData.sujet" 
            class="form-control"
            required
            placeholder="Ex: Discussion des cas prioritaires"
          >
        </div>
        
        <div class="form-group">
          <label for="compte-rendu">Compte-rendu préliminaire (optionnel) :</label>
          <textarea 
            id="compte-rendu" 
            v-model="formData.compteRendu" 
            class="form-control"
            rows="3"
            placeholder="Points à aborder, objectifs de la réunion..."
          ></textarea>
        </div>
      </div>
      
      <div class="form-section">
        <h3>Participants</h3>
        
        <div class="form-group">
          <label>Médecins participants :</label>
          <div class="participants-list">
            <div 
              v-for="medecin in medecins" 
              :key="'med-' + medecin.id_personne" 
              class="participant-item"
            >
              <input 
                type="checkbox" 
                :id="'med-' + medecin.id_personne" 
                :value="medecin.id_personne" 
                v-model="formData.medecinIds"
              >
              <label :for="'med-' + medecin.id_personne">
                {{ medecin.nom }} {{ medecin.prenom }} ({{ medecin.specialite }})
              </label>
            </div>
            <div v-if="medecins.length === 0" class="no-participants">
              Aucun médecin disponible
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label>Infirmiers participants :</label>
          <div class="participants-list">
            <div 
              v-for="infirmier in infirmiers" 
              :key="'inf-' + infirmier.id_personne" 
              class="participant-item"
            >
              <input 
                type="checkbox" 
                :id="'inf-' + infirmier.id_personne" 
                :value="infirmier.id_personne" 
                v-model="formData.infirmierIds"
              >
              <label :for="'inf-' + infirmier.id_personne">
                {{ infirmier.nom }} {{ infirmier.prenom }} ({{ infirmier.qualification || 'Infirmier' }})
              </label>
            </div>
            <div v-if="infirmiers.length === 0" class="no-participants">
              Aucun infirmier disponible
            </div>
          </div>
        </div>
        
        <div class="form-message" v-if="formData.medecinIds.length === 0 && formData.infirmierIds.length === 0">
          Veuillez sélectionner au moins un participant
        </div>
      </div>
      
      <div class="form-actions">
        <button type="button" class="btn-cancel" @click="resetForm">Annuler</button>
        <button type="submit" class="btn-save" :disabled="!isFormValid">Planifier la réunion</button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AjouterReunion',
  data() {
    return {
      medecins: [],
      infirmiers: [],
      message: null,
      formData: {
        dateReunionDate: '',
        dateReunionTime: '14:00',
        sujet: '',
        compteRendu: '',
        medecinIds: [],
        infirmierIds: []
      },
      loading: {
        medecins: false,
        infirmiers: false,
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
    isFormValid() {
      return (
        this.formData.dateReunionDate && 
        this.formData.dateReunionTime && 
        this.formData.sujet && 
        (this.formData.medecinIds.length > 0 || this.formData.infirmierIds.length > 0)
      );
    }
  },
  mounted() {
    console.log("Composant AjouterReunion monté");
    this.fetchMedecins();
    this.fetchInfirmiers();
    
    // Initialiser la date à aujourd'hui
    this.formData.dateReunionDate = new Date().toISOString().split('T')[0];
  },
  methods: {
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
    
    async fetchInfirmiers() {
      try {
        this.loading.infirmiers = true;
        console.log("Récupération des infirmiers...");
        const response = await axios.get('http://localhost:3002/infirmiers');
        this.infirmiers = response.data;
        console.log("Infirmiers récupérés:", this.infirmiers);
      } catch (error) {
        console.error("Erreur lors de la récupération des infirmiers:", error);
        this.message = {
          type: 'error',
          text: "Erreur lors du chargement des infirmiers. Veuillez réessayer."
        };
      } finally {
        this.loading.infirmiers = false;
      }
    },
    
    resetForm() {
      this.formData = {
        dateReunionDate: new Date().toISOString().split('T')[0],
        dateReunionTime: '14:00',
        sujet: '',
        compteRendu: '',
        medecinIds: [],
        infirmierIds: []
      };
      
      this.message = null;
    },
    
    async submitForm() {
      if (!this.isFormValid) {
        this.message = {
          type: 'error',
          text: "Veuillez remplir tous les champs obligatoires et sélectionner au moins un participant."
        };
        return;
      }
      
      try {
        this.loading.submit = true;
        
        // Combiner la date et l'heure en un format ISO
        const dateReunion = new Date(`${this.formData.dateReunionDate}T${this.formData.dateReunionTime}`);
        const dateReunionISO = dateReunion.toISOString().split('.')[0]; // Sans les millisecondes
        
        const requestData = {
          dateReunion: dateReunionISO,
          sujet: this.formData.sujet,
          compteRendu: this.formData.compteRendu || null,
          medecinIds: this.formData.medecinIds,
          infirmierIds: this.formData.infirmierIds
        };
        
        console.log("Envoi des données pour créer une réunion:", requestData);
        
        const response = await axios.post('http://localhost:3002/reunions', requestData);
        
        console.log("Réponse du serveur:", response);
        
        this.message = {
          type: 'success',
          text: "La réunion a été planifiée avec succès."
        };
        
        // Réinitialiser le formulaire après un succès
        this.resetForm();
        
      } catch (error) {
        console.error("Erreur lors de la planification de la réunion:", error);
        
        let errorMessage = "Erreur lors de la planification de la réunion.";
        
        if (error.response) {
          console.log("Détails de l'erreur:", error.response);
          if (error.response.data && error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data && error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
        
        this.message = {
          type: 'error',
          text: errorMessage
        };
      } finally {
        this.loading.submit = false;
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
.ajouter-reunion {
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

.reunion-form {
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

.participants-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 10px;
  margin-top: 5px;
}

.participant-item {
  margin-bottom: 5px;
  display: flex;
  align-items: center;
}

.participant-item input[type="checkbox"] {
  margin-right: 10px;
}

.no-participants {
  color: #666;
  font-style: italic;
}

.form-message {
  margin-top: 10px;
  color: #666;
  font-style: italic;
}
</style>