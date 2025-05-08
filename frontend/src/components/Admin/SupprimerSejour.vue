<template>
  <div class="suppression-sejour">
    <h2>Gestion des Séjours</h2>
    
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
        <option value="planned">Séjours planifiés</option>
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
          <td>{{ sejour.date_sortie_reelle ? formatDate(sejour.date_sortie_reelle) : '-' }}</td>
          <td>{{ sejour.numero_chambre }} - {{ sejour.numero_lit }}</td>
          <td>{{ truncateText(sejour.raison_sejour, 30) }}</td>
          <td>
            <button 
              class="btn-delete" 
              @click="confirmDelete(sejour)"
              :disabled="!canDeleteSejour(sejour)"
              title="Supprimer ce séjour"
            >
              Supprimer
            </button>
          </td>
        </tr>
      </tbody>
    </table>
    
    <!-- Modale personnalisée (sans Bootstrap) -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal-box">
        <div class="modal-header">
          <h3>Confirmation de suppression</h3>
          <button class="close-button" @click="showConfirmModal = false">×</button>
        </div>
        <div class="modal-body" v-if="selectedSejour">
          <p>Êtes-vous sûr de vouloir supprimer le séjour de <strong>{{ selectedSejour.nom_patient }} {{ selectedSejour.prenom_patient }}</strong> prévu le <strong>{{ formatDate(selectedSejour.date_arrivee) }}</strong> ?</p>
          <p class="warning">
            Cette action est irréversible.
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
  name: 'SupprimerSejour',
  data() {
    return {
      sejours: [],
      loading: true,
      message: null,
      selectedSejour: null,
      showConfirmModal: false,
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
        } else if (this.filterStatus === 'planned') {
          // Séjours planifiés: date d'arrivée future
          result = result.filter(sejour => {
            const dateArrivee = new Date(sejour.date_arrivee);
            return dateArrivee > today;
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
    }
  },
  mounted() {
    console.log("Composant SupprimerSejour monté");
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
    
    confirmDelete(sejour) {
      console.log("Séjour sélectionné pour suppression:", sejour);
      
      // Vérification que le séjour peut être supprimé
      if (!this.canDeleteSejour(sejour)) {
        this.message = {
          type: 'error',
          text: "Ce séjour ne peut pas être supprimé car il a déjà commencé."
        };
        setTimeout(() => {
          this.message = null;
        }, 3000);
        return;
      }
      
      // Stocker le séjour sélectionné et afficher la modale
      this.selectedSejour = sejour;
      this.showConfirmModal = true;
    },
    
    executeDelete() {
      this.deleteSejour();
      this.showConfirmModal = false;
    },
    
    async deleteSejour() {
      if (!this.selectedSejour) {
        console.error("Aucun séjour sélectionné pour la suppression");
        return;
      }
      
      console.log("Tentative de suppression du séjour:", this.selectedSejour.id_sejour);
      
      try {
        // Log avant la requête
        console.log(`Envoi de la requête DELETE à http://localhost:3002/supprimerSejour/${this.selectedSejour.id_sejour}`);
        
        const response = await axios.delete(`http://localhost:3002/supprimerSejour/${this.selectedSejour.id_sejour}`);
        
        // Log après la requête
        console.log("Réponse du serveur:", response);
        
        // Mettre à jour la liste des séjours sans recharger
        this.sejours = this.sejours.filter(s => s.id_sejour !== this.selectedSejour.id_sejour);
        
        this.message = {
          type: 'success',
          text: `Le séjour de ${this.selectedSejour.nom_patient} ${this.selectedSejour.prenom_patient} a été supprimé avec succès.`
        };
        
        // Masquer le message après 5 secondes
        setTimeout(() => {
          this.message = null;
        }, 5000);
        
      } catch (error) {
        console.error("Erreur lors de la suppression du séjour:", error);
        
        let errorMessage = "Erreur lors de la suppression du séjour.";
        
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
        this.selectedSejour = null;
      }
    },
    
    formatDate(dateString) {
      if (!dateString) return '-';
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
    
    canDeleteSejour(sejour) {
      // On peut supprimer uniquement les séjours planifiés dans le futur
      const today = new Date();
      const dateArrivee = new Date(sejour.date_arrivee);
      return dateArrivee > today;
    }
  }
};
</script>

<style scoped>
.suppression-sejour {
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