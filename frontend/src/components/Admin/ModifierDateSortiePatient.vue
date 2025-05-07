<template>
  <div class="modifier-date-sortie">
    <h2>Modifier la date de sortie des patients</h2>
    
    <!-- Message d'alerte -->
    <div v-if="message" class="alert">
      {{ message.text }}
    </div>
    
    <!-- Contrôles de filtrage -->
    <div class="filter-controls">
      <input 
        type="text" 
        class="search-input" 
        placeholder="Rechercher un séjour..." 
        v-model="searchQuery"
      >
      <select v-model="filterStatus" class="filter-select">
        <option value="all">Tous les séjours</option>
        <option value="active">Séjours actifs</option>
        <option value="withoutExit">Sans date de sortie</option>
        <option value="completed">Séjours terminés</option>
      </select>
    </div>
    
    <!-- Tableau des séjours -->
    <table class="sejours-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Patient</th>
          <th>Date d'arrivée</th>
          <th>Date sortie prév.</th>
          <th>Date sortie réelle</th>
          <th>Chambre - Lit</th>
          <th>Raison</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="8" class="centered">
            Chargement...
          </td>
        </tr>
        <tr v-else-if="filteredSejours.length === 0">
          <td colspan="8" class="centered">Aucun séjour trouvé</td>
        </tr>
        <tr v-for="sejour in filteredSejours" :key="sejour.id_sejour">
          <td>{{ sejour.id_sejour }}</td>
          <td>{{ sejour.nom_patient }} {{ sejour.prenom_patient }}</td>
          <td>{{ formatDate(sejour.date_arrivee) }}</td>
          <td>{{ formatDate(sejour.date_sortie_previsionnelle) }}</td>
          <td>{{ formatDate(sejour.date_sortie_reelle) || '-' }}</td>
          <td>{{ sejour.numero_chambre }} - {{ sejour.numero_lit }}</td>
          <td>{{ truncateText(sejour.raison_sejour, 30) }}</td>
          <td>
            <button 
              class="btn-edit" 
              @click="openEditModal(sejour)"
              :disabled="!canEditSejour(sejour)"
              title="Modifier la date de sortie"
            >
              Modifier
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Modale de modification -->
    <div v-if="showEditModal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Modifier la date de sortie</h3>
          <button class="close-button" @click="showEditModal = false">×</button>
        </div>
        <div class="modal-body" v-if="selectedSejour">
          <div class="patient-info">
            <p><strong>Patient :</strong> {{ selectedSejour.nom_patient }} {{ selectedSejour.prenom_patient }}</p>
            <p><strong>Date d'arrivée :</strong> {{ formatDate(selectedSejour.date_arrivee) }}</p>
            <p><strong>Date de sortie prévisionnelle :</strong> {{ formatDate(selectedSejour.date_sortie_previsionnelle) }}</p>
          </div>
          
          <div class="form-group">
            <label for="date-sortie">Date de sortie réelle :</label>
            <input 
              type="date" 
              id="date-sortie" 
              v-model="newDateSortie"
              class="form-control"
            >
            <p class="help-text">La date doit être postérieure à la date d'arrivée</p>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showEditModal = false">Annuler</button>
          <button 
            class="btn-save" 
            @click="saveDateSortie"
            :disabled="!isValidDate"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ModifierDateSortiePatient',
  data() {
    return {
      sejours: [],
      loading: true,
      message: null,
      selectedSejour: null,
      showEditModal: false,
      newDateSortie: '',
      searchQuery: '',
      filterStatus: 'all'
    };
  },
  computed: {
    filteredSejours() {
      let result = this.sejours;
      
      // Filtrage par statut
      if (this.filterStatus !== 'all') {
        const today = new Date();
        
        if (this.filterStatus === 'active') {
          // Séjours actifs: date d'arrivée passée et pas de date de sortie réelle
          result = result.filter(sejour => {
            const dateArrivee = new Date(sejour.date_arrivee);
            return dateArrivee <= today && !sejour.date_sortie_reelle;
          });
        } else if (this.filterStatus === 'withoutExit') {
          // Séjours sans date de sortie réelle
          result = result.filter(sejour => {
            return !sejour.date_sortie_reelle;
          });
        } else if (this.filterStatus === 'completed') {
          // Séjours terminés: date de sortie réelle présente
          result = result.filter(sejour => sejour.date_sortie_reelle);
        }
      }
      
      // Filtrage par recherche
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(sejour => {
          return (
            (sejour.nom_patient && sejour.nom_patient.toLowerCase().includes(query)) ||
            (sejour.prenom_patient && sejour.prenom_patient.toLowerCase().includes(query)) ||
            (sejour.raison_sejour && sejour.raison_sejour.toLowerCase().includes(query)) ||
            (sejour.id_sejour && sejour.id_sejour.toString().includes(query))
          );
        });
      }
      
      return result;
    },
    isValidDate() {
      if (!this.newDateSortie || !this.selectedSejour) return false;
      
      const dateArrivee = new Date(this.selectedSejour.date_arrivee);
      const dateSortie = new Date(this.newDateSortie);
      
      return dateSortie >= dateArrivee;
    }
  },
  mounted() {
    console.log("Composant ModifierDateSortiePatient monté");
    this.fetchSejours();
  },
  methods: {
    async fetchSejours() {
      try {
        this.loading = true;
        console.log("Récupération des séjours...");
        const response = await axios.get('http://localhost:3002/sejours');
        console.log("Séjours récupérés:", response.data);
        
        // Enrichir les données des séjours avec les informations des patients et des lits
        const enrichedSejours = await Promise.all(
          response.data.map(async (sejour) => {
            try {
              // Récupérer les informations du patient
              const patientResponse = await axios.get(`http://localhost:3002/patients/${sejour.id_patient}`);
              const patient = patientResponse.data[0] || {};
              
              return {
                ...sejour,
                nom_patient: patient.nom || 'Inconnu',
                prenom_patient: patient.prenom || '',
                numero_chambre: 'CH-' + (Math.floor(Math.random() * 100) + 100), // Simulé pour l'exemple
                numero_lit: 'L-' + (Math.floor(Math.random() * 10) + 1)          // Simulé pour l'exemple
              };
            } catch (error) {
              console.error("Erreur lors de la récupération des détails du patient:", error);
              return {
                ...sejour,
                nom_patient: 'Inconnu',
                prenom_patient: '',
                numero_chambre: 'CH-???',
                numero_lit: 'L-?'
              };
            }
          })
        );
        
        console.log("Séjours enrichis:", enrichedSejours);
        this.sejours = enrichedSejours;
      } catch (error) {
        console.error("Erreur lors de la récupération des séjours:", error);
        this.message = {
          type: 'error',
          text: "Erreur lors du chargement des séjours. Veuillez réessayer."
        };
      } finally {
        this.loading = false;
      }
    },
    
    openEditModal(sejour) {
      console.log("Séjour sélectionné pour modification:", sejour);
      
      if (!this.canEditSejour(sejour)) {
        this.message = {
          type: 'error',
          text: "Ce séjour ne peut pas être modifié."
        };
        setTimeout(() => {
          this.message = null;
        }, 3000);
        return;
      }
      
      this.selectedSejour = sejour;
      this.newDateSortie = sejour.date_sortie_reelle ? 
        new Date(sejour.date_sortie_reelle).toISOString().split('T')[0] : 
        new Date().toISOString().split('T')[0]; // Date d'aujourd'hui par défaut
      this.showEditModal = true;
    },
    
    async saveDateSortie() {
      if (!this.selectedSejour || !this.isValidDate) {
        console.error("Données invalides pour la modification");
        return;
      }
      
      console.log("Tentative de modification de la date de sortie pour le séjour:", this.selectedSejour.id_sejour);
      console.log("Nouvelle date:", this.newDateSortie);
      
      try {
        const response = await axios.put(
          `http://localhost:3002/modifierDateSortiePatient/${this.selectedSejour.id_sejour}`, 
          { date_sortie_reelle: this.newDateSortie }
        );
        
        console.log("Réponse du serveur:", response);
        
        // Mettre à jour le séjour dans la liste locale
        const index = this.sejours.findIndex(s => s.id_sejour === this.selectedSejour.id_sejour);
        if (index !== -1) {
          this.sejours[index].date_sortie_reelle = this.newDateSortie;
        }
        
        this.message = {
          type: 'success',
          text: `La date de sortie du patient ${this.selectedSejour.nom_patient} ${this.selectedSejour.prenom_patient} a été mise à jour avec succès.`
        };
        
        // Masquer le message après 5 secondes
        setTimeout(() => {
          this.message = null;
        }, 5000);
        
        // Fermer la modale
        this.showEditModal = false;
        
      } catch (error) {
        console.error("Erreur lors de la modification de la date de sortie:", error);
        
        let errorMessage = "Erreur lors de la modification de la date de sortie.";
        
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
    
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      }).format(date);
    },
    
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    
    canEditSejour(sejour) {
      // On peut modifier la date de sortie pour tout séjour, mais pas s'il n'a pas encore commencé
      const today = new Date();
      const dateArrivee = new Date(sejour.date_arrivee);
      return dateArrivee <= today;
    }
  }
};
</script>

<style scoped>
.modifier-date-sortie {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

/* Filtres */
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

.filter-select {
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
  min-width: 150px;
}

/* Tableau */
.sejours-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.sejours-table th, 
.sejours-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.sejours-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.centered {
  text-align: center;
}

/* Boutons */
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

.btn-edit:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

/* Messages */
.alert {
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
  background-color: #f8f8f8;
}

/* Modale */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-box {
  background-color: white;
  border-radius: 5px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.modal-header {
  padding: 15px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  padding: 15px;
}

.modal-footer {
  padding: 15px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

/* Formulaire */
.form-group {
  margin: 20px 0;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-control {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.help-text {
  font-size: 0.8rem;
  color: #666;
  margin-top: 5px;
}

.patient-info {
  background-color: #f9f9f9;
  padding: 10px;
  border-radius: 4px;
  margin-bottom: 10px;
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