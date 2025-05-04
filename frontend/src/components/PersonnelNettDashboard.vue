<template>
    <div class="nettoyage-layout">
      <!-- Sidebar à gauche -->
      <div class="sidebar">
        <h2 class="sidebar-title">Espace Personnel Nettoyage</h2>
        <nav class="sidebar-nav">
          <button 
            @click="activeComponent = 'AfficherCahmbresANett'"
            class="nav-button"
            :class="{'active': activeComponent === 'AfficherCahmbresANett'}"
          >
          Afficher Cahmbres A Nettoyer
          </button>
          <button 
            @click="activeComponent = 'EnregistrerNettoyage'"
            class="nav-button"
            :class="{'active': activeComponent === 'EnregistrerNettoyage'}"
          >
          Enregistrer Nettoyage
          </button>
          
        </nav>
      </div>
  
      <div class="main-content">
        <h1 class="page-title">Tableau de bord Personnel Nettoyage</h1>
        
        <div class="content-card">
          <component :is="activeComponent"></component>
        </div>
      </div>
    </div>
  </template>
  
  <script>
 import AfficherCahmbresANett from './Personnel Nettoyage/AfficherCahmbresANett.vue';
 import EnregistrerNettoyage from './Personnel Nettoyage/EnregistrerNettoyage.vue';
   
  export default {
    name: "NettoyageDashboard",
    components: {
        AfficherCahmbresANett,
        EnregistrerNettoyage,
    },
    data() {
      return {
        activeComponent: 'AfficherCahmbresANett'
      }
    }
  }
  </script>
  
  <style scoped>
  .nettoyage-layout {
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