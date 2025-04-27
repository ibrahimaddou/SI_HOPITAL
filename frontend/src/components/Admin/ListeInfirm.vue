<template>
  <div class="container mx-auto p-4">
    <!-- Bouton pour charger les infirmiers -->
    <button @click="chargerInfirmiers">Charger les infirmiers</button>

    <!-- Indicateur de chargement -->
    <div v-if="chargement">Chargement en cours...</div>

    <!-- Message d'erreur -->
    <div v-if="erreur" class="erreur">{{ erreur }}</div>

    <!-- Liste des infirmiers (visible uniquement après chargement) -->
    <div v-if="!chargement && !erreur && infirmiers.length > 0">
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
              Qualification
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date d'embauche
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(infirmier, index) in infirmiers" :key="index">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ infirmier.id_personne }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ infirmier.nom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ infirmier.prenom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ infirmier.qualification }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ infirmier.date_embauche }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message si aucun infirmier trouvé après tentative de chargement -->
    <div
      v-if="
        !chargement && !erreur && infirmiersCherches && infirmiers.length === 0
      "
    >
      Aucun infirmier trouvé.
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      infirmiers: [],
      chargement: false,
      erreur: null,
      infirmiersCherches: false, // Indique si une recherche a été effectuée
    };
  },
  methods: {
    chargerInfirmiers() {
      this.chargement = true;
      this.erreur = null;

      axios
        .get("http://localhost:3002/infirmiers") // Assurez-vous que cette route est correcte
        .then((response) => {
          // Vérifiez la structure de votre réponse
          if (response.data && response.data.infirmiers) {
            this.infirmiers = response.data.infirmiers;
          } else if (Array.isArray(response.data)) {
            // Si la réponse est directement un tableau
            this.infirmiers = response.data;
          } else {
            this.erreur = "Format de réponse incorrect";
            console.error("Format incorrect:", response.data);
          }
          this.infirmierCherches = true; // Marquer que la recherche a été effectuée
        })
        .catch((error) => {
          this.erreur =
            "Erreur lors du chargement des infirmiers: " + error.message;
          console.error("Erreur:", error);
          this.infirmiersCherches = true;
        })
        .finally(() => {
          this.chargement = false;
        });
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
