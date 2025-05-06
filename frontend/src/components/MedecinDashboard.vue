<template>
  <div class="medecin-layout">
    <!-- Sidebar à gauche -->
    <div class="sidebar">
      <h2 class="sidebar-title">Espace Médecin</h2>
      <nav class="sidebar-nav">
        <button 
          @click="activeComponent = 'ListPatient'"
          class="nav-button"
          :class="{'active': activeComponent === 'ListPatient'}"
        >
          Liste des Patients
        </button>
        <button 
          @click="activeComponent = 'DossierPatient'"
          class="nav-button"
          :class="{'active': activeComponent === 'DossierPatient'}"
        >
          Dossiers Patients
        </button>
        <button 
          @click="activeComponent = 'MedicamentPatient'"
          class="nav-button"
          :class="{'active': activeComponent === 'MedicamentPatient'}"
        >
          Médicaments
        </button>
        <button 
          @click="activeComponent = 'ReunionSoin'"
          class="nav-button"
          :class="{'active': activeComponent === 'ReunionSoin'}"
        >
          Réunions de Soins
        </button>
        <button 
          @click="activeComponent = 'VisitesMedicales'"
          class="nav-button"
          :class="{'active': activeComponent === 'VisitesMedicales'}"
        >
        Visites Medicales
        </button>
        <button 
          @click="activeComponent = 'AjouterVisiteMedicale'"
          class="nav-button"
          :class="{'active': activeComponent === 'AjouterVisiteMedicale'}"
        >
        Ajouter Visite Medicale
        </button>
        <button 
          @click="activeComponent = 'AjouterPatient'"
          class="nav-button"
          :class="{'active': activeComponent === 'AjouterPatient'}"
        >
        Ajouter Patient
        </button>
        <button 
          @click="activeComponent = 'AjouterReunion'"
          class="nav-button"
          :class="{'active': activeComponent === 'AjouterReunion'}"
        >
        Ajouter Reunion
        </button>
        <button 
          @click="activeComponent = 'AjouterSoin'"
          class="nav-button"
          :class="{'active': activeComponent === 'AjouterSoin'}"
        >
        Ajouter Soin
        </button>
        
      </nav>
    </div>

    <!-- Contenu principal à droite -->
    <div class="main-content">
      <h1 class="page-title">Tableau de bord Médecin</h1>
      
      <!-- Zone de contenu dynamique -->
      <div class="content-card">
        <component :is="activeComponent"></component>
      </div>
    </div>
  </div>
</template>

<script>
import ListPatient from "./Medecin/ListPatient.vue";
import DossierPatient from "./Medecin/DossierPatient.vue";
import MedicamentPatient from "./Medecin/MedicamentPatient.vue";
import ReunionSoin from "./Medecin/reunionSoin.vue";
import VisitesMedicales from "./Medecin/VisitesMedicales.vue";
import AjouterVisiteMedicale from "./Medecin/AjouterVisiteMedicale.vue";
import AjouterPatient from "./Medecin/AjouterPatient.vue";
import AjouterReunion from "./Medecin/AjouterReunion.vue";
import AjouterSoin from "./Medecin/AjouterSoin.vue";

export default {
  name: "MedecinDashboard",
  components: {
    ListPatient,
    DossierPatient,
    MedicamentPatient,
    ReunionSoin,
    VisitesMedicales,
    AjouterVisiteMedicale,
    AjouterPatient,
    AjouterReunion,
    AjouterSoin,
  },
  data() {
    return {
      activeComponent: 'ListPatient' // Composant affiché par défaut
    }
  }
}
</script>

<style scoped>
.medecin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50; /* Couleur standard de Vue.js */
  color: white;
  padding: 20px;
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nav-button {
  width: 100%;
  text-align: left;
  padding: 8px 12px;
  border-radius: 4px;
  background-color: transparent;
  color: white;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.nav-button:hover {
  background-color: #34495e; /* Une teinte plus claire pour le hover */
}

.nav-button.active {
  background-color: #42b983; /* Couleur d'accent standard de Vue.js */
}

.main-content {
  flex: 1;
  padding: 20px;
  background-color: #f8f9fa;
}

.page-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  color: #2c3e50;
}

.content-card {
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style>