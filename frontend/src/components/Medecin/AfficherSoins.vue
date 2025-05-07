<template>
    <div class="afficher-soins">
      <h2>Liste des soins</h2>
      
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
        <select v-model="filterStatus" class="filter-select">
          <option value="all">Tous les soins</option>
          <option value="pending">En attente</option>
          <option value="completed">Administrés</option>
        </select>
      </div>
      
      <div class="soins-container">
        <!-- Affichage quand aucun soin n'est sélectionné -->
        <div class="soins-list">
          <!-- Indicateur de chargement -->
          <div v-if="loading" class="loading-indicator">
            Chargement des soins...
          </div>
          
          <!-- Message si aucun soin trouvé -->
          <div v-else-if="filteredSoins.length === 0" class="no-results">
            Aucun soin ne correspond aux critères de recherche.
          </div>
          
          <!-- Liste des soins -->
          <div v-else class="soin-cards">
            <div 
              v-for="soin in filteredSoins" 
              :key="soin.id_soin" 
              class="soin-card"
              :class="{'soin-selected': selectedSoin && selectedSoin.id_soin === soin.id_soin}"
              @click="selectSoin(soin)"
            >
              <div class="soin-card-header">
                <h3>Soin #{{ soin.id_soin }}</h3>
                <span 
                  class="soin-status" 
                  :class="soin.administrations && soin.administrations.length > 0 ? 'status-completed' : 'status-pending'"
                >
                  {{ soin.administrations && soin.administrations.length > 0 ? 'Administré' : 'En attente' }}
                </span>
              </div>
              <div class="soin-card-content">
                <p class="soin-description">{{ truncateText(soin.description, 150) }}</p>
                <div class="soin-info">
                  <p><strong>Patient:</strong> {{ soin.nom_patient }} {{ soin.prenom_patient }}</p>
                  <p><strong>Réunion:</strong> {{ formatDate(soin.date_reunion) }}</p>
                  <p v-if="soin.medicaments && soin.medicaments.length > 0">
                    <strong>Médicaments:</strong> {{ soin.medicaments.length }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Détails du soin sélectionné -->
        <div v-if="selectedSoin" class="soin-details">
          <div class="details-header">
            <h3>Détails du soin #{{ selectedSoin.id_soin }}</h3>
            <button class="btn-close" @click="deselectSoin">×</button>
          </div>
          
          <div class="details-content">
            <div class="detail-section">
              <h4>Informations générales</h4>
              <p><strong>Patient:</strong> {{ selectedSoin.nom_patient }} {{ selectedSoin.prenom_patient }}</p>
              <p><strong>Décidé lors de la réunion du:</strong> {{ formatDate(selectedSoin.date_reunion) }}</p>
              <p><strong>Sujet de la réunion:</strong> {{ selectedSoin.sujet_reunion }}</p>
            </div>
            
            <div class="detail-section">
              <h4>Description du soin</h4>
              <p class="full-description">{{ selectedSoin.description }}</p>
            </div>
            
            <div class="detail-section" v-if="selectedSoin.medicaments && selectedSoin.medicaments.length > 0">
              <h4>Médicaments prescrits</h4>
              <ul class="medicaments-list">
                <li v-for="(med, index) in selectedSoin.medicaments" :key="index">
                  <strong>{{ med.nom_medicament }}</strong> ({{ med.dosage }})
                  <span class="prescription">{{ med.quantite }}</span>
                </li>
              </ul>
            </div>
            
            <div class="detail-section" v-if="selectedSoin.administrations && selectedSoin.administrations.length > 0">
              <h4>Administrations</h4>
              <ul class="administrations-list">
                <li v-for="(admin, index) in selectedSoin.administrations" :key="index">
                  <div class="administration-item">
                    <div class="admin-date">{{ formatDate(admin.date_heure) }}</div>
                    <div class="admin-info">
                      <strong>{{ admin.prenom_infirmier }} {{ admin.nom_infirmier }}</strong>
                      <p v-if="admin.commentaires">{{ admin.commentaires }}</p>
                    </div>
                  </div>
                </li>
              </ul>
            </div>
            
            <div class="detail-section" v-if="!selectedSoin.administrations || selectedSoin.administrations.length === 0">
              <h4>Statut</h4>
              <p>Ce soin n'a pas encore été administré.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from 'axios';
  
  export default {
    name: 'AfficherSoins',
    data() {
      return {
        soins: [],
        loading: true,
        selectedSoin: null,
        message: null,
        searchQuery: '',
        filterPatient: 'all',
        filterStatus: 'all'
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
        
        // Filtrage par statut
        if (this.filterStatus !== 'all') {
          if (this.filterStatus === 'pending') {
            result = result.filter(soin => !soin.administrations || soin.administrations.length === 0);
          } else if (this.filterStatus === 'completed') {
            result = result.filter(soin => soin.administrations && soin.administrations.length > 0);
          }
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
      console.log("Composant AfficherSoins monté");
      this.fetchSoins();
    },
    methods: {
      async fetchSoins() {
        try {
          this.loading = true;
          console.log("Récupération des soins...");
          
          // Récupérer la liste des soins
          const response = await axios.get('http://localhost:3002/soins');
          
          // Enrichir chaque soin avec ses détails
          const enrichedSoins = await Promise.all(
            response.data.map(async (soin) => {
              try {
                // Récupérer les détails du soin
                const soinDetailResponse = await axios.get(`http://localhost:3002/soins/${soin.id_soin}`);
                
                return {
                  ...soin,
                  ...soinDetailResponse.data
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
          console.error("Erreur lors de la récupération des soins:", error);
          this.message = {
            type: 'error',
            text: "Erreur lors du chargement des soins. Veuillez réessayer."
          };
        } finally {
          this.loading = false;
        }
      },
      
      selectSoin(soin) {
        this.selectedSoin = soin;
        console.log("Soin sélectionné:", this.selectedSoin);
      },
      
      deselectSoin() {
        this.selectedSoin = null;
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
      }
    }
  };
  </script>
  
  <style scoped>
  .afficher-soins {
    max-width: 1200px;
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
  
  /* Container principal */
  .soins-container {
    display: flex;
    gap: 20px;
  }
  
  .soins-list {
    flex: 1;
    min-width: 0; /* Pour permettre le flex-shrink */
  }
  
  .soin-details {
    flex: 1;
    background-color: #f9f9f9;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 20px;
    max-width: 500px;
  }
  
  /* Indicateur de chargement */
  .loading-indicator {
    text-align: center;
    padding: 20px;
    color: #666;
  }
  
  .no-results {
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
  }
  
  /* Cartes de soins */
  .soin-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 15px;
  }
  
  .soin-card {
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
    cursor: pointer;
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .soin-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .soin-selected {
    border: 2px solid #333;
  }
  
  .soin-card-header {
    padding: 10px 15px;
    background-color: #f2f2f2;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  
  .soin-card-header h3 {
    margin: 0;
    font-size: 16px;
  }
  
  .soin-status {
    font-size: 12px;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: bold;
  }
  
  .status-pending {
    background-color: #f0f0f0;
    color: #666;
  }
  
  .status-completed {
    background-color: #e6e6e6;
    color: #333;
  }
  
  .soin-card-content {
    padding: 15px;
  }
  
  .soin-description {
    margin-top: 0;
    margin-bottom: 15px;
    line-height: 1.4;
  }
  
  .soin-info p {
    margin: 5px 0;
    font-size: 14px;
  }
  
  /* Détails du soin */
  .details-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  .details-header h3 {
    margin: 0;
  }
  
  .btn-close {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }
  
  .detail-section {
    margin-bottom: 20px;
  }
  
  .detail-section h4 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 16px;
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
  }
  
  .full-description {
    line-height: 1.5;
    white-space: pre-wrap;
  }
  
  .medicaments-list, .administrations-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
  
  .medicaments-list li {
    margin-bottom: 8px;
    padding: 8px;
    background-color: #f0f0f0;
    border-radius: 4px;
  }
  
  .prescription {
    display: block;
    margin-top: 5px;
    font-style: italic;
    color: #666;
  }
  
  .administration-item {
    display: flex;
    margin-bottom: 10px;
    padding: 10px;
    background-color: #f0f0f0;
    border-radius: 4px;
  }
  
  .admin-date {
    min-width: 150px;
    font-weight: bold;
  }
  
  .admin-info p {
    margin: 5px 0 0 0;
  }
  
  @media (max-width: 900px) {
    .soins-container {
      flex-direction: column;
    }
    
    .soin-details {
      max-width: none;
    }
  }
  </style>