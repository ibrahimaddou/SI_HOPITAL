<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Visites médicales par médecin</h2>
      
      <div class="bg-white p-4 mb-4 rounded shadow">
        <div class="mb-3">
          <label class="block mb-1">Sélectionner un médecin</label>
          <select 
            v-model="idMedecinSelectionne" 
            class="w-full p-2 border rounded"
          >
            <option value="">Sélectionnez un médecin</option>
            <option v-for="(medecin, index) in medecins" :key="index" :value="index">
              {{ medecin.nom }} {{ medecin.prenom }} ({{ medecin.specialite }})
            </option>
          </select>
        </div>
        
        <button 
          @click="chargerVisitesMedecin" 
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          :disabled="idMedecinSelectionne === ''"
        >
          {{ idMedecinSelectionne !== '' ? 'Charger les visites' : 'Sélectionnez un médecin' }}
        </button>
      </div>
      
   
      <div v-if="chargement" class="text-center py-4">
        Chargement en cours...
      </div>
      
      <div v-if="erreur" class="erreur">{{ erreur }}</div>
      
      <div v-if="!chargement && !erreur && visitesCherchees && visites.length === 0" class="bg-yellow-100 border border-yellow-500 text-yellow-700 p-4 rounded mb-4">
        Aucune visite médicale trouvée pour ce médecin.
      </div>
      
      <!-- Tableau des visites -->
      <div v-if="!chargement && !erreur && visites.length > 0" class="bg-white rounded shadow overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patient
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Examens
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="visite in visites" :key="visite.id_visite" class="hover:bg-gray-50 cursor-pointer">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ visite.id_visite }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatDate(visite.date_visite) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ visite.nom_patient }} {{ visite.prenom_patient }}
              </td>
              <td class="px-6 py-4">
                <div class="truncate max-w-xs">
                  {{ visite.examens_pratiques || 'Aucun examen spécifié' }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button 
                  @click="voirDetails(visite)" 
                  class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Détails
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      
      <div v-if="visiteSelectionnee" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-lg shadow-lg w-full max-w-2xl max-h-full overflow-y-auto">
          <div class="p-6">
            <div class="flex justify-between items-center mb-4">
              <h3 class="text-lg font-bold">Détails de la visite médicale</h3>
              <button @click="visiteSelectionnee = null" class="text-gray-500 hover:text-gray-700">
                <span class="text-2xl">&times;</span>
              </button>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <h4 class="font-semibold mb-2">Informations générales</h4>
                <p><span class="font-medium">Date:</span> {{ formatDate(visiteSelectionnee.date_visite) }}</p>
                <p><span class="font-medium">Patient:</span> {{ visiteSelectionnee.nom_patient }} {{ visiteSelectionnee.prenom_patient }}</p>
              </div>
              
              <div>
                <h4 class="font-semibold mb-2">Examens pratiqués</h4>
                <p class="whitespace-pre-line">{{ visiteSelectionnee.examens_pratiques || 'Aucun examen spécifié' }}</p>
              </div>
            </div>
            
            <div class="mb-4">
              <h4 class="font-semibold mb-2">Commentaires et observations</h4>
              <div class="p-3 bg-gray-50 rounded whitespace-pre-line">
                {{ visiteSelectionnee.commentaires }}
              </div>
            </div>
            
            <div class="flex justify-end gap-2">
              <button 
                @click="visiteSelectionnee = null" 
                class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        medecins: [],
        visites: [],
        idMedecinSelectionne: "",
        visiteSelectionnee: null,
        
        chargement: false,
        erreur: null,
        visitesCherchees: false
      };
    },
    mounted() {
      this.chargerMedecins();
    },
    methods: {
      chargerMedecins() {
        this.chargement = true;
        this.erreur = null;
        
        console.log("Chargement des médecins...");
        
        axios.get("http://localhost:3002/medecins")
          .then(response => {
            console.log("Réponse médecins reçue:", response.data);
            
            if (response.data && Array.isArray(response.data)) {
              this.medecins = response.data;
              console.log(`${this.medecins.length} médecins trouvés`);
              
              // Chercher quel est le nom de la propriété d'ID si elle existe
              if (this.medecins.length > 0) {
                const keys = Object.keys(this.medecins[0]);
                console.log("Propriétés disponibles:", keys);
                
                const possibleIdProps = keys.filter(k => 
                  k.toLowerCase().includes('id') || 
                  k.toLowerCase().includes('_id') || 
                  k.toLowerCase() === 'id'
                );
                
                if (possibleIdProps.length > 0) {
                  console.log("Propriétés pouvant contenir l'ID:", possibleIdProps);
                }
              }
            } else if (response.data && response.data.medecins && Array.isArray(response.data.medecins)) {
              this.medecins = response.data.medecins;
              console.log(`${this.medecins.length} médecins trouvés (format alternatif)`);
            } else {
              this.erreur = "Format de réponse incorrect pour les médecins";
              console.error("Format incorrect pour les médecins:", response.data);
            }
          })
          .catch(error => {
            this.erreur = "Erreur lors du chargement des médecins: " + error.message;
            console.error("Erreur lors du chargement des médecins:", error);
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      
      chargerVisitesMedecin() {
        if (this.idMedecinSelectionne === "") {
          this.erreur = "Veuillez sélectionner un médecin";
          return;
        }
        
        // récupérer le médecin sélectionné par son id
        const medecinSelectionne = this.medecins[this.idMedecinSelectionne];
        console.log("Médecin sélectionné:", medecinSelectionne);
        
        let idMedecin = null;
        
        // Chercher id
        const possibleIdProps = Object.keys(medecinSelectionne).filter(k => 
          k.toLowerCase().includes('id') || 
          k.toLowerCase().includes('_id') || 
          k.toLowerCase() === 'id'
        );
        
        if (possibleIdProps.length > 0) {
          idMedecin = medecinSelectionne[possibleIdProps[0]];
          console.log(`ID médecin trouvé via propriété ${possibleIdProps[0]}: ${idMedecin}`);
        }
        
        // utilisation  du nom et prénom 
        if (!idMedecin) {
          console.log("Aucun ID trouvé, utilisation du nom comme identifiant");
          idMedecin = `${medecinSelectionne.nom} ${medecinSelectionne.prenom}`;
        }
        
        console.log("Chargement des visites pour le médecin:", idMedecin);
        
        this.chargement = true;
        this.erreur = null;
        this.visites = [];
        
        const url = `http://localhost:3002/visitesMedecin/${idMedecin}`;
        console.log("URL appelée:", url);
        
        axios.get(url)
          .then(response => {
            console.log("Réponse reçue:", response.data);
            
            if (response.data && Array.isArray(response.data)) {
              this.visites = response.data;
              console.log(`${this.visites.length} visites trouvées`);
            } else if (response.data && response.data.visites && Array.isArray(response.data.visites)) {
              this.visites = response.data.visites;
              console.log(`${this.visites.length} visites trouvées (format alternatif)`);
            } else if (response.data && typeof response.data === 'object' && !Array.isArray(response.data)) {
              this.visites = [response.data];
              console.log("Une seule visite trouvée (format objet)");
            } else {
              this.erreur = "Format de réponse incorrect pour les visites";
              console.error("Format incorrect:", response.data);
            }
            this.visitesCherchees = true;
          })
          .catch(error => {
            this.erreur = "Erreur lors du chargement des visites: " + error.message;
            console.error("Erreur complète:", error);
            if (error.response) {
              console.error("Détails de l'erreur:", {
                status: error.response.status,
                statusText: error.response.statusText,
                data: error.response.data
              });
            }
            this.visitesCherchees = true;
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      
      formatDate(dateString) {
        if (!dateString) return "Date non spécifiée";
        
        const options = { 
          day: '2-digit', 
          month: '2-digit', 
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        };
        
        return new Date(dateString).toLocaleDateString('fr-FR', options).replace(',', ' à');
      },
      
      voirDetails(visite) {
        this.visiteSelectionnee = visite;
      }
    }
  };
  </script>
  
  <style scoped>
  .erreur {
    color: red;
    margin: 10px 0;
  }
  
  button {
    cursor: pointer;
  }
  
  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  input:focus, select:focus, textarea:focus {
    outline: none;
    border-color: #4f46e5;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  thead {
    background-color: #f4f4f4;
  }
  </style>