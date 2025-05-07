<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">
      Ajouter un compte-rendu de visite médicale
    </h2>

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

          <div class="mb-3">
            <label class="block mb-1">Date de la visite *</label>
            <input
              v-model="visite.dateVisite"
              type="datetime-local"
              required
              class="w-full p-2 border rounded"
            />
          </div>

          <div class="mb-3">
            <label class="block mb-1">Séjour associé (optionnel)</label>
            <select v-model="visite.idSejour" class="w-full p-2 border rounded">
              <option value="">Aucun séjour associé</option>
              <option
                v-for="sejour in sejours"
                :key="sejour.id_sejour"
                :value="sejour.id_sejour"
              >
                Séjour #{{ sejour.id_sejour }} -
                {{ formatDate(sejour.date_arrivee) }}
              </option>
            </select>
          </div>
        </div>

        <!-- Compte-rendu -->
        <div>
          <h3 class="font-semibold mb-2">Compte-rendu médical</h3>

          <div class="mb-3">
            <label class="block mb-1">Compte-rendu de la visite *</label>
            <textarea
              v-model="visite.compteRendu"
              required
              class="w-full p-2 border rounded"
              rows="9"
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

      <!-- Débug des valeurs du formulaire -->
      <div class="mb-4 p-3 bg-gray-100 rounded">
        <h3 class="font-semibold mb-2">Valeurs actuelles (débug):</h3>
        <pre class="text-xs">{{ JSON.stringify(visite, null, 2) }}</pre>
      </div>

      <div class="mt-4">
        <button
          type="submit"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          :disabled="envoiEnCours"
        >
          {{ envoiEnCours ? "Enregistrement..." : "Enregistrer" }}
        </button>
      </div>

      <div v-if="message" class="mt-4 p-2 rounded" :class="messageClasse">
        {{ message }}
      </div>
    </form>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      visite: {
        idPatient: "",
        idMedecin: "",
        dateVisite: new Date().toISOString().slice(0, 16),
        compteRendu: "",
        idSejour: "",
        diagnostics: [],
        prescriptions: [],
      },
      patients: [],
      medecins: [],
      sejours: [],
      envoiEnCours: false,
      message: "",
      messageClasse: "",
    };
  },
  mounted() {
    this.chargerDonnees();
  },
  methods: {
    chargerDonnees() {
      // Charger les patients
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

      // Charger les médecins
      axios
        .get("http://localhost:3002/medecins")
        .then((response) => {
          this.medecins = response.data;
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des médecins:", error);
          this.afficherMessage(
            "Erreur lors du chargement des médecins",
            "error"
          );
        });

      // Charger les séjours actifs
      axios
        .get("http://localhost:3002/sejours")
        .then((response) => {
          this.sejours = response.data;
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des séjours:", error);
          this.afficherMessage(
            "Erreur lors du chargement des séjours",
            "error"
          );
        });
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

    soumettreFormulaire() {
      // Vérification des champs obligatoires
      if (
        !this.visite.idPatient ||
        !this.visite.idMedecin ||
        !this.visite.dateVisite ||
        !this.visite.compteRendu
      ) {
        this.afficherMessage(
          "Veuillez remplir tous les champs obligatoires",
          "error"
        );
        console.log("Validation échouée. Valeurs actuelles:", this.visite);
        return;
      }

      this.envoiEnCours = true;
      this.message = "";

      console.log("Envoi des données:", this.visite);

      axios
        .post("http://localhost:3002/ajouterVisiteMedicale", this.visite)
        .then((response) => {
          console.log("Réponse du serveur:", response.data);
          this.afficherMessage(
            "Visite médicale ajoutée avec succès",
            "success"
          );
          this.reinitialiserFormulaire();
        })
        .catch((error) => {
          console.error("Erreur lors de l'ajout:", error);
          console.error("Détails de l'erreur:", error.response?.data);
          this.afficherMessage(
            "Erreur lors de l'ajout de la visite médicale: " +
              (error.response?.data?.error || error.message),
            "error"
          );
        })
        .finally(() => {
          this.envoiEnCours = false;
        });
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

    reinitialiserFormulaire() {
      this.visite = {
        idPatient: "",
        idMedecin: "",
        dateVisite: new Date().toISOString().slice(0, 16),
        compteRendu: "",
        idSejour: "",
        diagnostics: [],
        prescriptions: [],
      };
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
</style>
