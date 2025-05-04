<template>
  <div class="infirmier-layout">
    <!-- Sidebar à gauche -->
    <div class="sidebar">
      <h2 class="sidebar-title">Espace Infirmier</h2>
      <nav class="sidebar-nav">
        <button 
          @click="activeComponent = 'ListPatient'"
          class="nav-button"
          :class="{'active': activeComponent === 'ListPatient'}"
        >
          Liste des Patients
        </button>
        <button 
          @click="activeComponent = 'AfficherSoinsAEffectuer'"
          class="nav-button"
          :class="{'active': activeComponent === 'AfficherSoinsAEffectuer'}"
        >
        Afficher Soins AEffectuer
        </button>
        <button 
          @click="activeComponent = 'AfficherAdminSoin'"
          class="nav-button"
          :class="{'active': activeComponent === 'AfficherAdminSoin'}"
        >
        Afficher Administration Soin
          </button>
          <button 
          @click="activeComponent = 'afficherSoinsPatient'"
          class="nav-button"
          :class="{'active': activeComponent === 'afficherSoinsPatient'}"
        >
        Afficher Soins Patient
          </button>
          <button 
          @click="activeComponent = 'AjouterAdminSoin'"
          class="nav-button"
          :class="{'active': activeComponent === 'AjouterAdminSoin'}"
        >
        Ajouter Administration Soin
        </button>
        <button 
          @click="activeComponent = 'AfficherMedecaments'"
          class="nav-button"
          :class="{'active': activeComponent === 'AfficherMedecaments'}"
        >
        Afficher Medecaments
        </button>
        
      </nav>
    </div>

    <div class="main-content">
      <h1 class="page-title">Tableau de bord Infirmier</h1>
      
      <div class="content-card">
        <component :is="activeComponent"></component>
      </div>
    </div>
  </div>
</template>

<script>
import ListPatient from "./Medecin/ListPatient.vue";
import AfficherSoinsAEffectuer from "./Infirmier/AfficherSoinsAEffectuer.vue";
import AfficherAdminSoin from "./Infirmier/AfficherAdminSoin.vue";
import afficherSoinsPatient from "./Infirmier/afficherSoinsPatient.vue";
import AjouterAdminSoin from "./Infirmier/AjouterAdminSoin.vue";
import AfficherMedecaments from "./Infirmier/AfficherMedecaments.vue";

export default {
  name: "InfirmierDashboard",
  components: {
    ListPatient,
    AfficherSoinsAEffectuer,
    AfficherAdminSoin,
    afficherSoinsPatient,
    AjouterAdminSoin,
    AfficherMedecaments,

    
  },
  data() {
    return {
      activeComponent: 'ListPatient' // Composant affiché par défaut
    }
  }
}
</script>

<style scoped>
.infirmier-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 250px;
  background-color: #2c3e50; 
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
  background-color: #34495e; 
}

.nav-button.active {
  background-color: #42b983;
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