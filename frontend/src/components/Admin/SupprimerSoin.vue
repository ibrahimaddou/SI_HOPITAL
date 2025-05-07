<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Supprimer un soin</h2>

    <!-- Filtres de recherche -->
    <div class="mb-6 bg-white p-4 rounded shadow">
      <h3 class="font-semibold mb-3">Rechercher un soin</h3>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block mb-1">Patient</label>
          <select
            v-model="filtrePatient"
            class="w-full p-2 border rounded"
            @change="rechercherSoins"
          >
            <option value="">Tous les patients</option>
            <option
              v-for="patient in patients"
              :key="patient.id_patient"
              :value="patient.id_patient"
            >
              {{ patient.nom }} {{ patient.prenom }}
            </option>
          </select>
        </div>

        <div>
          <label class="block mb-1">Type de soin</label>
          <select
            v-model="filtreType"
            class="w-full p-2 border rounded"
            @change="rechercherSoins"
          >
            <option value="">Tous les types</option>
            <option value="traitement">Traitements médicamenteux</option>
            <option value="surveillance">Surveillance</option>
            <option value="operation">Opérations</option>
            <option value="rééducation">Rééducation</option>
          </select>
        </div>

        <div>
          <label class="block mb-1">Afficher uniquement</label>
          <select
            v-model="filtreStatut"
            class="w-full p-2 border rounded"
            @change="rechercherSoins"
          >
            <option value="">Tous les soins</option>
            <option value="actifs">
              Soins actifs (non commencés ou en cours)
            </option>
            <option value="planifies">Soins planifiés (non commencés)</option>
            <option value="termines">Soins terminés</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Liste des soins -->
    <div class="bg-white rounded shadow overflow-hidden">
      <div v-if="chargement" class="text-center py-8">
        <div
          class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
        ></div>
        <p class="mt-2 text-gray-600">Chargement des soins...</p>
      </div>

      <div
        v-else-if="soins.length === 0"
        class="text-center py-8 text-gray-500"
      >
        Aucun soin trouvé correspondant aux critères de recherche.
      </div>

      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="soin in soins"
          :key="soin.id_soin"
          class="p-4 hover:bg-gray-50"
          :class="{ 'bg-red-50': soinSelectionne === soin.id_soin }"
        >
          <div class="flex flex-col md:flex-row justify-between">
            <div class="mb-2 md:mb-0">
              <h4 class="font-semibold text-lg">{{ soin.description }}</h4>
              <p class="text-gray-600">
                <span class="font-medium">Patient :</span>
                {{ soin.patient ? soin.patient.nom : "Inconnu" }}
                {{ soin.patient ? soin.patient.prenom : "" }}
              </p>
              <p class="text-gray-600">
                <span class="font-medium">Décidé lors de la réunion du :</span>
                {{
                  formatDate(soin.reunion ? soin.reunion.date_reunion : null)
                }}
              </p>

              <div
                v-if="soin.administrations && soin.administrations.length > 0"
                class="mt-2"
              >
                <p class="font-medium">Administrations :</p>
                <ul class="list-disc pl-5 text-sm">
                  <li
                    v-for="admin in soin.administrations.slice(0, 3)"
                    :key="admin.id_administration"
                  >
                    {{ formatDateTime(admin.date_heure) }} par
                    {{ admin.infirmier ? admin.infirmier.prenom : "Inconnu" }}
                    {{ admin.infirmier ? admin.infirmier.nom : "" }}
                  </li>
                  <li v-if="soin.administrations.length > 3" class="italic">
                    Et {{ soin.administrations.length - 3 }} autre(s)
                    administration(s)...
                  </li>
                </ul>
              </div>

              <div
                v-if="soin.medicaments && soin.medicaments.length > 0"
                class="mt-2"
              >
                <p class="font-medium">Médicaments :</p>
                <ul class="list-disc pl-5 text-sm">
                  <li v-for="med in soin.medicaments" :key="med.id_medicament">
                    {{ med.nom }} - {{ med.quantite }}
                  </li>
                </ul>
              </div>
            </div>

            <div class="flex flex-col items-end justify-between">
              <span
                class="px-2 py-1 text-xs rounded-full mb-2"
                :class="getStatutClass(soin)"
              >
                {{ getStatutLabel(soin) }}
              </span>

              <button
                v-if="peutEtreSupprime(soin)"
                @click="selectionnerSoin(soin.id_soin)"
                class="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600"
              >
                Supprimer
              </button>
              <span v-else class="text-xs text-gray-500 italic">
                {{ getRaisonNonSupprimable(soin) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation -->
    <div
      v-if="modalVisible"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
        <h3 class="text-lg font-bold mb-4 text-red-600">
          Confirmation de suppression
        </h3>

        <div v-if="soinASupprimer">
          <p class="mb-4">
            Vous êtes sur le point de supprimer le soin suivant :
          </p>

          <div class="mb-4 bg-gray-50 p-3 rounded">
            <p>
              <span class="font-semibold">Description :</span>
              {{ soinASupprimer.description }}
            </p>
            <p>
              <span class="font-semibold">Patient :</span>
              {{
                soinASupprimer.patient ? soinASupprimer.patient.nom : "Inconnu"
              }}
              {{ soinASupprimer.patient ? soinASupprimer.patient.prenom : "" }}
            </p>
            <p
              v-if="
                soinASupprimer.medicaments &&
                soinASupprimer.medicaments.length > 0
              "
            >
              <span class="font-semibold">Médicaments :</span>
              {{ soinASupprimer.medicaments.map((m) => m.nom).join(", ") }}
            </p>
          </div>

          <div class="mb-4">
            <label class="block font-semibold mb-2"
              >Raison de la suppression :</label
            >
            <textarea
              v-model="raisonSuppression"
              rows="3"
              required
              class="w-full p-2 border rounded"
              placeholder="Précisez pourquoi ce soin doit être supprimé"
            ></textarea>
          </div>

          <div class="flex items-center mb-4">
            <input
              v-model="confirmationSuppression"
              type="checkbox"
              id="confirmation"
              class="mr-2"
            />
            <label for="confirmation"
              >Je confirme vouloir supprimer définitivement ce soin</label
            >
          </div>

          <div class="flex justify-end space-x-3">
            <button
              @click="fermerModal"
              class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Annuler
            </button>
            <button
              @click="confirmerSuppression"
              class="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:bg-red-300 disabled:cursor-not-allowed"
              :disabled="
                !raisonSuppression ||
                !confirmationSuppression ||
                suppressionEnCours
              "
            >
              {{
                suppressionEnCours
                  ? "Suppression en cours..."
                  : "Supprimer définitivement"
              }}
            </button>
          </div>
        </div>
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
      soins: [],
      patients: [],
      filtrePatient: "",
      filtreType: "",
      filtreStatut: "actifs",
      soinSelectionne: null,
      soinASupprimer: null,
      modalVisible: false,
      raisonSuppression: "",
      confirmationSuppression: false,
      chargement: true,
      suppressionEnCours: false,
      message: "",
      messageClasse: "",
    };
  },
  mounted() {
    this.chargerPatients();
    this.rechercherSoins();
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
        });
    },

    rechercherSoins() {
      this.chargement = true;

      let url = "http://localhost:3002/soins";
      const params = new URLSearchParams();

      if (this.filtrePatient) {
        params.append("patient", this.filtrePatient);
      }

      if (this.filtreType) {
        params.append("type", this.filtreType);
      }

      if (this.filtreStatut) {
        params.append("statut", this.filtreStatut);
      }

      if (params.toString()) {
        url += "?" + params.toString();
      }

      axios
        .get(url)
        .then((response) => {
          this.soins = response.data;
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des soins:", error);
          this.afficherMessage("Impossible de charger les soins", "error");
        })
        .finally(() => {
          this.chargement = false;
        });
    },

    formatDate(date) {
      if (!date) return "";
      const d = new Date(date);
      return d.toLocaleDateString("fr-FR", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },

    formatDateTime(dateTime) {
      if (!dateTime) return "";
      const d = new Date(dateTime);
      return d.toLocaleString("fr-FR");
    },

    getStatutClass(soin) {
      switch (soin.statut) {
        case "actif":
          return "bg-yellow-100 text-yellow-800";
        case "termine":
          return "bg-green-100 text-green-800";
        case "annule":
          return "bg-red-100 text-red-800";
        default:
          return "bg-gray-100 text-gray-800";
      }
    },

    getStatutLabel(soin) {
      switch (soin.statut) {
        case "actif":
          return "Actif";
        case "termine":
          return "Terminé";
        case "annule":
          return "Annulé";
        default:
          return "Non défini";
      }
    },

    peutEtreSupprime(soin) {
      return soin.statut !== "termine"; // Exemple : on ne peut pas supprimer les soins terminés
    },

    getRaisonNonSupprimable(soin) {
      if (soin.statut === "termine") {
        return "Ce soin est terminé et ne peut pas être supprimé.";
      }
      return "Ce soin ne peut pas être supprimé pour d'autres raisons.";
    },

    selectionnerSoin(id) {
      this.soinSelectionne = id;
      this.soinASupprimer = this.soins.find((soin) => soin.id_soin === id);
      this.modalVisible = true;
    },

    fermerModal() {
      this.modalVisible = false;
      this.soinASupprimer = null;
      this.raisonSuppression = "";
      this.confirmationSuppression = false;
    },

    confirmerSuppression() {
      this.suppressionEnCours = true;

      axios
        .delete(
          `http://localhost:3002/supprimerSoin/${this.soinASupprimer.id_soin}`,
          {
            data: { raison: this.raisonSuppression },
          }
        )
        .then(() => {
          this.afficherMessage("Soin supprimé avec succès", "success");
          this.rechercherSoins(); // Recharge les soins après suppression
          this.fermerModal();
        })
        .catch(() => {
          this.afficherMessage(
            "Erreur lors de la suppression du soin",
            "error"
          );
        })
        .finally(() => {
          this.suppressionEnCours = false;
        });
    },

    afficherMessage(message, type) {
      this.message = message;
      this.messageClasse =
        type === "error" ? "bg-red-500 text-white" : "bg-green-500 text-white";
    },
  },
};
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

input:focus,
select:focus,
textarea:focus {
  outline: none;
  border-color: #4f46e5;
}
</style>
