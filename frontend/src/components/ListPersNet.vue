<template>
  <div class="container mx-auto p-4">
    <!-- Bouton pour charger le personnel de nettoyage -->
    <button @click="chargerPersonnelNettoyage">
      Charger le personnel de nettoyage
    </button>

    <!-- Indicateur de chargement -->
    <div v-if="chargement">Chargement en cours...</div>

    <!-- Message d'erreur -->
    <div v-if="erreur" class="erreur">{{ erreur }}</div>

    <!-- Liste du personnel de nettoyage (visible uniquement après chargement) -->
    <div v-if="!chargement && !erreur && personnelNettoyage.length > 0">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Id
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Nom
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Prénom
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date d'embauche
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Téléphone
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Email
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Service
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(agent, index) in personnelNettoyage" :key="index">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ agent.id_personne }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ agent.nom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ agent.prenom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDate(agent.date_embauche) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ agent.telephone }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ agent.email }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ agent.nom_service || "Non assigné" }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message si aucun personnel de nettoyage trouvé après tentative de chargement -->
    <div
      v-if="
        !chargement &&
        !erreur &&
        nettoyageCherches &&
        personnelNettoyage.length === 0
      "
    >
      Aucun personnel de nettoyage trouvé.
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      personnelNettoyage: [],
      chargement: false,
      erreur: null,
      nettoyageCherches: false, // Indique si une recherche a été effectuée
    };
  },
  methods: {
    chargerPersonnelNettoyage() {
      this.chargement = true;
      this.erreur = null;

      axios
        .get("http://localhost:3002/personnel_nettoyage")
        .then((response) => {
          // Vérifiez la structure de votre réponse
          if (response.data && response.data.personnelNettoyage) {
            this.personnelNettoyage = response.data.personnelNettoyage;
          } else if (Array.isArray(response.data)) {
            // Si la réponse est directement un tableau
            this.personnelNettoyage = response.data;
          } else {
            this.erreur = "Format de réponse incorrect";
            console.error("Format incorrect:", response.data);
          }
          this.nettoyageCherches = true; // Marquer que la recherche a été effectuée
        })
        .catch((error) => {
          this.erreur =
            "Erreur lors du chargement du personnel de nettoyage: " +
            error.message;
          console.error("Erreur:", error);
          this.nettoyageCherches = true;
        })
        .finally(() => {
          this.chargement = false;
        });
    },
    formatDate(dateString) {
      if (!dateString) return "Non spécifiée";

      // Format de date pour l'affichage (ex: 15/04/2023)
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR");
    },
  },
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
