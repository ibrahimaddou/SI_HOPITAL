<template>
  <div class="container mx-auto p-4">
    <!-- Bouton pour charger les patients -->
    <button @click="chargerPatients">Charger les patients</button>

    <!-- Indicateur de chargement -->
    <div v-if="chargement">Chargement en cours...</div>

    <!-- Message d'erreur -->
    <div v-if="erreur" class="erreur">{{ erreur }}</div>

    <!-- Liste des patients (visible uniquement après chargement) -->
    <div v-if="!chargement && !erreur && patients.length > 0">
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
              Date de naissance
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
              Antécédents médicaux
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(patient, index) in patients" :key="index">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ patient.id_personne }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.nom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.prenom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatDate(patient.date_naissance) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.telephone }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.email }}</td>
            <td class="px-6 py-4">
              {{
                patient.antecedents_medicaux || "Aucun antécédent enregistré"
              }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message si aucun patient trouvé après tentative de chargement -->
    <div
      v-if="!chargement && !erreur && patientsCherches && patients.length === 0"
    >
      Aucun patient trouvé.
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      patients: [],
      chargement: false,
      erreur: null,
      patientsCherches: false, // Indique si une recherche a été effectuée
    };
  },
  methods: {
    chargerPatients() {
      this.chargement = true;
      this.erreur = null;

      axios
        .get("http://localhost:3002/patient")
        .then((response) => {
          // Vérifiez la structure de votre réponse
          if (response.data && response.data.patients) {
            this.patients = response.data.patients;
          } else if (Array.isArray(response.data)) {
            // Si la réponse est directement un tableau
            this.patients = response.data;
          } else {
            this.erreur = "Format de réponse incorrect";
            console.error("Format incorrect:", response.data);
          }
          this.patientsCherches = true; // Marquer que la recherche a été effectuée
        })
        .catch((error) => {
          this.erreur =
            "Erreur lors du chargement des patients: " + error.message;
          console.error("Erreur:", error);
          this.patientsCherches = true;
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
