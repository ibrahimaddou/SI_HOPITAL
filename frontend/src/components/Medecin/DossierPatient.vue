<template>
  <div class="container mx-auto p-6 bg-gray-100 rounded-lg shadow-md mt-6">
    <div class="mb-6">
      <label class="block text-sm font-medium text-gray-700"
        >ID du patient :</label
      >
      <input
        v-model="idPatient"
        type="number"
        placeholder="Entrez l'ID du patient"
        class="mt-1 block w-full rounded-lg border-gray-300 shadow-sm p-3 focus:ring-2 focus:ring-blue-500"
      />
    </div>

    <button
      @click="chargerDossierPatient"
      class="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-blue-500"
    >
      Charger le dossier
    </button>

    <!-- Affichage des données -->
    <div v-if="dossier" class="mt-6 space-y-8">
      <!-- Informations Personnelles -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">
          Informations Personnelles
        </h2>
        <p>
          <strong class="font-medium">Nom :</strong>
          {{ dossier.antecedents?.nom }}
        </p>
        <p>
          <strong class="font-medium">Prénom :</strong>
          {{ dossier.antecedents?.prenom }}
        </p>
        <p>
          <strong class="font-medium">Date de Naissance :</strong>
          {{ dossier.antecedents?.date_naissance }}
        </p>
        <p>
          <strong class="font-medium">Antécédents médicaux :</strong>
          {{ dossier.antecedents?.antecedents_medicaux || "Aucun" }}
        </p>
      </div>

      <!-- Visites -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Visites</h2>
        <div v-if="dossier.visites.length > 0">
          <ul class="space-y-4">
            <li
              v-for="visite in dossier.visites"
              :key="visite.id_visite"
              class="border-b pb-4"
            >
              <p>
                <strong>Date :</strong> {{ formatDate(visite.date_visite) }}
              </p>
              <p><strong>Examens :</strong> {{ visite.examens_pratiques }}</p>
              <p><strong>Commentaires :</strong> {{ visite.commentaires }}</p>
            </li>
          </ul>
        </div>
        <div v-else class="text-gray-600">Aucune visite trouvée.</div>
      </div>

      <!-- Soins -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Soins</h2>
        <div v-if="dossier.soins.length > 0">
          <ul class="space-y-4">
            <li
              v-for="soin in dossier.soins"
              :key="soin.id_soin"
              class="border-b pb-4"
            >
              <p class="text-gray-700">{{ soin.description }}</p>
            </li>
          </ul>
        </div>
        <div v-else class="text-gray-600">Aucun soin enregistré.</div>
      </div>

      <!-- Séjours -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-2xl font-semibold mb-4 text-gray-800">Séjours</h2>
        <div v-if="dossier.sejours.length > 0">
          <ul class="space-y-4">
            <li
              v-for="sejour in dossier.sejours"
              :key="sejour.id_sejour"
              class="border-b pb-4"
            >
              <p><strong>Lit :</strong> {{ sejour.id_lit }}</p>
              <p>
                <strong>Date d'arrivée :</strong>
                {{ formatDate(sejour.date_arrivee) }}
              </p>
              <p>
                <strong>Sortie prévue :</strong>
                {{ formatDate(sejour.date_sortie_previsionnelle) }}
              </p>
              <p>
                <strong>Sortie réelle :</strong>
                {{
                  sejour.date_sortie_reelle
                    ? formatDate(sejour.date_sortie_reelle)
                    : "Non sorti"
                }}
              </p>
              <p><strong>Raison :</strong> {{ sejour.raison_sejour }}</p>
            </li>
          </ul>
        </div>
        <div v-else class="text-gray-600">Aucun séjour enregistré.</div>
      </div>
    </div>

    <!-- Message si erreur -->
    <div v-if="message" class="mt-6 text-red-600 font-medium text-center">
      {{ message }}
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      idPatient: "",
      dossier: null,
      message: "",
    };
  },
  methods: {
    async chargerDossierPatient() {
      this.message = "";
      this.dossier = null;

      if (!this.idPatient) {
        this.message = "Veuillez entrer l'ID du patient.";
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3002/patient/dossier/${this.idPatient}`
        );
        this.dossier = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement du dossier patient:", error);
        this.message = "Erreur lors du chargement du dossier.";
      }
    },
    formatDate(dateStr) {
      if (!dateStr) return "";
      const options = { year: "numeric", month: "long", day: "numeric" };
      return new Date(dateStr).toLocaleDateString("fr-FR", options);
    },
  },
};
</script>

<style scoped>
.container {
  background-color: #f8f9fa;
}
button:hover {
  background-color: #3b82f6;
}
button:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
}
</style>
