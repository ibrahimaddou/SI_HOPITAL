<template>
  <div class="container mx-auto p-4">
    <button @click="chargerPatients" class="btn-charger">Charger les patients</button>

    <div v-if="chargement">Chargement en cours...</div>

    <div v-if="erreur" class="erreur">{{ erreur }}</div>

    <!-- Modal de confirmation -->
    <div v-if="showConfirmModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Confirmation de suppression</h3>
        <p>Êtes-vous sûr de vouloir supprimer le patient {{ patientASupprimer.prenom }} {{ patientASupprimer.nom }} ?</p>
        <div class="modal-buttons">
          <button @click="confirmerSuppression" class="btn-confirmer">Confirmer</button>
          <button @click="annulerSuppression" class="btn-annuler">Annuler</button>
        </div>
      </div>
    </div>

    <!-- Liste des patients -->
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
              Antécédents médicaux
            </th>
            <th
              class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="(patient, index) in patients" :key="index">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ patient.id_patient }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.nom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">{{ patient.prenom }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formaterDate(patient.date_naissance) }}
            </td>
            <td class="px-6 py-4">
              {{ patient.antecedents_medicaux }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <button @click="demanderSuppression(patient)" class="btn-supprimer">
                Supprimer
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Message de succès après suppression -->
    <div v-if="messageSuccess" class="success-message">
      {{ messageSuccess }}
    </div>

    <!-- Message si aucun patient trouvé après tentative de chargement -->
    <div
      v-if="
        !chargement && !erreur && patientsCherches && patients.length === 0
      "
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
      patientsCherches: false,
      showConfirmModal: false,
      patientASupprimer: null,
      messageSuccess: null
    };
  },
  methods: {
    chargerPatients() {
      this.chargement = true;
      this.erreur = null;
      this.messageSuccess = null;

      axios
        .get("http://localhost:3002/patients")
        .then((response) => {
          if (response.data && response.data.patients) {
            this.patients = response.data.patients;
          } else if (Array.isArray(response.data)) {
            this.patients = response.data;
          } else {
            this.erreur = "Format de réponse incorrect";
            console.error("Format incorrect:", response.data);
          }
          this.patientsCherches = true;
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
    
    formaterDate(dateStr) {
      // Convertir la date au format français si nécessaire
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('fr-FR');
    },

    demanderSuppression(patient) {
      this.patientASupprimer = patient;
      this.showConfirmModal = true;
    },

    confirmerSuppression() {
      if (!this.patientASupprimer) return;
      
      this.chargement = true;
      this.erreur = null;
      this.messageSuccess = null;

      axios
        .delete(`http://localhost:3002/supprimerPatients/${this.patientASupprimer.id_patient}`)
        .then(() => {
          // Retirer le patient de la liste
          this.patients = this.patients.filter(
            (p) => p.id_patient !== this.patientASupprimer.id_patient
          );
          this.messageSuccess = `Le patient ${this.patientASupprimer.prenom} ${this.patientASupprimer.nom} a été supprimé avec succès.`;
        })
        .catch((error) => {
          if (error.response) {
            // Récupérer le message d'erreur du serveur
            this.erreur = error.response.data.error || "Erreur lors de la suppression du patient";
          } else {
            this.erreur = "Erreur de connexion au serveur";
          }
          console.error("Erreur de suppression:", error);
        })
        .finally(() => {
          this.chargement = false;
          this.showConfirmModal = false;
          this.patientASupprimer = null;
        });
    },

    annulerSuppression() {
      this.showConfirmModal = false;
      this.patientASupprimer = null;
    }
  }
};
</script>

<style scoped>
.erreur {
  color: red;
  margin: 10px 0;
  padding: 10px;
  background-color: #ffebee;
  border-radius: 4px;
}

.success-message {
  color: green;
  margin: 10px 0;
  padding: 10px;
  background-color: #e8f5e9;
  border-radius: 4px;
}

button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-charger {
  margin-top: 15px;
  background-color: #4caf50;
  color: white;
}

.btn-charger:hover {
  background-color: #45a049;
}

.btn-supprimer {
  background-color: #f44336;
  color: white;
}

.btn-supprimer:hover {
  background-color: #d32f2f;
}

.btn-confirmer {
  background-color: #f44336;
  color: white;
  margin-right: 10px;
}

.btn-annuler {
  background-color: #9e9e9e;
  color: white;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
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

/* Styles pour la modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.modal-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 20px;
}
</style>