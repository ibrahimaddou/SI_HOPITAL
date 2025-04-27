<template>
  <div class="container mx-auto p-6 bg-white rounded shadow mt-6">
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700"
        >ID du patient :</label
      >
      <input
        v-model="idPatient"
        type="number"
        placeholder="Entrez l'ID du patient"
        class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
      />
    </div>

    <button
      @click="chargerMedicamentsPatient"
      class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
    >
      Charger les médicaments
    </button>

    <!-- Affichage des médicaments -->
    <div v-if="soins.length > 0" class="mt-6 space-y-6">
      <div
        v-for="soin in soins"
        :key="soin.id_soin"
        class="bg-gray-100 p-4 rounded shadow"
      >
        <h2 class="text-lg font-semibold mb-2">Soin #{{ soin.id_soin }}</h2>
        <p class="mb-4">
          <strong>Description du soin :</strong> {{ soin.soin_description }}
        </p>

        <div
          v-for="medicament in soin.medicaments"
          :key="medicament.id_medicament"
          class="ml-4 mb-2"
        >
          <p><strong>Nom :</strong> {{ medicament.nom_medicament }}</p>
          <p>
            <strong>Description :</strong>
            {{ medicament.description_medicament || "Pas de description" }}
          </p>
          <p>
            <strong>Dosage :</strong> {{ medicament.dosage || "Non précisé" }}
          </p>
          <p>
            <strong>Quantité administrée :</strong> {{ medicament.quantite }}
          </p>
          <hr class="my-2" />
        </div>
      </div>
    </div>

    <div v-else-if="chargé" class="mt-4 text-gray-500">
      Aucun médicament trouvé pour ce patient.
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
      idPatient: "",
      soins: [],
      message: "",
      chargé: false,
    };
  },
  methods: {
    async chargerMedicamentsPatient() {
      this.message = "";
      this.soins = [];
      this.chargé = false;

      if (!this.idPatient) {
        this.message = "Veuillez entrer un ID de patient.";
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3002/afficherMedicamentsPatient/${this.idPatient}`
        );

        const data = response.data;

        // Regrouper les médicaments par soin
        const soinsMap = {};

        data.forEach((item) => {
          if (!soinsMap[item.id_soin]) {
            soinsMap[item.id_soin] = {
              id_soin: item.id_soin,
              soin_description: item.soin_description,
              medicaments: [],
            };
          }

          soinsMap[item.id_soin].medicaments.push({
            id_medicament: item.id_medicament,
            nom_medicament: item.nom_medicament,
            description_medicament: item.description_medicament,
            dosage: item.dosage,
            quantite: item.quantite,
          });
        });

        this.soins = Object.values(soinsMap);
        this.chargé = true;
      } catch (error) {
        console.error("Erreur lors du chargement :", error);
        this.message = "Erreur lors de la récupération des médicaments.";
      }
    },
  },
};
</script>

<style scoped>
button {
  cursor: pointer;
}
</style>
