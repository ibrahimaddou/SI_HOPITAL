<template>
  <div class="admin-layout">
    <!-- Sidebar à gauche -->
    <div class="sidebar">
      <h2 class="sidebar-title">Administration</h2>
      <nav class="sidebar-nav">
        <button 
          @click="activeComponent = 'ListeMedecins'"
          class="nav-button"
          :class="{'active': activeComponent === 'ListeMedecins'}"
        >
          Liste des Médecins
        </button>
        <button 
          @click="activeComponent = 'AjouterMedecin'"
          class="nav-button"
          :class="{'active': activeComponent === 'AjouterMedecin'}"
        >
          Ajouter un Médecin
        </button>
        <button 
          @click="activeComponent = 'ListeInfirm'"
          class="nav-button"
          :class="{'active': activeComponent === 'ListeInfirm'}"
        >
          Liste des Infirmiers
        </button>
        <button 
          @click="activeComponent = 'ListPersAdmin'"
          class="nav-button"
          :class="{'active': activeComponent === 'ListPersAdmin'}"
        >
          Personnel Administratif
        </button>
        <button 
          @click="activeComponent = 'ListPersNet'"
          class="nav-button"
          :class="{'active': activeComponent === 'ListPersNet'}"
        >
          Personnel d'Entretien
        </button>
        <button 
          @click="activeComponent = 'ListePatients'"
          class="nav-button"
          :class="{'active': activeComponent === 'ListePatients'}"
        >
          Afficher Patients
        </button>
        <button 
          @click="activeComponent = 'litsDispo'"
          class="nav-button"
          :class="{'active': activeComponent === 'litsDispo'}"
        >
          Afficher lits Disponibles
        </button>
        <button 
          @click="activeComponent = 'ChambresVides'"
          class="nav-button"
          :class="{'active': activeComponent === 'ChambresVides'}"
        >
          Afficher Chambres Vides
        </button>
        <button 
          @click="activeComponent = 'ChambresNonNett'"
          class="nav-button"
          :class="{'active': activeComponent === 'ChambresNonNett'}"
        >
          Afficher Chambres Non Nettoyer
        </button>
        <button 
          @click="activeComponent = 'PatientsRetardSortie'"
          class="nav-button"
          :class="{'active': activeComponent === 'PatientsRetardSortie'}"
        >
          Afficher PatientsRetardSortie
        </button>
        <button 
          @click="activeComponent = 'EtatOccupService'"
          class="nav-button"
          :class="{'active': activeComponent === 'EtatOccupService'}"
        >
          Afficher l'état d'occupation des services
        </button>
        <button 
          @click="activeComponent = 'AjouterPersAdmin'"
          class="nav-button"
          :class="{'active': activeComponent === 'AjouterPersAdmin'}"
        >
        Ajouter Personnel Administratif
        </button>
        <button 
          @click="activeComponent = 'AjouterPersNett'"
          class="nav-button"
          :class="{'active': activeComponent === 'AjouterPersNett'}"
        >
        Ajouter Personnel nettoyage
        </button>
        <button 
          @click="activeComponent = 'AjouterInfirmier'"
          class="nav-button"
          :class="{'active': activeComponent === 'AjouterInfirmier'}"
        >
        Ajouter Infirmier
        </button>
        
      </nav>
    </div>

    <!-- Contenu  à droite -->
    <div class="main-content">
      <h1 class="page-title">Tableau de bord administrateur</h1>
      
      <!--  contenu  -->
      <div class="content-card">
        <component :is="activeComponent" @medecin-ajoute="handleMedecinAjoute"></component>
      </div>
    </div>
  </div>
</template>

<script>
import AjouterMedecin from "./Admin/AjouterMedecin.vue";
import ListeInfirm from "./Admin/ListeInfirm.vue";
import ListeMedecins from "./Admin/ListeMedecins.vue";
import ListPersAdmin from "./Admin/ListPersAdmin.vue";
import ListPersNet from "./Admin/ListPersNet.vue";
import ListePatients from "./Admin/ListePatients.vue";
import litsDispo from "./Admin/litsDispo.vue";
import ChambresVides from "./Admin/ChambresVides.vue";
import ChambresNonNett from "./Admin/ChambresNonNett.vue";
import PatientsRetardSortie from "./Admin/PatientsRetardSortie.vue";
import EtatOccupService from "./Admin/EtatOccupService.vue";
import AjouterPersAdmin from "./Admin/AjouterPersAdmin.vue";
import AjouterPersNett from "./Admin/AjouterPersNett.vue";
import AjouterInfirmier from "./Admin/AjouterInfirmier.vue";

export default {
  name: "AdminDashboard",
  components: {
    ListeMedecins,
    ListeInfirm,
    ListPersAdmin,
    ListPersNet,
    AjouterMedecin,
    ListePatients,
    litsDispo,
    ChambresVides,
    ChambresNonNett,
    PatientsRetardSortie,
    EtatOccupService,
    AjouterPersAdmin,
    AjouterPersNett,
    AjouterInfirmier,
  },
  data() {
    return {
      activeComponent: 'ListeMedecins' // Composant affiché par défaut
    }
  },
  methods: {
    handleMedecinAjoute() {
      // Après l'ajout d'un médecin, revenir à la liste des médecins
      this.activeComponent = 'ListeMedecins';
    },
  }
}
</script>

<style scoped>
.admin-layout {
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