<template>
  <div class="container mx-auto p-4">
    <!-- Filtres -->
    <div class="bg-gray-100 p-4 rounded mb-4">
      <h3 class="text-lg font-semibold mb-2">Filtres</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Filtre par ID de soin -->
        <div>
          <label for="soinId" class="block mb-1">ID du soin:</label>
          <input 
            id="soinId" 
            v-model="filtres.soinId" 
            type="number" 
            class="border rounded px-2 py-1 w-full"
            placeholder="Filtrer par ID du soin"
          />
        </div>
        
        <!-- Filtre par ID d'infirmier -->
        <div>
          <label for="infirmierId" class="block mb-1">ID de l'infirmier:</label>
          <input 
            id="infirmierId" 
            v-model="filtres.infirmierId" 
            type="number" 
            class="border rounded px-2 py-1 w-full"
            placeholder="Filtrer par ID de l'infirmier"
          />
        </div>
        
        <!-- Filtre par date -->
        <div>
          <label for="date" class="block mb-1">Date:</label>
          <input 
            id="date" 
            v-model="filtres.date" 
            type="date" 
            class="border rounded px-2 py-1 w-full"
          />
        </div>
      </div>
      <div class="mt-4">
        <button @click="chargerAdministrations" class="mr-2">Rechercher</button>
        <button @click="reinitialiserFiltres" class="bg-gray-500 hover:bg-gray-600">Réinitialiser</button>
      </div>
    </div>

    <div v-if="chargement" class="my-4">Chargement en cours...</div>

    <div v-if="erreur" class="erreur my-4">{{ erreur }}</div>

    <!-- Liste des administrations  -->
    <div v-if="!chargement && !erreur && administrations.length > 0">
      <h3 class="text-lg font-semibold mb-2">Administrations de soins</h3>
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              ID
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Soin
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Patient
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Infirmier
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date et heure
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Commentaires
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="admin in administrations" :key="admin.id_administration">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ admin.id_administration }}
            </td>
            <td class="px-6 py-4">
              <div><strong>ID:</strong> {{ admin.id_soin }}</div>
              <div>{{ admin.description_soin }}</div>
              <div v-if="admin.medicaments && admin.medicaments.length > 0" class="mt-2">
                <strong>Médicaments:</strong>
                <ul class="list-disc ml-5 mt-1">
                  <li v-for="(med, index) in admin.medicaments" :key="index">
                    {{ med.nom }} ({{ med.dosage }}) - {{ med.quantite }}
                  </li>
                </ul>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ admin.nom_patient }} {{ admin.prenom_patient }}
              <div class="text-sm text-gray-500">ID: {{ admin.id_patient }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ admin.nom_infirmier }} {{ admin.prenom_infirmier }}
              <div class="text-sm text-gray-500">
                {{ admin.qualification || "Sans qualification spécifique" }}
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDateTime(admin.date_heure) }}
            </td>
            <td class="px-6 py-4">
              {{ admin.commentaires || "Aucun commentaire" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="!chargement && !erreur && administrationsCherchees && administrations.length === 0">
      Aucune administration de soin trouvée avec les critères spécifiés.
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      administrations: [],
      chargement: false,
      erreur: null,
      administrationsCherchees: false, // Indique si une recherche a été effectuée
      filtres: {
        soinId: "",
        infirmierId: "",
        date: ""
      }
    };
  },
  mounted() {
    // Chargement initial à l'ouverture du composant
    this.chargerAdministrations();
  },
  methods: {
    chargerAdministrations() {
      this.chargement = true;
      this.erreur = null;
      let url = "http://localhost:3002/administrationSoin";
      
      // Ajout des paramètres de filtrage
      const params = {};
      if (this.filtres.soinId) params.idSoin = this.filtres.soinId;
      if (this.filtres.infirmierId) params.idInfirmier = this.filtres.infirmierId;
      if (this.filtres.date) params.date = this.filtres.date;

      axios
        .get(url, { params })
        .then((response) => {
          // Vérif de la structure
          if (response.data && Array.isArray(response.data)) {
            this.administrations = response.data;
          } else if (response.data && response.data.administrations) {
            this.administrations = response.data.administrations;
          } else {
            this.erreur = "Format de réponse incorrect";
            console.error("Format incorrect:", response.data);
          }
          this.administrationsCherchees = true; // Marquer que la recherche a été effectuée
        })
        .catch((error) => {
          this.erreur =
            "Erreur lors du chargement des administrations: " + error.message;
          console.error("Erreur:", error);
          this.administrationsCherchees = true;
        })
        .finally(() => {
          this.chargement = false;
        });
    },
    reinitialiserFiltres() {
      this.filtres = {
        soinId: "",
        infirmierId: "",
        date: ""
      };
      this.chargerAdministrations();
    },
    formatDateTime(dateTimeString) {
      if (!dateTimeString) return "Non spécifiée";

      // Format de date 
      const date = new Date(dateTimeString);
      return date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit"
      });
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

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
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

ul {
  list-style-type: disc;
}

li {
  margin-bottom: 4px;
}
</style>