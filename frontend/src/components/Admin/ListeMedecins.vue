<template>
  <div class="container mx-auto p-4">
    <!-- Bouton pour charger les médecins -->
    <button @click="chargerMedecins">Charger les médecins</button>

    <!-- Indicateur de chargement -->
    <div v-if="chargement">Chargement en cours...</div>

    <!-- Message d'erreur -->
    <div v-if="erreur" class="erreur">{{ erreur }}</div>

    <!-- Liste des médecins (visible uniquement après chargement) -->
    <div v-if="!chargement && !erreur && medecins.length > 0">
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
              Spécialité
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(medecin, index) in medecins" :key="index">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ medecin.id_personne }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ medecin.nom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ medecin.prenom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ medecin.specialite }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message si aucun médecin trouvé après tentative de chargement -->
    <div
      v-if="!chargement && !erreur && medecinsCherches && medecins.length === 0"
    >
      Aucun médecin trouvé.
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      medecins: [],
      chargement: false,
      erreur: null,
      medecinsCherches: false, // Indique si une recherche a été effectuée
    };
  },
  methods: {
    chargerMedecins() {
      this.chargement = true;
      this.erreur = null;

      axios
        .get("http://localhost:3002/medecins")
        .then((response) => {
          if (response.data && response.data.medecins) {
            this.medecins = response.data.medecins;
          } else if (Array.isArray(response.data)) {
            // Si la réponse est directement un tableau
            this.medecins = response.data;
          } else {
            this.erreur = "Format de réponse incorrect";
            console.error("Format incorrect:", response.data);
          }
          this.medecinsCherches = true; // Marquer que la recherche a été effectuée
        })
        .catch((error) => {
          this.erreur =
            "Erreur lors du chargement des médecins: " + error.message;
          console.error("Erreur:", error);
          this.medecinsCherches = true;
        })
        .finally(() => {
          this.chargement = false;
        });
    },
  },
  // Suppression de la méthode mounted() pour ne pas charger automatiquement
};
</script>

<style scoped>
.erreur {
  color: red;
  margin: 10px 0;
}

ul {
  list-style-type: none;
  padding: 0;
}

li {
  padding: 8px 0;
  border-bottom: 1px solid #eee;
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
button:hover {
  background-color: #45a049;
}
</style>
