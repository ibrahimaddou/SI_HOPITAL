<template>
  <div class="modifier-soin">
    <h2>Modifier un soin</h2>
    
    <!-- Message d'alerte -->
    <div v-if="message" class="alert">
      {{ message.text }}
    </div>
    
    <!-- Sélection du soin à modifier -->
    <div v-if="!selectedSoin" class="selection-section">
      <h3>Sélectionner un soin à modifier</h3>
      
      <div class="filter-controls">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Rechercher un soin..." 
          v-model="searchQuery"
        >
      </div>
      
      <table class="soins-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Description</th>
            <th>Patient</th>
            <th>Réunion</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td colspan="5" class="centered">
              Chargement...
            </td>
          </tr>
          <tr v-else-if="filteredSoins.length === 0">
            <td colspan="5" class="centered">Aucun soin trouvé</td>
          </tr>
          <tr v-for="soin in filteredSoins" :key="soin.id_soin">
            <td>{{ soin.id_soin }}</td>
            <td>{{ truncateText(soin.description, 30) }}</td>
            <td>{{ soin.nom_patient }} {{ soin.prenom_patient }}</td>
            <td>{{ formatDate(soin.date_reunion) }}</td>
            <td>
              <button 
                class="btn-edit" 
                @click="selectSoin(soin)"
                title="Modifier ce soin"
              >
                Modifier
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Formulaire de modification du soin -->
    <div v-if="selectedSoin" class="edit-form-container">
      <div class="form-header">
        <h3>Modifier le soin #{{ selectedSoin.id_soin }}</h3>
        <button class="btn-back" @click="deselectSoin">Retour à la liste</button>
      </div>
      
      <form @submit.prevent="submitForm" class="soin-form">
        <div class="form-section">
          <h4>Informations générales</h4>
          
          <div class="form-group">
            <label for="patient">Patient :</label>
            <select 
              id="patient" 
              v-model="formData.id_patient" 
              class="form-control"
              required
            >
              <option v-for="patient in patients" :key="patient.id_patient" :value="patient.id_patient">
                {{ patient.nom }} {{ patient.prenom }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="reunion">Réunion de décision :</label>
            <select 
              id="reunion" 
              v-model="formData.id_reunion_decision" 
              class="form-control"
              required
            >
              <option v-for="reunion in reunions" :key="reunion.id_reunion" :value="reunion.id_reunion">
                {{ formatDate(reunion.date_reunion) }} - {{ reunion.sujet }}
              </option>
            </select>
          </div>
          
          <div class="form-group">
            <label for="description">Description du soin :</label>
            <textarea 
              id="description" 
              v-model="formData.description" 
              class="form-control"
              rows="4"
              required
            ></textarea>
          </div>
        </div>
        
        <div class="form-section">
          <h4>Médicaments associés</h4>
          
          <div class="medicaments-list">
            <div 
              v-for="(med, index) in formData.medicaments" 
              :key="index" 
              class="medicament-item"
            >
              <div class="medicament-row">
                <select 
                  v-model="med.id_medicament" 
                  class="form-control med-select"
                  required
                >
                  <option value="">Sélectionner un médicament</option>
                  <option 
                    v-for="medicament in medicaments" 
                    :key="medicament.id_medicament" 
                    :value="medicament.id_medicament"
                  >
                    {{ medicament.nom }} ({{ medicament.dosage }})
                  </option>
                </select>
                
                <input 
                  type="text" 
                  v-model="med.quantite" 
                  class="form-control med-quantity"
                  placeholder="Posologie (ex: 1g × 3/jour pendant 7 jours)"
                  required
                >
                
                <button 
                  type="button" 
                  class="btn-remove" 
                  @click="removeMedicament(index)"
                  title="Retirer ce médicament"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div class="no-medicaments" v-if="formData.medicaments.length === 0">
              Aucun médicament associé à ce soin
            </div>
            
            <button 
              type="button" 
              class="btn-add" 
              @click="addMedicament"
            >
              Ajouter un médicament
            </button>
          </div>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="deselectSoin">Annuler</button>
          <button type="submit" class="btn-save" :disabled="!isFormValid">Enregistrer les modifications</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ModifierSoin',
  data() {
    return {
      soins: [],
      patients: [],
      reunions: [],
      medicaments: [],
      loading: true,
      selectedSoin: null,
      message: null,
      searchQuery: '',
      formData: {
        id_soin: null,
        description: '',
        id_patient: '',
        id_reunion_decision: '',
        medicaments: []
      }
    };
  },
  computed: {
    filteredSoins() {
      if (!this.searchQuery.trim()) {
        return this.soins;
      }
      
      const query = this.searchQuery.toLowerCase();
      return this.soins.filter(soin => {
        return (
          (soin.description && soin.description.toLowerCase().includes(query)) ||
          (soin.nom_patient && soin.nom_patient.toLowerCase().includes(query)) ||
          (soin.prenom_patient && soin.prenom_patient.toLowerCase().includes(query)) ||
          (soin.id_soin && soin.id_soin.toString().includes(query))
        );
      });
    },
    isFormValid() {
      // Vérifier que tous les champs obligatoires sont remplis
      if (!this.formData.description || !this.formData.id_patient || !this.formData.id_reunion_decision) {
        return false;
      }
      
      // Si des médicaments sont présents, vérifier qu'ils sont tous valides
      for (const med of this.formData.medicaments) {
        if (!med.id_medicament || !med.quantite) {
          return false;
        }
      }
      
      return true;
    }
  },
  mounted() {
    console.log("Composant ModifierSoin monté");
    this.fetchAllData();
  },
  methods: {
    async fetchAllData() {
      try {
        this.loading = true;
        
        // Charger toutes les données nécessaires en parallèle
        const [soinsResponse, patientsResponse, reunionsResponse, medicamentsResponse] = await Promise.all([
          axios.get('http://localhost:3002/soins'),
          axios.get('http://localhost:3002/patients'),
          axios.get('http://localhost:3002/reunions'),
          axios.get('http://localhost:3002/afficherMedicaments')
        ]);
        
        this.soins = soinsResponse.data;
        this.patients = patientsResponse.data;
        this.reunions = reunionsResponse.data;
        this.medicaments = medicamentsResponse.data;
        
        console.log("Données chargées:", {
          soins: this.soins,
          patients: this.patients,
          reunions: this.reunions,
          medicaments: this.medicaments
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        this.message = {
          type: 'error',
          text: "Erreur lors du chargement des données. Veuillez réessayer."
        };
      } finally {
        this.loading = false;
      }
    },
    
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    },
    
    selectSoin(soin) {
      console.log("Soin sélectionné pour modification:", soin);
      
      this.selectedSoin = soin;
      
      // Initialiser le formulaire avec les données du soin
      this.formData = {
        id_soin: soin.id_soin,
        description: soin.description,
        id_patient: soin.id_patient,
        id_reunion_decision: soin.id_reunion_decision,
        medicaments: [] // On part d'une liste vide car nous n'avons pas d'informations sur les médicaments
      };
      
      // Charger les médicaments associés au soin
      this.fetchSoinMedicaments(soin.id_soin);
    },
    
    async fetchSoinMedicaments(idSoin) {
      try {
        // Si votre API le permet, récupérer les médicaments associés au soin
        const response = await axios.get(`http://localhost:3002/afficherMedicamentsPatient/${idSoin}`);
        
        if (response.data && Array.isArray(response.data)) {
          this.formData.medicaments = response.data.map(med => ({
            id_medicament: med.id_medicament,
            quantite: med.quantite
          }));
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des médicaments du soin:", error);
        // En cas d'erreur, on laisse la liste vide et l'utilisateur pourra ajouter des médicaments
      }
    },
    
    deselectSoin() {
      this.selectedSoin = null;
      this.formData = {
        id_soin: null,
        description: '',
        id_patient: '',
        id_reunion_decision: '',
        medicaments: []
      };
    },
    
    addMedicament() {
      this.formData.medicaments.push({
        id_medicament: '',
        quantite: ''
      });
    },
    
    removeMedicament(index) {
      this.formData.medicaments.splice(index, 1);
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
        console.log("Envoi des données pour modifier le soin:", this.formData);
        
        const response = await axios.put(
          `http://localhost:3002/modifierSoin/${this.formData.id_soin}`, 
          {
            description: this.formData.description,
            id_patient: this.formData.id_patient,
            id_reunion_decision: this.formData.id_reunion_decision,
            medicaments: this.formData.medicaments
          }
        );
        
        console.log("Réponse du serveur:", response);
        
        this.message = {
          type: 'success',
          text: "Le soin a été modifié avec succès."
        };
        
        // Mettre à jour la liste des soins
        await this.fetchAllData();
        
        // Revenir à la liste des soins
        this.deselectSoin();
        
        // Masquer le message après 5 secondes
        setTimeout(() => {
          this.message = null;
        }, 5000);
        
      } catch (error) {
        console.error("Erreur lors de la modification du soin:", error);
        
        let errorMessage = "Erreur lors de la modification du soin.";
        
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
      }
    }
  }
};
</script>

<style scoped>
.modifier-soin {
  max-width: 1000px;
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

/* Section de sélection */
.selection-section {
  margin-bottom: 30px;
}

.filter-controls {
  margin-bottom: 20px;
  display: flex;
  gap: 10px;
}

.search-input {
  flex: 1;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.soins-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.soins-table th, 
.soins-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.soins-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.centered {
  text-align: center;
}

.btn-edit {
  background-color: #ccc;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit:hover {
  background-color: #999;
}

/* Formulaire d'édition */
.edit-form-container {
  background-color: #fff;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 20px;
}

.form-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.form-header h3 {
  margin: 0;
}

.btn-back {
  background-color: #ccc;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.soin-form {
  margin-top: 20px;
}

.form-section {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.form-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 16px;
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

/* Médicaments */
.medicaments-list {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
  background-color: #fafafa;
}

.medicament-item {
  margin-bottom: 10px;
}

.medicament-row {
  display: flex;
  gap: 10px;
  align-items: center;
}

.med-select {
  flex: 2;
}

.med-quantity {
  flex: 1;
}

.btn-remove {
  background-color: #ccc;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
}

.no-medicaments {
  margin-bottom: 10px;
  font-style: italic;
  color: #666;
}

.btn-add {
  background-color: #ddd;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  margin-top: 10px;
}

/* Actions du formulaire */
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

.btn-cancel:hover, .btn-save:hover, .btn-back:hover, .btn-add:hover, .btn-remove:hover {
  background-color: #bbb;
}
</style> 