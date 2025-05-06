<template>
  <div class="container mx-auto p-6 bg-white rounded shadow mt-6">
    <div class="mb-4">
      <label class="block text-sm font-medium text-gray-700"
        >Sélectionner un patient :</label
      >
      <select
        v-model="idPatient"
        class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
      >
        <option value="" disabled>Choisissez un patient</option>
        <option v-for="patient in listePatients" :key="patient.id_patient" :value="patient.id_patient">
          #{{ patient.id_patient }} - {{ patient.prenom }} {{ patient.nom }}
        </option>
      </select>
    </div>

    <button
      @click="chargerMedicamentsPatient"
      class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
    >
      Charger les médicaments
    </button>

    <!-- Affichage des informations du patient -->
    <div v-if="infoPatient" class="mt-4 p-4 bg-blue-50 rounded shadow">
      <h2 class="text-xl font-bold mb-2">
        Patient #{{ infoPatient.id_patient }} - {{ infoPatient.prenom }} {{ infoPatient.nom }}
      </h2>
    </div>

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
          <h3>Medicament</h3>
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
      infoPatient: null,
      listePatients: [],
    };
  },
  
  // Charger la liste des patients au chargement du composant
  async mounted() {
    await this.chargerListePatients();
  },
  methods: {
    // Nouvelle méthode pour charger la liste des patients
    async chargerListePatients() {
      try {
        const response = await axios.get(
          "http://localhost:3002/patients"
        );
        
        this.listePatients = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement de la liste des patients :", error);
        this.message = "Erreur lors de la récupération de la liste des patients.";
      }
    },
    
    async chargerMedicamentsPatient() {
      this.message = "";
      this.soins = [];
      this.chargé = false;
      this.infoPatient = null;

      if (!this.idPatient) {
        this.message = "Veuillez sélectionner un patient.";
        return;
      }

      try {
        // Récupération des informations du patient
        const patientResponse = await axios.get(
          `http://localhost:3002/patients/${this.idPatient}`
        );
        
        if (patientResponse.data && patientResponse.data.length > 0) {
          this.infoPatient = patientResponse.data[0];
        }
        
        // Récupération des médicaments du patient
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
        this.message = "Erreur lors de la récupération des données.";
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