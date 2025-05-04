<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Chambres à nettoyer en priorité</h2>
      <button @click="chargerChambres" class="mb-4">Charger les chambres</button>
  
      <div v-if="chargement">Chargement en cours...</div>
  
      <div v-if="erreur" class="erreur">{{ erreur }}</div>
  
      <!-- Filtres -->
      <div v-if="!chargement && !erreur && chambres.length > 0" class="mb-4">
        <div class="flex flex-wrap gap-4">
          <div class="w-64">
            <label for="filtreEtage" class="block text-sm font-medium text-gray-700 mb-1">Filtrer par étage</label>
            <select id="filtreEtage" v-model="filtreEtage" class="w-full p-2 border rounded">
              <option value="">Tous les étages</option>
              <option value="1">1er étage</option>
              <option value="2">2ème étage</option>
              <option value="3">3ème étage</option>
            </select>
          </div>
          <div class="w-64">
            <label for="filtrePriorite" class="block text-sm font-medium text-gray-700 mb-1">Filtrer par priorité</label>
            <select id="filtrePriorite" v-model="filtrePriorite" class="w-full p-2 border rounded">
              <option value="">Toutes les priorités</option>
              <option value="haute">Haute</option>
              <option value="moyenne">Moyenne</option>
              <option value="basse">Basse</option>
            </select>
          </div>
        </div>
      </div>
  
      <!-- Liste des chambres -->
      <div v-if="!chargement && !erreur && chambres.length > 0">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Numéro
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Étage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Priorité
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Dernier nettoyage
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Notes
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="chambre in chambresFiltrees" :key="chambre.id">
              <td class="px-6 py-4 whitespace-nowrap font-medium">
                {{ chambre.numero }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ chambre.etage }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ chambre.type }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span 
                  :class="{
                    'bg-red-100 text-red-800': chambre.priorite === 'haute',
                    'bg-yellow-100 text-yellow-800': chambre.priorite === 'moyenne',
                    'bg-green-100 text-green-800': chambre.priorite === 'basse'
                  }"
                  class="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full"
                >
                  {{ formatPriorite(chambre.priorite) }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatDate(chambre.dernierNettoyage) }}
              </td>
              <td class="px-6 py-4">
                {{ chambre.notes || "Aucune note" }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button @click="commencerNettoyage(chambre.id)" class="btn-action">
                  Commencer
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!chargement && !erreur && chambresCherchees && chambres.length === 0">
        Aucune chambre à nettoyer trouvée.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        chambres: [],
        chargement: false,
        erreur: null,
        chambresCherchees: false,
        filtreEtage: "",
        filtrePriorite: ""
      };
    },
    computed: {
      chambresFiltrees() {
        let result = this.chambres;
        
        if (this.filtreEtage) {
          result = result.filter(chambre => chambre.etage.toString() === this.filtreEtage);
        }
        
        if (this.filtrePriorite) {
          result = result.filter(chambre => chambre.priorite === this.filtrePriorite);
        }
        
        return result;
      }
    },
    methods: {
      chargerChambres() {
        this.chargement = true;
        this.erreur = null;
  
        axios
          .get("http://localhost:3002/chambresANettoyer")
          .then((response) => {
            if (response.data && Array.isArray(response.data)) {
              this.chambres = response.data;
            } else if (response.data && response.data.chambres) {
              this.chambres = response.data.chambres;
            } else {
              this.erreur = "Format de réponse incorrect";
              console.error("Format incorrect:", response.data);
            }
            this.chambresCherchees = true;
          })
          .catch((error) => {
            this.erreur =
              "Erreur lors du chargement des chambres: " + error.message;
            console.error("Erreur:", error);
            this.chambresCherchees = true;
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      formatDate(dateString) {
        if (!dateString) return "Non spécifié";
        
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('fr-FR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }).format(date);
      },
      formatPriorite(priorite) {
        switch(priorite) {
          case 'haute': return 'Haute priorité';
          case 'moyenne': return 'Priorité moyenne';
          case 'basse': return 'Priorité basse';
          default: return priorite;
        }
      },
      async commencerNettoyage(chambreId) {
        try {
          const token = localStorage.getItem('token');
          
          await axios.post(`http://localhost:3002/commencerNettoyage/${chambreId}`, {}, {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          
          // Actualiser la liste après l'action
          this.chargerChambres();
          
          // Optionnel: afficher un message de succès
          alert('Nettoyage commencé pour la chambre');
        } catch (error) {
          alert('Erreur lors du démarrage du nettoyage: ' + (error.response?.data?.message || error.message));
        }
      }
    },
    mounted() {
      // Charger les chambres automatiquement au montage du composant
      this.chargerChambres();
    }
  };
  </script>
  
  <style scoped>
  .erreur {
    color: red;
    margin: 10px 0;
  }
  
  button {
    margin-top: 15px;
    padding: 8px 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  .btn-action {
    margin: 0;
    padding: 5px 10px;
    background-color: #42b983;
    font-size: 0.85rem;
  }
  
  .btn-action:hover {
    background-color: #3ca876;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  thead {
    background-color: #f4f4f4;
  }
  </style>