<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Planifier une visite médicale</h2>

    <!-- Message d'alerte -->
    <div v-if="message" class="mt-4 p-2 rounded" :class="messageClasse">
      {{ message.text || message }}
    </div>

    <form
      @submit.prevent="soumettreFormulaire"
      class="bg-white p-4 rounded shadow"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Informations de base -->
        <div>
          <h3 class="font-semibold mb-2">Informations générales</h3>

          <div class="mb-3">
            <label class="block mb-1">Patient *</label>
            <select
              v-model="visite.idPatient"
              required
              class="w-full p-2 border rounded"
            >
              <option value="">Sélectionnez un patient</option>
              <option
                v-for="patient in patients"
                :key="patient.id_patient"
                :value="patient.id_patient"
              >
                {{ patient.nom }} {{ patient.prenom }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="block mb-1">Médecin *</label>
            <select
              v-model="visite.idMedecin"
              required
              class="w-full p-2 border rounded"
            >
              <option value="">Sélectionnez un médecin</option>
              <option
                v-for="medecin in medecins"
                :key="medecin.id_medecin"
                :value="medecin.id_medecin"
              >
                Dr. {{ medecin.nom }} {{ medecin.prenom }} ({{
                  medecin.specialite
                }})
              </option>
            </select>
          </div>

          <div class="mb-3 grid grid-cols-2 gap-2">
            <div>
              <label class="block mb-1">Date de la visite *</label>
              <input
                v-model="visite.dateVisiteDate"
                type="date"
                required
                class="w-full p-2 border rounded"
                :min="minDate"
              />
            </div>
            <div>
              <label class="block mb-1">Heure *</label>
              <input
                v-model="visite.dateVisiteTime"
                type="time"
                required
                class="w-full p-2 border rounded"
              />
            </div>
          </div>

          <div class="mb-3" v-if="patientSejours.length > 0">
            <label class="block mb-1">Séjour associé (optionnel)</label>
            <select v-model="visite.idSejour" class="w-full p-2 border rounded">
              <option value="">Aucun séjour associé</option>
              <option
                v-for="sejour in patientSejours"
                :key="sejour.id_sejour"
                :value="sejour.id_sejour"
              >
                Séjour #{{ sejour.id_sejour }} -
                {{ formatDate(sejour.date_arrivee) }}
                {{
                  sejour.date_sortie_reelle
                    ? `au ${formatDate(sejour.date_sortie_reelle)}`
                    : "(en cours)"
                }}
              </option>
            </select>
          </div>
        </div>

        <!-- Compte-rendu -->
        <div>
          <h3 class="font-semibold mb-2">Détails de la visite</h3>

          <div class="mb-3">
            <label class="block mb-1">Compte-rendu préliminaire *</label>
            <textarea
              v-model="visite.compteRendu"
              required
              class="w-full p-2 border rounded"
              rows="6"
              placeholder="Décrivez le motif de la visite et les objectifs..."
            ></textarea>
          </div>

          <div class="mb-3">
            <label class="block mb-1">Examens prévus</label>
            <textarea
              v-model="visite.examens"
              class="w-full p-2 border rounded"
              rows="3"
              placeholder="Listez les examens qui seront effectués..."
            ></textarea>
          </div>
        </div>
      </div>

      <!-- Section Diagnostics -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-semibold">Diagnostics</h3>
          <button
            type="button"
            @click="ajouterDiagnostic"
            class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Ajouter un diagnostic
          </button>
        </div>

        <div class="bg-gray-50 p-3 rounded border">
          <div
            v-if="visite.diagnostics.length === 0"
            class="text-gray-500 italic"
          >
            Aucun diagnostic ajouté
          </div>

          <div
            v-for="(diagnostic, index) in visite.diagnostics"
            :key="index"
            class="grid grid-cols-12 gap-2 mb-2"
          >
            <div class="col-span-3">
              <input
                v-model="diagnostic.code"
                type="text"
                placeholder="Code (ex: J45.9)"
                class="w-full p-2 border rounded"
              />
            </div>
            <div class="col-span-8">
              <input
                v-model="diagnostic.description"
                type="text"
                placeholder="Description du diagnostic"
                class="w-full p-2 border rounded"
              />
            </div>
            <div class="col-span-1 flex items-center">
              <button
                type="button"
                @click="supprimerDiagnostic(index)"
                class="p-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Section Prescriptions -->
      <div class="mb-4">
        <div class="flex justify-between items-center mb-2">
          <h3 class="font-semibold">Prescriptions</h3>
          <button
            type="button"
            @click="ajouterPrescription"
            class="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
          >
            Ajouter une prescription
          </button>
        </div>

        <div class="bg-gray-50 p-3 rounded border">
          <div
            v-if="visite.prescriptions.length === 0"
            class="text-gray-500 italic"
          >
            Aucune prescription ajoutée
          </div>

          <div
            v-for="(prescription, index) in visite.prescriptions"
            :key="index"
            class="grid grid-cols-12 gap-2 mb-2"
          >
            <div class="col-span-3">
              <input
                v-model="prescription.medicament"
                type="text"
                placeholder="Médicament"
                class="w-full p-2 border rounded"
              />
            </div>
            <div class="col-span-4">
              <input
                v-model="prescription.posologie"
                type="text"
                placeholder="Posologie (ex: 1cp 3x/jour)"
                class="w-full p-2 border rounded"
              />
            </div>
            <div class="col-span-4">
              <input
                v-model="prescription.duree"
                type="text"
                placeholder="Durée (ex: 7 jours)"
                class="w-full p-2 border rounded"
              />
            </div>
            <div class="col-span-1 flex items-center">
              <button
                type="button"
                @click="supprimerPrescription(index)"
                class="p-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-actions mt-4">
        <button
          type="button"
          @click="reinitialiserFormulaire"
          class="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 mr-2"
        >
          Annuler
        </button>
        <button
          type="submit"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          :disabled="envoiEnCours || !isFormValid"
        >
          {{ envoiEnCours ? "Enregistrement..." : "Enregistrer" }}
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AjouterVisiteMedicale",
  data() {
    const today = new Date();
    return {
      visite: {
        idPatient: "",
        idMedecin: "",
        dateVisiteDate: today.toISOString().split("T")[0],
        dateVisiteTime: "09:00",
        compteRendu: "",
        idSejour: "",
        examens: "",
        diagnostics: [],
        prescriptions: [],
      },
      patients: [],
      medecins: [],
      sejours: [],
      envoiEnCours: false,
      message: "",
      messageClasse: "bg-blue-100 text-blue-700 border border-blue-500",
      loading: {
        patients: false,
        medecins: false,
        sejours: false,
        submit: false,
      },
    };
  },
  computed: {
    minDate() {
      // La date d'aujourd'hui au format YYYY-MM-DD pour le champ date
      const today = new Date();
      return today.toISOString().split("T")[0];
    },
    patientSejours() {
      // Filtrer les séjours du patient sélectionné
      if (!this.visite.idPatient) return [];
      return this.sejours.filter(
        (sejour) => sejour.id_patient == this.visite.idPatient
      );
    },
    isFormValid() {
      return (
        this.visite.idPatient &&
        this.visite.idMedecin &&
        this.visite.dateVisiteDate &&
        this.visite.dateVisiteTime &&
        this.visite.compteRendu
      );
    },
  },
  mounted() {
    console.log("Composant AjouterVisiteMedicale monté");
    this.chargerDonnees();
  },
  methods: {
    async chargerDonnees() {
      this.fetchPatients();
      this.fetchMedecins();
      this.fetchSejours();
    },

    async fetchPatients() {
      try {
        this.loading.patients = true;
        console.log("Récupération des patients...");
        const response = await axios.get("http://localhost:3002/patients");
        this.patients = response.data;
        console.log("Patients récupérés:", this.patients);
      } catch (error) {
        console.error("Erreur lors de la récupération des patients:", error);
        this.afficherMessage({
          type: "error",
          text: "Erreur lors du chargement des patients. Veuillez réessayer.",
        });
      } finally {
        this.loading.patients = false;
      }
    },

    async fetchMedecins() {
      try {
        this.loading.medecins = true;
        console.log("Récupération des médecins...");
        const response = await axios.get("http://localhost:3002/medecins");
        this.medecins = response.data;
        console.log("Médecins récupérés:", this.medecins);
      } catch (error) {
        console.error("Erreur lors de la récupération des médecins:", error);
        this.afficherMessage({
          type: "error",
          text: "Erreur lors du chargement des médecins. Veuillez réessayer.",
        });
      } finally {
        this.loading.medecins = false;
      }
    },

    async fetchSejours() {
      try {
        this.loading.sejours = true;
        console.log("Récupération des séjours...");
        const response = await axios.get("http://localhost:3002/sejours");
        this.sejours = response.data;
        console.log("Séjours récupérés:", this.sejours);
      } catch (error) {
        console.error("Erreur lors de la récupération des séjours:", error);
        this.afficherMessage({
          type: "error",
          text: "Erreur lors du chargement des séjours. Veuillez réessayer.",
        });
      } finally {
        this.loading.sejours = false;
      }
    },

    ajouterDiagnostic() {
      this.visite.diagnostics.push({ code: "", description: "" });
    },

    supprimerDiagnostic(index) {
      this.visite.diagnostics.splice(index, 1);
    },

    ajouterPrescription() {
      this.visite.prescriptions.push({
        medicament: "",
        posologie: "",
        duree: "",
      });
    },

    supprimerPrescription(index) {
      this.visite.prescriptions.splice(index, 1);
    },

    async soumettreFormulaire() {
      if (!this.isFormValid) {
        this.afficherMessage(
          "Veuillez remplir tous les champs obligatoires",
          "error"
        );
        console.log("Validation échouée. Valeurs actuelles:", this.visite);
        return;
      }

      this.envoiEnCours = true;
      this.message = "";

      try {
        // Combiner la date et l'heure en un format ISO
        const dateVisite = new Date(
          `${this.visite.dateVisiteDate}T${this.visite.dateVisiteTime}`
        );
        const dateVisiteString = dateVisite.toISOString().split(".")[0];

        const requestData = {
          idPatient: this.visite.idPatient,
          idMedecin: this.visite.idMedecin,
          dateVisite: dateVisiteString,
          compteRendu: this.visite.compteRendu,
          idSejour: this.visite.idSejour || undefined,
          diagnostics: this.visite.diagnostics,
          prescriptions: this.visite.prescriptions,
        };

        console.log("Envoi des données:", requestData);

        const response = await axios.post(
          "http://localhost:3002/ajouterVisiteMedicale",
          requestData
        );
        console.log("Réponse du serveur:", response.data);

        this.afficherMessage("Visite médicale ajoutée avec succès", "success");

        this.reinitialiserFormulaire();
      } catch (error) {
        console.error("Erreur lors de l'ajout:", error);
        console.error("Détails de l'erreur:", error.response?.data);

        this.afficherMessage(
          "Erreur lors de l'ajout de la visite médicale: " +
            (error.response?.data?.error || error.message),
          "error"
        );
      } finally {
        this.envoiEnCours = false;
      }
    },

    afficherMessage(message, type) {
      if (typeof message === "object" && message.text) {
        this.message = message;
        type = message.type;
      } else {
        this.message = { text: message };
      }

      if (type === "error") {
        this.messageClasse = "bg-red-100 text-red-700 border border-red-500";
      } else if (type === "success") {
        this.messageClasse =
          "bg-green-100 text-green-700 border border-green-500";
      } else {
        this.messageClasse = "bg-blue-100 text-blue-700 border border-blue-500";
      }
    },

    reinitialiserFormulaire() {
      const today = new Date();
      this.visite = {
        idPatient: "",
        idMedecin: "",
        dateVisiteDate: today.toISOString().split("T")[0],
        dateVisiteTime: "09:00",
        compteRendu: "",
        idSejour: "",
        examens: "",
        diagnostics: [],
        prescriptions: [],
      };

      this.message = "";
    },

    formatDate(date) {
      if (!date) return "";
      const options = { day: "2-digit", month: "2-digit", year: "numeric" };
      return new Date(date).toLocaleDateString("fr-FR", options);
    },
  },
};
</script>

<style scoped>
input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4f46e5;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
