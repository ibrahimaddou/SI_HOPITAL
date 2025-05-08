<template>
  <div class="suppression-visite">
    <h2>Gestion des Visites Médicales</h2>
    
    <!-- Message d'alerte -->
    <div v-if="message" class="alert">
      {{ message.text }}
    </div>
    
    <!-- Contrôles de filtrage -->
    <div class="filter-controls">
      <input 
        type="text" 
        class="search-input" 
        placeholder="Rechercher une visite..." 
        v-model="searchQuery"
      >
      <select v-model="filterMedecin" class="filter-select">
        <option value="all">Tous les médecins</option>
        <option v-for="medecin in uniqueMedecins" :key="medecin.id_medecin" :value="medecin.id_medecin">
          {{ medecin.nom_medecin }} {{ medecin.prenom_medecin }}
        </option>
      </select>
      <select v-model="filterStatus" class="filter-select">
        <option value="all">Toutes les visites</option>
        <option value="future">Visites à venir</option>
        <option value="past">Visites passées</option>
      </select>
    </div>
    
    <!-- Tableau des visites médicales -->
    <table class="visites-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Date & Heure</th>
          <th>Patient</th>
          <th>Médecin</th>
          <th>Examens</th>
          <th>Commentaires</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="7" class="centered">
            Chargement...
          </td>
        </tr>
        <tr v-else-if="filteredVisites.length === 0">
          <td colspan="7" class="centered">Aucune visite médicale trouvée</td>
        </tr>
        <tr v-for="visite in filteredVisites" :key="visite.id_visite">
          <td>{{ visite.id_visite }}</td>
          <td>{{ formatDate(visite.date_visite) }}</td>
          <td>{{ visite.nom_patient }} {{ visite.prenom_patient }}</td>
          <td>{{ visite.nom_medecin }} {{ visite.prenom_medecin }}</td>
          <td>{{ truncateText(visite.examens_pratiques, 30) }}</td>
          <td>{{ truncateText(visite.commentaires, 30) }}</td>
          <td>
            <button 
              class="btn-delete" 
              @click="confirmDelete(visite)"
              :disabled="!canDeleteVisite(visite)"
              title="Supprimer cette visite"
            >
              Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Modale personnalisée -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Confirmation de suppression</h3>
          <button class="close-button" @click="showConfirmModal = false">×</button>
        </div>
        <div class="modal-body" v-if="selectedVisite">
          <p>Êtes-vous sûr de vouloir supprimer la visite médicale suivante :</p>
          <ul>
            <li><strong>Date :</strong> {{ formatDate(selectedVisite.date_visite) }}</li>
            <li><strong>Patient :</strong> {{ selectedVisite.nom_patient }} {{ selectedVisite.prenom_patient }}</li>
            <li><strong>Médecin :</strong> {{ selectedVisite.nom_medecin }} {{ selectedVisite.prenom_medecin }}</li>
          </ul>
          <p class="warning">
            Cette action est irréversible. Les visites passées ne peuvent pas être supprimées.
          </p>
        </div>
        <div class="modal-footer">
          <button class="btn-cancel" @click="showConfirmModal = false">Annuler</button>
          <button class="btn-confirm" @click="executeDelete">Supprimer</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SupprimerVisiteMedicale',
  data() {
    return {
      visites: [],
      loading: true,
      message: null,
      selectedVisite: null,
      showConfirmModal: false,
      searchQuery: '',
      filterMedecin: 'all',
      filterStatus: 'all'
    };
  },
  computed: {
    uniqueMedecins() {
      const medecins = [];
      const medecinIds = new Set();
      
      this.visites.forEach(visite => {
        if (visite.id_medecin && !medecinIds.has(visite.id_medecin)) {
          medecinIds.add(visite.id_medecin);
          medecins.push({
            id_medecin: visite.id_medecin,
            nom_medecin: visite.nom_medecin,
            prenom_medecin: visite.prenom_medecin
          });
        }
      });
      
      return medecins.sort((a, b) => {
        return a.nom_medecin.localeCompare(b.nom_medecin) || 
               a.prenom_medecin.localeCompare(b.prenom_medecin);
      });
    },
    filteredVisites() {
      let result = this.visites;
      
      // Filtrage par médecin
      if (this.filterMedecin !== 'all') {
        result = result.filter(visite => visite.id_medecin == this.filterMedecin);
      }
      
      // Filtrage par statut (passé/futur)
      if (this.filterStatus !== 'all') {
        const now = new Date();
        
        if (this.filterStatus === 'future') {
          result = result.filter(visite => {
            const dateVisite = new Date(visite.date_visite);
            return dateVisite > now;
          });
        } else if (this.filterStatus === 'past') {
          result = result.filter(visite => {
            const dateVisite = new Date(visite.date_visite);
            return dateVisite <= now;
          });
        }
      }
      
      // Filtrage par recherche
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(visite => {
          return (
            (visite.nom_patient && visite.nom_patient.toLowerCase().includes(query)) ||
            (visite.prenom_patient && visite.prenom_patient.toLowerCase().includes(query)) ||
            (visite.nom_medecin && visite.nom_medecin.toLowerCase().includes(query)) ||
            (visite.prenom_medecin && visite.prenom_medecin.toLowerCase().includes(query)) ||
            (visite.examens_pratiques && visite.examens_pratiques.toLowerCase().includes(query)) ||
            (visite.commentaires && visite.commentaires.toLowerCase().includes(query)) ||
            (visite.id_visite && visite.id_visite.toString().includes(query))
          );
        });
      }
      
      return result;
    }
  },
  mounted() {
    console.log("Composant SupprimerVisiteMedicale monté");
    this.fetchVisites();
  },
  methods: {
    async fetchVisites() {
      try {
        this.loading = true;
        console.log("Récupération des visites médicales...");
        const response = await axios.get('http://localhost:3002/afficherVisitesMedicales');
        console.log("Visites médicales récupérées:", response.data);
        
        this.visites = response.data;
      } catch (error) {
        console.error("Erreur lors de la récupération des visites médicales:", error);
        this.message = {
          type: 'error',
          text: "Erreur lors du chargement des visites médicales. Veuillez réessayer."
        };
      } finally {
        this.loading = false;
      }
    },
    
    confirmDelete(visite) {
      console.log("Visite sélectionnée pour suppression:", visite);
      
      // Vérification que la visite peut être supprimée
      if (!this.canDeleteVisite(visite)) {
        this.message = {
          type: 'error',
          text: "Cette visite ne peut pas être supprimée car elle a déjà eu lieu."
        };
        setTimeout(() => {
          this.message = null;
        }, 3000);
        return;
      }
      
      // Stocker la visite sélectionnée et afficher la modale
      this.selectedVisite = visite;
      this.showConfirmModal = true;
    },
    
    executeDelete() {
      this.deleteVisite();
      this.showConfirmModal = false;
    },
    
    async deleteVisite() {
      if (!this.selectedVisite) {
        console.error("Aucune visite sélectionnée pour la suppression");
        return;
      }
      
      console.log("Tentative de suppression de la visite:", this.selectedVisite.id_visite);
      
      try {
        // Log avant la requête
        console.log(`Envoi de la requête DELETE à http://localhost:3002/supprimerVisiteMedicale/${this.selectedVisite.id_visite}`);
        
        const response = await axios.delete(`http://localhost:3002/supprimerVisiteMedicale/${this.selectedVisite.id_visite}`);
        
        // Log après la requête
        console.log("Réponse du serveur:", response);
        
        // Mettre à jour la liste des visites sans recharger
        this.visites = this.visites.filter(v => v.id_visite !== this.selectedVisite.id_visite);
        
        this.message = {
          type: 'success',
          text: `La visite médicale du ${this.formatDate(this.selectedVisite.date_visite)} a été supprimée avec succès.`
        };
        
        // Masquer le message après 5 secondes
        setTimeout(() => {
          this.message = null;
        }, 5000);
        
      } catch (error) {
        console.error("Erreur lors de la suppression de la visite médicale:", error);
        
        let errorMessage = "Erreur lors de la suppression de la visite médicale.";
        
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
        this.selectedVisite = null;
      }
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
    
    truncateText(text, maxLength) {
      if (!text) return '';
      return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    },
    
    canDeleteVisite(visite) {
      // On peut supprimer uniquement les visites planifiées dans le futur
      const dateVisite = new Date(visite.date_visite);
      const now = new Date();
      return dateVisite > now;
    }
  }
};
</script>

<style scoped>
.suppression-visite {
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
.visites-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.visites-table th, 
.visites-table td {
  padding: 10px;
  border: 1px solid #ddd;
  text-align: left;
}

.visites-table th {
  background-color: #f2f2f2;
  font-weight: bold;
}

.centered {
  text-align: center;
}

/* Boutons */
.btn-delete {
  background-color: #ccc;
  border: none;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-delete:hover {
  background-color: #999;
}

.btn-delete:disabled {
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

.warning {
  margin-top: 10px;
  font-style: italic;
}

/* Modale personnalisée */
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

.btn-cancel {
  background-color: #ccc;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-confirm {
  background-color: #ddd;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel:hover, .btn-confirm:hover {
  background-color: #bbb;
}
</style>