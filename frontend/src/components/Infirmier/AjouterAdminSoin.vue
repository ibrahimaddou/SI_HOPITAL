<template>
  <div class="ajouter-admin-soin">
    <h2>Administrer un soin</h2>
    
    <!-- Message d'alerte -->
    <div v-if="message" class="alert">
      {{ message.text }}
    </div>
    
    <!-- Formulaire d'administration de soin -->
    <div v-if="!selectedSoin" class="selection-section">
      <h3>Sélectionner un soin à administrer</h3>
      
      <div class="filter-controls">
        <input 
          type="text" 
          class="search-input" 
          placeholder="Rechercher un soin..." 
          v-model="searchQuery"
        >
      </div>
      
      <div v-if="loading" class="loading-indicator">
        Chargement des soins à administrer...
      </div>
      
      <table v-else class="soins-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Patient</th>
            <th>Description</th>
            <th>Médicaments</th>
            <th>Dernière administration</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="filteredSoins.length === 0">
            <td colspan="6" class="centered">Aucun soin à administrer n'a été trouvé</td>
          </tr>
          <tr v-for="soin in filteredSoins" :key="soin.id_soin">
            <td>{{ soin.id_soin }}</td>
            <td>{{ soin.nom_patient }} {{ soin.prenom_patient }}</td>
            <td>{{ truncateText(soin.description, 50) }}</td>
            <td>
              <span v-if="soin.medicaments && soin.medicaments.length > 0">
                {{ soin.medicaments.length }} médicament(s)
              </span>
              <span v-else>Aucun</span>
            </td>
            <td>
              <span v-if="soin.derniereAdministration">
                {{ formatDate(soin.derniereAdministration) }}
              </span>
              <span v-else>Jamais administré</span>
            </td>
            <td>
              <button 
                class="btn-administrer" 
                @click="selectSoin(soin)"
              >
                Administrer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Formulaire d'administration -->
    <div v-if="selectedSoin" class="administration-form-container">
      <div class="form-header">
        <h3>Administrer le soin #{{ selectedSoin.id_soin }}</h3>
        <button class="btn-back" @click="deselectSoin">Retour à la liste</button>
      </div>
      
      <div class="soin-info-panel">
        <div class="info-group">
          <h4>Patient</h4>
          <p>{{ selectedSoin.nom_patient }} {{ selectedSoin.prenom_patient }}</p>
        </div>
        
        <div class="info-group">
          <h4>Description du soin</h4>
          <p>{{ selectedSoin.description }}</p>
        </div>
      </div>
      
      <div v-if="selectedSoin.medicaments && selectedSoin.medicaments.length > 0" class="medicaments-panel">
        <h4>Médicaments à administrer</h4>
        <ul class="medicaments-list">
          <li v-for="(med, index) in selectedSoin.medicaments" :key="index" class="medicament-item">
            <div class="medicament-name">{{ med.nom_medicament }}</div>
            <div class="medicament-dosage">{{ med.dosage }}</div>
            <div class="medicament-quantite">{{ med.quantite }}</div>
          </li>
        </ul>
      </div>
      
      <form @submit.prevent="submitForm" class="admin-form">
        <div class="form-group">
          <label for="infirmier">Infirmier responsable :</label>
          <select 
            id="infirmier" 
            v-model="formData.id_infirmier" 
            class="form-control"
            required
          >
            <option value="">Sélectionner un infirmier</option>
            <option v-for="infirmier in infirmiers" :key="infirmier.id_personne" :value="infirmier.id_personne">
              {{ infirmier.prenom }} {{ infirmier.nom }}
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="commentaires">Commentaires :</label>
          <textarea 
            id="commentaires" 
            v-model="formData.commentaires" 
            class="form-control"
            rows="4"
            placeholder="Observations, réactions du patient, etc."
          ></textarea>
        </div>
        
        <div class="administration-confirmation">
          <p>En soumettant ce formulaire, vous confirmez que le soin a été administré à {{ formatDate(currentDateTime) }}.</p>
        </div>
        
        <div class="form-actions">
          <button type="button" class="btn-cancel" @click="deselectSoin">Annuler</button>
          <button type="submit" class="btn-save" :disabled="!formData.id_infirmier">Confirmer l'administration</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AjouterAdministrationSoin',
  data() {
    return {
      soins: [],
      infirmiers: [],
      loading: true,
      selectedSoin: null,
      message: null,
      searchQuery: '',
      formData: {
        id_soin: null,
        id_infirmier: '',
        commentaires: ''
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
    currentDateTime() {
      return new Date();
    }
  },
  mounted() {
    console.log("Composant AjouterAdministrationSoin monté");
    this.fetchData();
  },
  methods: {
    async fetchData() {
      try {
        this.loading = true;
        
        // Charger les données nécessaires en parallèle
        const [soinsResponse, infirmiersResponse] = await Promise.all([
          axios.get('http://localhost:3002/soins'),
          axios.get('http://localhost:3002/infirmiers')
        ]);
        
        // Récupérer les infirmiers
        this.infirmiers = infirmiersResponse.data;
        console.log("Infirmiers récupérés:", this.infirmiers);
        
        // Récupérer et enrichir les soins
        const soinsData = soinsResponse.data;
        
        // Pour chaque soin, récupérer ses détails
        const enrichedSoins = await Promise.all(
          soinsData.map(async (soin) => {
            try {
              // Récupérer les détails du soin (médicaments, administrations, etc.)
              const response = await axios.get(`http://localhost:3002/soins/${soin.id_soin}`);
              const soinDetail = response.data;
              
              // Déterminer la dernière administration si elle existe
              let derniereAdministration = null;
              if (soinDetail.administrations && soinDetail.administrations.length > 0) {
                // Trier les administrations par date (la plus récente en premier)
                const sortedAdmins = [...soinDetail.administrations].sort((a, b) => {
                  return new Date(b.date_heure) - new Date(a.date_heure);
                });
                derniereAdministration = sortedAdmins[0].date_heure;
              }
              
              return {
                ...soin,
                ...soinDetail,
                derniereAdministration
              };
            } catch (error) {
              console.error(`Erreur lors de la récupération des détails du soin ${soin.id_soin}:`, error);
              return soin;
            }
          })
        );
        
        this.soins = enrichedSoins;
        console.log("Soins récupérés et enrichis:", this.soins);
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
    
    selectSoin(soin) {
      console.log("Soin sélectionné pour administration:", soin);
      this.selectedSoin = soin;
      this.formData.id_soin = soin.id_soin;
    },
    
    deselectSoin() {
      this.selectedSoin = null;
      this.formData = {
        id_soin: null,
        id_infirmier: '',
        commentaires: ''
      };
    },
    
    async submitForm() {
      if (!this.formData.id_soin || !this.formData.id_infirmier) {
        this.message = {
          type: 'error',
          text: "Veuillez sélectionner un infirmier pour administrer ce soin."
        };
        return;
      }
      
      try {
        console.log("Envoi des données pour l'administration du soin:", this.formData);
        
        const response = await axios.post(
          'http://localhost:3002/administrationSoin',
          {
            id_soin: this.formData.id_soin,
            id_infirmier: this.formData.id_infirmier,
            commentaires: this.formData.commentaires || null
          }
        );
        
        console.log("Réponse du serveur:", response);
        
        this.message = {
          type: 'success',
          text: "Le soin a été administré avec succès."
        };
        
        // Réinitialiser le formulaire et revenir à la liste des soins
        this.deselectSoin();
        
        // Rafraîchir la liste des soins
        this.fetchData();
        
        // Masquer le message après 5 secondes
        setTimeout(() => {
          this.message = null;
        }, 5000);
        
      } catch (error) {
        console.error("Erreur lors de l'administration du soin:", error);
        
        let errorMessage = "Erreur lors de l'administration du soin.";
        
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
    },
    
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(date);
    }
  }
};
</script>

<style scoped>
.ajouter-admin-soin {
  max-width: 900px;
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

.loading-indicator {
  text-align: center;
  padding: 20px;
  color: #666;
}

/* Tableau des soins */
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

.btn-administrer {
  background-color: #ccc;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-administrer:hover {
  background-color: #999;
}

/* Formulaire d'administration */
.administration-form-container {
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

/* Panneau d'information */
.soin-info-panel {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
}

.info-group {
  flex: 1;
}

.info-group h4 {
  margin-top: 0;
  margin-bottom: 8px;
  font-size: 14px;
}

.info-group p {
  margin: 0;
}

/* Médicaments */
.medicaments-panel {
  margin-bottom: 20px;
  padding: 15px;
  background-color: #f0f0f0;
  border-radius: 8px;
}

.medicaments-panel h4 {
  margin-top: 0;
  margin-bottom: 10px;
  font-size: 14px;
}

.medicaments-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.medicament-item {
  display: flex;
  gap: 15px;
  padding: 8px 0;
  border-bottom: 1px solid #ddd;
}

.medicament-item:last-child {
  border-bottom: none;
}

.medicament-name {
  font-weight: bold;
  flex: 1;
}

.medicament-dosage {
  color: #666;
  flex: 1;
}

.medicament-quantite {
  font-style: italic;
  flex: 2;
}

/* Formulaire */
.admin-form {
  margin-top: 20px;
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

.administration-confirmation {
  margin: 20px 0;
  padding: 10px;
  background-color: #f0f0f0;
  border-radius: 4px;
  font-size: 14px;
  font-style: italic;
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

.btn-cancel:hover, .btn-save:hover, .btn-back:hover {
  background-color: #bbb;
}
</style>