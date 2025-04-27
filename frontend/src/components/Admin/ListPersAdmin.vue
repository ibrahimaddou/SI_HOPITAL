<template>
  <div class="container mx-auto p-4">
    <!-- Bouton pour charger le personnel administratif -->
    <button @click="chargerPersonnelAdmin">
      Charger le personnel administratif
    </button>

    <!-- Indicateur de chargement -->
    <div v-if="chargement">Chargement en cours...</div>

    <!-- Message d'erreur -->
    <div v-if="erreur" class="erreur">{{ erreur }}</div>

    <!-- Liste du personnel administratif (visible uniquement après chargement) -->
    <div v-if="!chargement && !erreur && personnelAdmin.length > 0">
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
              Poste
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date d'embauche
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Responsable
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Service
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(admin, index) in personnelAdmin" :key="index">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ admin.id_personne }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ admin.nom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ admin.prenom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ admin.poste }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ admin.date_embauche }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ admin.est_responsable ? "Oui" : "Non" }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ admin.nom_service }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message si aucun personnel administratif trouvé après tentative de chargement -->
    <div
      v-if="
        !chargement && !erreur && adminCherches && personnelAdmin.length === 0
      "
    >
      Aucun personnel administratif trouvé.
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      personnelAdmin: [],
      chargement: false,
      erreur: null,
      adminCherches: false, // Indique si une recherche a été effectuée
    };
  },
  methods: {
    chargerPersonnelAdmin() {
      this.chargement = true;
      this.erreur = null;

      axios
        .get("http://localhost:3002/personnel_administratif") // Assurez-vous que cette route est correcte
        .then((response) => {
          // Vérifiez la structure de votre réponse
          if (response.data && response.data.personnelAdmin) {
            this.personnelAdmin = response.data.personnelAdmin;
          } else if (Array.isArray(response.data)) {
            // Si la réponse est directement un tableau
            this.personnelAdmin = response.data;
          } else {
            this.erreur = "Format de réponse incorrect";
            console.error("Format incorrect:", response.data);
          }
          this.adminCherches = true; // Marquer que la recherche a été effectuée
        })
        .catch((error) => {
          this.erreur =
            "Erreur lors du chargement du personnel administratif: " +
            error.message;
          console.error("Erreur:", error);
          this.adminCherches = true;
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
