<template>
  <div class="container mx-auto p-6 bg-white rounded shadow mt-6">
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700"
        >ID du soin :</label
      >
      <input
        v-model="idSoin"
        type="number"
        placeholder="Entrez l'ID du soin"
        class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
      />
    </div>

    <button
      @click="chargerDetailReunion"
      class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
    >
      Charger les détails de la réunion
    </button>

    <!-- Affichage des détails de la réunion -->
    <div v-if="reunion" class="mt-6 space-y-6">
      <div class="bg-gray-100 p-4 rounded shadow">
        <h2 class="text-lg font-semibold mb-2">
          Réunion #{{ reunion.id_reunion }}
        </h2>
        <p><strong>Date :</strong> {{ formatDate(reunion.date_reunion) }}</p>
        <p><strong>Sujet :</strong> {{ reunion.sujet }}</p>
        <p>
          <strong>Compte-rendu :</strong>
          {{ reunion.compte_rendu || "Pas de compte-rendu." }}
        </p>
      </div>
    </div>

    <div v-else-if="chargé" class="mt-4 text-gray-500">
      Aucun détail trouvé pour ce soin.
    </div>

    <div v-if="message" class="mt-4 text-red-600">
      {{ message }}
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      idSoin: "",
      reunion: null,
      message: "",
      chargé: false,
    };
  },
  methods: {
    async chargerDetailReunion() {
      this.message = "";
      this.reunion = null;
      this.chargé = false;

      if (!this.idSoin) {
        this.message = "Veuillez entrer un ID de soin.";
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3002/afficherDetailReunion/${this.idSoin}`
        );

        const data = response.data;

        if (!data) {
          this.message = "Aucune réunion trouvée pour ce soin.";
          return;
        }

        // Réponse directement sous forme d'objet
        this.reunion = data;
        this.chargé = true;
      } catch (error) {
        console.error(
          "Erreur lors du chargement des détails de la réunion",
          error
        );
        this.message =
          "Erreur lors de la récupération des détails de la réunion.";
      }
    },

    formatDate(dateString) {
      const options = {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };
      return new Date(dateString).toLocaleDateString("fr-FR", options);
    },
  },
};
</script>

<style scoped>
button {
  cursor: pointer;
}
</style>
