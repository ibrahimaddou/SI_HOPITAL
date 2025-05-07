<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Supprimer un patient</h2>

    <!-- Sélecteur de patient -->
    <div class="mb-6 bg-white p-4 rounded shadow">
      <label class="block font-semibold mb-2"
        >Sélectionnez un patient à supprimer :</label
      >
      <div class="mb-4">
        <select
          v-model="idPatientSelectionne"
          class="w-full p-2 border rounded"
          @change="chargerPatientDetails"
        >
          <option value="">-- Sélectionnez un patient --</option>
          <option
            v-for="patient in patients"
            :key="patient.id_patient"
            :value="patient.id_patient"
          >
            {{ patient.nom }} {{ patient.prenom }} ({{
              formatDate(patient.date_naissance)
            }})
          </option>
        </select>
      </div>
    </div>

    <!-- Détails du patient sélectionné -->
    <div v-if="patientSelectionne" class="mb-6 bg-white p-4 rounded shadow">
      <h3 class="font-semibold text-lg mb-3">Détails du patient</h3>

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
            {{ formatDate(dossier.antecedents?.date_naissance) }}
          </p>
          <p>
            <strong class="font-medium">Antécédents médicaux :</strong>
            {{ dossier.antecedents?.antecedents_medicaux || "Aucun" }}
          </p>
        </div>

        <!-- Visites -->
        <div class="bg-white p-6 rounded-lg shadow-md">
          <h2 class="text-2xl font-semibold mb-4 text-gray-800">Visites</h2>
          <div v-if="dossier.visites && dossier.visites.length > 0">
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
          <div v-if="dossier.soins && dossier.soins.length > 0">
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
          <div v-if="dossier.sejours && dossier.sejours.length > 0">
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

      <!-- Confirmation de suppression -->
      <div class="mt-6 bg-red-50 p-4 rounded border border-red-200">
        <h4 class="font-semibold text-red-700 mb-2">
          Attention ! Cette action est irréversible
        </h4>
        <p class="mb-4">
          La suppression du patient entraînera également la suppression de
          toutes ses données associées, y compris ses séjours, visites médicales
          et soins.
        </p>

        <div class="flex items-center mb-4">
          <input
            v-model="confirmationSuppression"
            type="checkbox"
            id="confirmation"
            class="mr-2"
          />
          <label for="confirmation"
            >Je confirme vouloir supprimer définitivement ce patient et toutes
            ses données associées</label
          >
        </div>

        <button
          @click="confirmerSuppression"
          class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
          :disabled="!confirmationSuppression || suppressionEnCours"
        >
          {{
            suppressionEnCours
              ? "Suppression en cours..."
              : "Supprimer définitivement"
          }}
        </button>
      </div>
    </div>

    <!-- Message de résultat -->
    <div v-if="message" class="mt-4 p-4 rounded" :class="messageClasse">
      {{ message }}
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      patients: [],
      idPatientSelectionne: "",
      patientSelectionne: null,
      recherche: "",
      donneesSejours: [],
      donneesVisites: [],
      donneesSoins: [],
      confirmationSuppression: false,
      suppressionEnCours: false,
      message: "",
      dossier: null,
      messageClasse: "",
    };
  },
  mounted() {
    this.chargerPatients();
  },
  methods: {
    chargerPatients() {
      axios
        .get("http://localhost:3002/patients")
        .then((response) => {
          this.patients = response.data;
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des patients:", error);
          this.afficherMessage(
            "Erreur lors du chargement des patients",
            "error"
          );
        });
    },

    confirmerSuppression() {
      if (!this.idPatientSelectionne) return;

      this.suppressionEnCours = true;

      axios
        .delete(
          `http://localhost:3002/supprimerPatients/${this.idPatientSelectionne}`
        )
        .then(() => {
          this.afficherMessage("Patient supprimé avec succès", "success");
          this.reinitialiser();
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression :", error);
          this.afficherMessage(
            "Erreur lors de la suppression du patient",
            "error"
          );
        })
        .finally(() => {
          this.suppressionEnCours = false;
        });
    },
    rechercherPatients() {
      if (!this.recherche) {
        this.chargerPatients();
        return;
      }

      axios
        .get(`http://localhost:3002/patients/recherche?q=${this.recherche}`)
        .then((response) => {
          this.patients = response.data;
        })
        .catch((error) => {
          console.error("Erreur lors de la recherche:", error);
          this.afficherMessage(
            "Erreur lors de la recherche de patients",
            "error"
          );
        });
    },

    async chargerPatientDetails() {
      if (!this.idPatientSelectionne) {
        this.patientSelectionne = null;
        return;
      }

      try {
        const response = await axios.get(
          `http://localhost:3002/patients/${this.idPatientSelectionne}`
        );
        this.patientSelectionne = response.data;

        await this.chargerDonneesAssociees(); // <== attendre le chargement
      } catch (error) {
        console.error(
          "Erreur lors du chargement des détails du patient:",
          error
        );
        this.afficherMessage(
          "Erreur lors du chargement des détails du patient",
          "error"
        );
      }
    },

    async chargerDonneesAssociees() {
      this.message = "";
      this.dossier = null;
      try {
        const response = await axios.get(
          `http://localhost:3002/patient/dossier/${this.idPatientSelectionne}`
        );
        this.dossier = response.data;

        console.log("Données du dossier reçues:", this.dossier);
      } catch (error) {
        console.error("Erreur lors du chargement du dossier patient:", error);
        this.message =
          "Erreur lors du chargement du dossier: " +
          (error.response?.data || error.message);
      }
    },

    afficherMessage(message, type) {
      this.message = message;
      if (type === "error") {
        this.messageClasse = "bg-red-100 text-red-700 border border-red-500";
      } else {
        this.messageClasse =
          "bg-green-100 text-green-700 border border-green-500";
      }
    },

    reinitialiser() {
      this.idPatientSelectionne = "";
      this.patientSelectionne = null;
      this.recherche = "";
      this.donneesSejours = [];
      this.donneesVisites = [];
      this.donneesSoins = [];
      this.confirmationSuppression = false;
      this.chargerPatients();
    },

    formatDate(dateString) {
      if (!dateString) return "Non renseignée";

      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    },
  },
};
</script>

<style scoped>
input:focus,
select:focus {
  outline: none;
  border-color: #4f46e5;
}
</style>
