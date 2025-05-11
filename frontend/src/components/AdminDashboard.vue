<template>
  <div class="admin-layout">
    <!-- Sidebar à gauche -->
    <div class="sidebar">
      <h2 class="sidebar-title">Administration</h2>
      <nav class="sidebar-nav">
        <!-- Catégorie Gestion des Médecins -->
        <div class="nav-category">
          <div 
            class="category-header" 
            @click="toggleCategory('medecins')"
            :class="{'active': openCategories.medecins}"
          >
            <span>Gestion des Médecins</span>
            <span class="icon">{{ openCategories.medecins ? '▼' : '►' }}</span>
          </div>
          <div class="category-content" v-show="openCategories.medecins">
            <button 
              @click="activeComponent = 'ListeMedecins'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'ListeMedecins'}"
            >
              Liste des Médecins
            </button>
            <button 
              @click="activeComponent = 'AjouterMedecin'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'AjouterMedecin'}"
            >
              Ajouter un Médecin
            </button>
          </div>
        </div>

        <!-- Catégorie Gestion des Infirmiers -->
        <div class="nav-category">
          <div 
            class="category-header" 
            @click="toggleCategory('infirmiers')"
            :class="{'active': openCategories.infirmiers}"
          >
            <span>Gestion des Infirmiers</span>
            <span class="icon">{{ openCategories.infirmiers ? '▼' : '►' }}</span>
          </div>
          <div class="category-content" v-show="openCategories.infirmiers">
            <button 
              @click="activeComponent = 'ListeInfirm'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'ListeInfirm'}"
            >
              Liste des Infirmiers
            </button>
            <button 
              @click="activeComponent = 'AjouterInfirmier'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'AjouterInfirmier'}"
            >
              Ajouter un Infirmier
            </button>
          </div>
        </div>

        <!-- Catégorie Personnel Administratif -->
        <div class="nav-category">
          <div 
            class="category-header" 
            @click="toggleCategory('admin')"
            :class="{'active': openCategories.admin}"
          >
            <span>Personnel Administratif</span>
            <span class="icon">{{ openCategories.admin ? '▼' : '►' }}</span>
          </div>
          <div class="category-content" v-show="openCategories.admin">
            <button 
              @click="activeComponent = 'ListPersAdmin'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'ListPersAdmin'}"
            >
              Liste du Personnel
            </button>
            <button 
              @click="activeComponent = 'AjouterPersAdmin'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'AjouterPersAdmin'}"
            >
              Ajouter du Personnel
            </button>
          </div>
        </div>

        <!-- Catégorie Personnel d'Entretien -->
        <div class="nav-category">
          <div 
            class="category-header" 
            @click="toggleCategory('nettoyage')"
            :class="{'active': openCategories.nettoyage}"
          >
            <span>Personnel d'Entretien</span>
            <span class="icon">{{ openCategories.nettoyage ? '▼' : '►' }}</span>
          </div>
          <div class="category-content" v-show="openCategories.nettoyage">
            <button 
              @click="activeComponent = 'ListPersNet'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'ListPersNet'}"
            >
              Liste du Personnel
            </button>
            <button 
              @click="activeComponent = 'AjouterPersNett'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'AjouterPersNett'}"
            >
              Ajouter du Personnel
            </button>
          </div>
        </div>

        <!-- Catégorie Gestion des Patients -->
        <div class="nav-category">
          <div 
            class="category-header" 
            @click="toggleCategory('patients')"
            :class="{'active': openCategories.patients}"
          >
            <span>Gestion des Patients</span>
            <span class="icon">{{ openCategories.patients ? '▼' : '►' }}</span>
          </div>
          <div class="category-content" v-show="openCategories.patients">
            <button 
              @click="activeComponent = 'ListePatients'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'ListePatients'}"
            >
              Liste des Patients
            </button>
            <button 
              @click="activeComponent = 'PatientsRetardSortie'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'PatientsRetardSortie'}"
            >
              Patients en Retard de Sortie
            </button>
            <button 
              @click="activeComponent = 'ModifierDateSortiePatient'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'ModifierDateSortiePatient'}"
            >
              Modifier Date de Sortie
            </button>
            <button 
              @click="activeComponent = 'SupprimerPatient'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'SupprimerPatient'}"
            >
              Supprimer Patient
            </button>
          </div>
        </div>

        <!-- Catégorie Organisation -->
        <div class="nav-category">
          <div 
            class="category-header" 
            @click="toggleCategory('organisation')"
            :class="{'active': openCategories.organisation}"
          >
            <span>Organisation</span>
            <span class="icon">{{ openCategories.organisation ? '▼' : '►' }}</span>
          </div>
          <div class="category-content" v-show="openCategories.organisation">
            <button 
              @click="activeComponent = 'litsDispo'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'litsDispo'}"
            >
              Lits Disponibles
            </button>
            <button 
              @click="activeComponent = 'ChambresVides'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'ChambresVides'}"
            >
              Chambres Vides
            </button>
            <button 
              @click="activeComponent = 'ChambresNonNett'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'ChambresNonNett'}"
            >
              Chambres Non Nettoyées
            </button>
            <button 
              @click="activeComponent = 'AfficherServices'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'AfficherServices'}"
            >
              Liste des Services
            </button>
            <button 
              @click="activeComponent = 'EtatOccupService'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'EtatOccupService'}"
            >
              Occupation des Services
            </button>
          </div>
        </div>

        <!-- Catégorie Gestion des Séjours -->
        <div class="nav-category">
          <div 
            class="category-header" 
            @click="toggleCategory('sejours')"
            :class="{'active': openCategories.sejours}"
          >
            <span>Gestion des Séjours</span>
            <span class="icon">{{ openCategories.sejours ? '▼' : '►' }}</span>
          </div>
          <div class="category-content" v-show="openCategories.sejours">
            <button 
              @click="activeComponent = 'AjouterSejour'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'AjouterSejour'}"
            >
              Ajouter Séjour
            </button>
            <button 
              @click="activeComponent = 'SupprimerSejour'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'SupprimerSejour'}"
            >
              Gestion Séjour
            </button>
            <button 
              @click="activeComponent = 'SupprimerSoin'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'SupprimerSoin'}"
            >
              Supprimer Soin
            </button>
            <button 
              @click="activeComponent = 'SupprimerVisiteMed'"
              class="nav-button sub-item"
              :class="{'active': activeComponent === 'SupprimerVisiteMed'}"
            >
              Supprimer Visite Médicale
            </button>
          </div>
        </div>
      </nav>
    </div>

    <!-- Contenu à droite -->
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
import AjouterSejour from "./Admin/AjouterSejour.vue";
import AfficherServices from "./Admin/AfficherServices.vue";
import SupprimerPatient from "./Admin/SupprimerPatient.vue";
import SupprimerSejour from "./Admin/SupprimerSejour.vue";
import SupprimerSoin from "./Admin/SupprimerSoin.vue";
import SupprimerVisiteMed from "./Admin/SupprimerVisiteMed.vue";
import ModifierDateSortiePatient from "./Admin/ModifierDateSortiePatient.vue";

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
    AjouterSejour,
    AfficherServices,
    SupprimerPatient,
    SupprimerSejour,
    SupprimerSoin,
    SupprimerVisiteMed,
    ModifierDateSortiePatient,
  },
  data() {
    return {
      activeComponent: 'ListeMedecins', // Composant affiché par défaut
      openCategories: {
        medecins: true,  // Catégorie ouverte par défaut
        infirmiers: false,
        admin: false,
        nettoyage: false,
        patients: false,
        organisation: false,
        sejours: false
      }
    }
  },
  methods: {
    handleMedecinAjoute() {
      // Après l'ajout d'un médecin, revenir à la liste des médecins
      this.activeComponent = 'ListeMedecins';
    },
    toggleCategory(category) {
      // Toggle la visibilité de la catégorie
      this.openCategories[category] = !this.openCategories[category];
    }
  }
}
</script>

<style scoped>
.admin-layout {
  display: flex;
  min-height: 100vh;
}

.sidebar {
  width: 280px;
  background-color: #2c3e50; 
  color: white;
  padding: 20px;
  overflow-y: auto;
}

.sidebar-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
}

.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-category {
  margin-bottom: 4px;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 12px;
  background-color: #34495e;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.3s;
  font-weight: bold;
}

.category-header:hover {
  background-color: #3d5366;
}

.category-header.active {
  background-color: #2980b9;
}

.category-content {
  padding-left: 10px;
  margin-top: 2px;
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

.nav-button.sub-item {
  padding-left: 20px;
  font-size: 0.95rem;
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

.icon {
  font-size: 0.8rem;
}
</style>