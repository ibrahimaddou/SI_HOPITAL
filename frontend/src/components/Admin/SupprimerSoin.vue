<template>
  <div class="suppression-soin">
    <h2>Gestion des Soins</h2>
    
    <!-- Message d'alerte -->
    <div v-if="message" class="alert">
      {{ message.text }}
    </div>
    
    <!-- Contrôles de filtrage -->
    <div class="filter-controls">
      <input 
        type="text" 
        class="search-input" 
        placeholder="Rechercher un soin..." 
        v-model="searchQuery"
      >
      <select v-model="filterPatient" class="filter-select">
        <option value="all">Tous les patients</option>
        <option v-for="patient in uniquePatients" :key="patient.id_patient" :value="patient.id_patient">
          {{ patient.nom_patient }} {{ patient.prenom_patient }}
        </option>
      </select>
    </div>
    
    <!-- Tableau des soins -->
    <table class="soins-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Description</th>
          <th>Patient</th>
          <th>Réunion</th>
          <th>Médicaments</th>
          <th>Administrations</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr v-if="loading">
          <td colspan="7" class="centered">
            Chargement...
          </td>
        </tr>
        <tr v-else-if="filteredSoins.length === 0">
          <td colspan="7" class="centered">Aucun soin trouvé</td>
        </tr>
        <tr v-for="soin in filteredSoins" :key="soin.id_soin">
          <td>{{ soin.id_soin }}</td>
          <td>{{ truncateText(soin.description, 30) }}</td>
          <td>{{ soin.nom_patient }} {{ soin.prenom_patient }}</td>
          <td>{{ formatDate(soin.date_reunion) }}</td>
          <td>
            <ul v-if="soin.medicaments && soin.medicaments.length">
              <li v-for="(med, index) in soin.medicaments" :key="index">
                {{ med.nom_medicament }} ({{ med.quantite }})
              </li>
            </ul>
            <span v-else>Aucun médicament</span>
          </td>
          <td>{{ soin.administrations ? soin.administrations.length : 0 }}</td>
          <td>
            <button 
              class="btn-delete" 
              @click="confirmDelete(soin)"
              :disabled="!canDeleteSoin(soin)"
              title="Supprimer ce soin"
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
        <div class="modal-body" v-if="selectedSoin">
          <p>Êtes-vous sûr de vouloir supprimer le soin suivant :</p>
          <ul>
            <li><strong>Description :</strong> {{ selectedSoin.description }}</li>
            <li><strong>Patient :</strong> {{ selectedSoin.nom_patient }} {{ selectedSoin.prenom_patient }}</li>
            <li><strong>Planifié lors de la réunion du :</strong> {{ formatDate(selectedSoin.date_reunion) }}</li>
          </ul>
          <p class="warning">
            Cette action est irréversible. Un soin déjà administré ne peut pas être supprimé.
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
  name: 'SupprimerSoin',
  data() {
    return {
      soins: [],
      loading: true,
      message: null,
      selectedSoin: null,
      showConfirmModal: false,
      searchQuery: '',
      filterPatient: 'all'
    };
  },
  computed: {
    uniquePatients() {
      const patients = [];
      const patientIds = new Set();
      
      this.soins.forEach(soin => {
        if (soin.id_patient && !patientIds.has(soin.id_patient)) {
          patientIds.add(soin.id_patient);
          patients.push({
            id_patient: soin.id_patient,
            nom_patient: soin.nom_patient,
            prenom_patient: soin.prenom_patient
          });
        }
      });
      
      return patients.sort((a, b) => {
        return a.nom_patient.localeCompare(b.nom_patient) || 
               a.prenom_patient.localeCompare(b.prenom_patient);
      });
    },
    filteredSoins() {
      let result = this.soins;
      
      // Filtrage par patient
      if (this.filterPatient !== 'all') {
        result = result.filter(soin => soin.id_patient == this.filterPatient);
      }
      
      // Filtrage par recherche
      if (this.searchQuery.trim() !== '') {
        const query = this.searchQuery.toLowerCase();
        result = result.filter(soin => {
          return (
            (soin.description && soin.description.toLowerCase().includes(query)) ||
            (soin.nom_patient && soin.nom_patient.toLowerCase().includes(query)) ||
            (soin.prenom_patient && soin.prenom_patient.toLowerCase().includes(query)) ||
            (soin.id_soin && soin.id_soin.toString().includes(query))
          );
        });
      }
      
      return result;
    }
  },
  mounted() {
    console.log("Composant SupprimerSoin monté");
    this.fetchSoins();
  },
  methods: {
    async fetchSoins() {
      try {
        this.loading = true;
        console.log("Récupération des soins...");
        const response = await axios.get('http://localhost:3002/soins');
        console.log("Soins récupérés:", response.data);
        
        // Enrichir les données des soins avec plus d'informations
        const enrichedSoins = await Promise.all(
          response.data.map(async (soin) => {
            try {
              // Récupérer les détails du soin (médicaments, administrations, etc.)
              const soinDetailResponse = await axios.get(`http://localhost:3002/soins/${soin.id_soin}`);
              const soinDetail = soinDetailResponse.data;
              
              return {
                ...soin,
                ...soinDetail
              };
            } catch (error) {
              console.error(`Erreur lors de la récupération des détails du soin ${soin.id_soin}:`, error);
              return soin;
            }
          })
        );
        
        console.log("Soins enrichis:", enrichedSoins);
        this.soins = enrichedSoins;
      } catch (error) {
        console.error("Erreur lors de la récupération des soins:", error);
        this.message = {
          type: 'error',
          text: "Erreur lors du chargement des soins. Veuillez réessayer."
        };
      } finally {
        this.loading = false;
      }
    },
    
    confirmDelete(soin) {
      console.log("Soin sélectionné pour suppression:", soin);
      
      // Vérification que le soin peut être supprimé
      if (!this.canDeleteSoin(soin)) {
        this.message = {
          type: 'error',
          text: "Ce soin ne peut pas être supprimé car il a déjà été administré."
        };
        setTimeout(() => {
          this.message = null;
        }, 3000);
        return;
      }
      
      // Stocker le soin sélectionné et afficher la modale
      this.selectedSoin = soin;
      this.showConfirmModal = true;
    },
    
    executeDelete() {
      this.deleteSoin();
      this.showConfirmModal = false;
    },
    
    async deleteSoin() {
      if (!this.selectedSoin) {
        console.error("Aucun soin sélectionné pour la suppression");
        return;
      }
      
      console.log("Tentative de suppression du soin:", this.selectedSoin.id_soin);
      
      try {
        // Log avant la requête
        console.log(`Envoi de la requête DELETE à http://localhost:3002/supprimerSoin/${this.selectedSoin.id_soin}`);
        
        const response = await axios.delete(`http://localhost:3002/supprimerSoin/${this.selectedSoin.id_soin}`);
        
        // Log après la requête
        console.log("Réponse du serveur:", response);
        
        // Mettre à jour la liste des soins sans recharger
        this.soins = this.soins.filter(s => s.id_soin !== this.selectedSoin.id_soin);
        
        this.message = {
          type: 'success',
          text: `Le soin "${this.selectedSoin.description}" a été supprimé avec succès.`
        };
        
        // Masquer le message après 5 secondes
        setTimeout(() => {
          this.message = null;
        }, 5000);
        
      } catch (error) {
        console.error("Erreur lors de la suppression du soin:", error);
        
        let errorMessage = "Erreur lors de la suppression du soin.";
        
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
        this.selectedSoin = null;
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
    
    canDeleteSoin(soin) {
      // On peut supprimer uniquement les soins qui n'ont pas encore été administrés
      return !soin.administrations || soin.administrations.length === 0;
    }
  }
};
</script>

<style scoped>
.suppression-soin {
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

/* Listes dans les cellules */
.soins-table ul {
  margin: 0;
  padding-left: 20px;
}

.soins-table li {
  margin-bottom: 3px;
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