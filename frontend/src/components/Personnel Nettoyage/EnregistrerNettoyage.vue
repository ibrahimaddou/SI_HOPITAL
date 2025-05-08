<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Enregistrer un nettoyage</h2>

    <div v-if="chargement">Chargement en cours...</div>
    <div v-if="erreur" class="erreur">{{ erreur }}</div>
    <div v-if="success" class="success">{{ success }}</div>

    <!-- Formulaire d'enregistrement de nettoyage -->
    <form @submit.prevent="soumettreNettoyage" class="bg-white shadow-md rounded p-4 mb-4">
      <div class="mb-4">
        <label for="idChambre" class="block text-sm font-medium text-gray-700 mb-1">Chambre</label>
        <select 
          id="idChambre" 
          v-model="nettoyage.idChambre" 
          class="w-full p-2 border rounded" 
          required
        >
          <option value="">Sélectionner une chambre</option>
          <option v-for="chambre in chambres" :key="chambre.id_chambre" :value="chambre.id_chambre">
            {{ chambre.numero }} (Étage {{ chambre.etage }}) - {{ chambre.nom_service || 'Service non spécifié' }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label for="idPersonnelNettoyage" class="block text-sm font-medium text-gray-700 mb-1">Personnel de nettoyage</label>
        <select 
          id="idPersonnelNettoyage" 
          v-model="nettoyage.idPersonnelNettoyage" 
          class="w-full p-2 border rounded" 
          required
        >
          <option value="">Sélectionner un membre du personnel</option>
          <option v-for="personnel in personnelNettoyage" :key="personnel.id_nettoyage" :value="personnel.id_nettoyage">
            {{ personnel.nom_complet }}
          </option>
        </select>
      </div>

      <div class="mb-4">
        <label for="dateNettoyage" class="block text-sm font-medium text-gray-700 mb-1">Date et heure du nettoyage</label>
        <input 
          type="datetime-local" 
          id="dateNettoyage" 
          v-model="nettoyage.dateNettoyage" 
          class="w-full p-2 border rounded"
        >
        <p class="text-sm text-gray-500 mt-1">Si non spécifié, la date et l'heure actuelles seront utilisées.</p>
      </div>

      <div class="mb-4">
        <label for="commentaire" class="block text-sm font-medium text-gray-700 mb-1">Commentaire (optionnel)</label>
        <textarea 
          id="commentaire" 
          v-model="nettoyage.commentaire" 
          class="w-full p-2 border rounded"
          rows="3"
        ></textarea>
      </div>

      <div class="flex justify-end">
        <button 
          type="submit" 
          class="py-2 px-4 bg-green-600 text-white font-semibold rounded-md shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
          :disabled="chargement"
        >
          {{ chargement ? 'Enregistrement...' : 'Enregistrer le nettoyage' }}
        </button>
      </div>
    </form>

    <!-- Section désactivée en attendant un endpoint approprié -->
  <!-- Décommentez cette section quand un endpoint pour les nettoyages récents sera disponible -->
  <!--
    <div v-if="nettoyagesRecents.length > 0" class="mt-8">
      <h3 class="text-lg font-semibold mb-3">Nettoyages récents</h3>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Chambre
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date et heure
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Personnel
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Service
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="nettoyage in nettoyagesRecents" :key="nettoyage.id_nettoyage">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ nettoyage.numero_chambre }} (Étage {{ nettoyage.etage }})
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDate(nettoyage.date_nettoyage) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ nettoyage.nom_personnel }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ nettoyage.nom_service }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  -->
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      nettoyage: {
        idChambre: "",
        idPersonnelNettoyage: "",
        dateNettoyage: "",
        commentaire: ""
      },
      chambres: [],
      personnelNettoyage: [],
      nettoyagesRecents: [],
      chargement: false,
      erreur: null,
      success: null
    };
  },
  methods: {
    async chargerChambres() {
      try {
        const response = await axios.get("http://localhost:3002/chambresANettoyer");
        if (response.data && Array.isArray(response.data)) {
          this.chambres = response.data;
        } else if (response.data && response.data.chambres) {
          this.chambres = response.data.chambres;
        } else {
          throw new Error("Format de réponse incorrect");
        }
      } catch (error) {
        this.erreur = "Erreur lors du chargement des chambres: " + (error.response?.data?.message || error.message);
        console.error("Erreur:", error);
      }
    },
    
    async chargerPersonnelNettoyage() {
      try {
        // Utiliser des données statiques si l'endpoint n'existe pas
        // Dans un environnement de production, cet endpoint devrait exister
        this.personnelNettoyage = [
          // Remplacez ces exemples par vos données réelles ou créez un endpoint approprié
          { id_nettoyage: 11, nom_complet: "Marc Laurent" },
          { id_nettoyage: 12, nom_complet: "Sylvie Martinez" }
        ];
      } catch (error) {
        this.erreur = "Erreur lors du chargement du personnel: " + (error.response?.data?.message || error.message);
        console.error("Erreur:", error);
      }
    },
    
    async chargerNettoyagesRecents() {
      try {
        // Si vous n'avez pas d'endpoint pour récupérer les nettoyages récents, 
        // cette fonction peut être simplifiée ou l'affichage masqué
        this.nettoyagesRecents = [];
        // Dans un environnement de production, créez un endpoint pour récupérer les nettoyages récents
      } catch (error) {
        console.error("Erreur lors du chargement des nettoyages récents:", error);
        // On n'affiche pas d'erreur à l'utilisateur pour cette opération non critique
      }
    },
    
    async soumettreNettoyage() {
      this.chargement = true;
      this.erreur = null;
      this.success = null;
      
      try {
        const token = localStorage.getItem('token');
        
        // Préparation des données
        const formData = {
          idChambre: this.nettoyage.idChambre,
          idPersonnelNettoyage: this.nettoyage.idPersonnelNettoyage,
          dateNettoyage: this.nettoyage.dateNettoyage || new Date().toISOString(),
          commentaire: this.nettoyage.commentaire || null
        };
        
        // Envoi de la requête
        const response = await axios.post("http://localhost:3002/enregistrerNettoyage", formData, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        // Traitement de la réponse
        if (response.status === 201) {
          this.success = "Nettoyage enregistré avec succès !";
          
          // Réinitialisation du formulaire
          this.nettoyage = {
            idChambre: "",
            idPersonnelNettoyage: "",
            dateNettoyage: "",
            commentaire: ""
          };
          
          // Mise à jour des nettoyages récents
          await this.chargerNettoyagesRecents();
        } else {
          throw new Error("Erreur lors de l'enregistrement du nettoyage");
        }
      } catch (error) {
        this.erreur = "Erreur lors de l'enregistrement du nettoyage: " + (error.response?.data?.message || error.message);
        console.error("Erreur:", error);
      } finally {
        this.chargement = false;
      }
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
    }
  },
  mounted() {
    // Charger les données au chargement du composant
    this.chargerChambres();
    this.chargerPersonnelNettoyage();
    // Si vous n'avez pas d'endpoint pour les nettoyages récents, désactivez cette ligne
    // this.chargerNettoyagesRecents();
  }
};
</script>

<style scoped>
.erreur {
  color: red;
  margin: 10px 0;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
  border-left: 4px solid #f44336;
}

.success {
  color: green;
  margin: 10px 0;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 4px;
  border-left: 4px solid #4caf50;
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

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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