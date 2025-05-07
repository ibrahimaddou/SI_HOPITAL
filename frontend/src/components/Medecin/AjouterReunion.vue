<template>
  <div class="ajouter-reunion">
    <h1>Ajouter une nouvelle réunion</h1>

    <div class="formulaire-container">
      <form @submit.prevent="soumettreFormulaire">
        <div class="section">
          <h2>Informations sur la réunion</h2>

          <div class="form-group">
            <label for="dateReunion">Date et heure de la réunion</label>
            <input
              type="datetime-local"
              id="dateReunion"
              v-model="formulaire.dateReunion"
              required
              class="form-control"
            />
          </div>

          <div class="form-group">
            <label for="sujet">Sujet</label>
            <input
              type="text"
              id="sujet"
              v-model="formulaire.sujet"
              required
              class="form-control"
              placeholder="Sujet de la réunion"
            />
          </div>

          <div class="form-group">
            <label for="compteRendu">Compte rendu</label>
            <textarea
              id="compteRendu"
              v-model="formulaire.compteRendu"
              class="form-control"
              rows="4"
              placeholder="Le compte rendu peut être ajouté ultérieurement"
            ></textarea>
          </div>
        </div>

        <div class="section">
          <h2>Participants</h2>

          <!-- Section médecins avec défilement -->
          <div class="participants-section">
            <h3>Médecins participants</h3>
            <div class="checkbox-container">
              <div v-if="medecins.length > 0" class="checkbox-group">
                <div
                  v-for="medecin in medecins"
                  :key="'med-' + medecin.id_medecin"
                  class="checkbox-item"
                >
                  <input
                    type="checkbox"
                    :id="'medecin-' + medecin.id_medecin"
                    :value="medecin.id_medecin"
                    @change="toggleSelection('medecin', $event)"
                  />
                  <label :for="'medecin-' + medecin.id_medecin">
                    {{ medecin.nom }} {{ medecin.prenom }} ({{
                      medecin.specialite
                    }})
                  </label>
                </div>
              </div>
              <div v-else class="loading-message">
                Chargement des médecins...
              </div>
            </div>
          </div>

          <!-- Section infirmiers avec défilement -->
          <div class="participants-section">
            <h3>Infirmiers participants</h3>
            <div class="checkbox-container">
              <div v-if="infirmiers.length > 0" class="checkbox-group">
                <div
                  v-for="infirmier in infirmiers"
                  :key="'inf-' + infirmier.id_infirmier"
                  class="checkbox-item"
                >
                  <input
                    type="checkbox"
                    :id="'infirmier-' + infirmier.id_infirmier"
                    :value="infirmier.id_infirmier"
                    @change="toggleSelection('infirmier', $event)"
                  />
                  <label :for="'infirmier-' + infirmier.id_infirmier">
                    {{ infirmier.nom }} {{ infirmier.prenom }} ({{
                      infirmier.poste || ""
                    }})
                  </label>
                </div>
              </div>
              <div v-else class="loading-message">
                Chargement des infirmiers...
              </div>
            </div>
          </div>

          <div class="form-info">
            <p>Au moins un participant est requis pour la réunion</p>
          </div>
        </div>

        <div class="btn-group">
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="envoiEnCours || !formulaireValide"
          >
            {{ envoiEnCours ? "Enregistrement..." : "Enregistrer" }}
          </button>
          <button
            type="button"
            class="btn btn-secondary"
            @click="reinitialiserFormulaire"
          >
            Réinitialiser
          </button>
        </div>
      </form>
    </div>

    <div class="debugage">
      <h3>Déboggage:</h3>
      <div>
        <strong>Médecins sélectionnés:</strong>
        {{ debugMedecins }}
      </div>
      <div>
        <strong>Infirmiers sélectionnés:</strong>
        {{ debugInfirmiers }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "AjouterReunion",
  data() {
    return {
      formulaire: {
        dateReunion: this.formatDateTimeForInput(new Date()),
        sujet: "",
        compteRendu: "",
        medecinIds: [],
        infirmierIds: [],
      },
      medecins: [],
      infirmiers: [],
      envoiEnCours: false,
      messageErreur: null,
    };
  },
  computed: {
    formulaireValide() {
      return (
        this.formulaire.dateReunion &&
        this.formulaire.sujet &&
        (this.formulaire.medecinIds.length > 0 ||
          this.formulaire.infirmierIds.length > 0)
      );
    },
    // Propriétés calculées pour l'affichage de débogage
    debugMedecins() {
      // Joindre les IDs avec une virgule et un espace
      return this.formulaire.medecinIds.length > 0
        ? this.formulaire.medecinIds.map((id) => String(id)).join(", ")
        : "Aucun";
    },
    debugInfirmiers() {
      // Joindre les IDs avec une virgule et un espace
      return this.formulaire.infirmierIds.length > 0
        ? this.formulaire.infirmierIds.map((id) => String(id)).join(", ")
        : "Aucun";
    },
  },
  created() {
    this.chargerDonnees();
  },
  methods: {
    formatDateTimeForInput(date) {
      const d = new Date(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");

      // Format pour l'input datetime-local (YYYY-MM-DDThh:mm)
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    },

    // Format pour l'affichage seulement (pas utilisé pour l'envoi au serveur)
    formatDateForDisplay(dateTimeString) {
      const d = new Date(dateTimeString);
      const year = String(d.getFullYear()).slice(-2); // Prendre que les 2 derniers chiffres
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");

      return `${year}/${month}/${day} ${hours}:${minutes}`;
    },

    async chargerDonnees() {
      try {
        // Charger les médecins et infirmiers en parallèle
        const [medecinResponse, infirmierResponse] = await Promise.all([
          axios.get("http://localhost:3002/medecins"),
          axios.get("http://localhost:3002/infirmiers"),
        ]);

        // S'assurer que les IDs sont des nombres
        this.medecins = medecinResponse.data.map((med) => ({
          ...med,
          id_medecin: Number(med.id_medecin),
        }));

        this.infirmiers = infirmierResponse.data.map((inf) => ({
          ...inf,
          id_infirmier: Number(inf.id_infirmier),
        }));

        console.log("Médecins chargés:", this.medecins);
        console.log("Infirmiers chargés:", this.infirmiers);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        this.afficherMessage(
          "Erreur lors du chargement des données du personnel",
          "error"
        );
      }
    },

    // Méthode unifiée pour gérer la sélection
    toggleSelection(type, event) {
      const isChecked = event.target.checked;
      const idValue = event.target.value;
      const idsList = type === "medecin" ? "medecinIds" : "infirmierIds";

      // S'assurer que l'ID est un nombre valide
      const idNumber = parseInt(idValue, 10);

      if (isNaN(idNumber)) {
        console.error(`ID invalide: ${idValue}`);
        return;
      }

      if (isChecked) {
        // Vérifier si l'ID n'est pas déjà dans la liste pour éviter les doublons
        if (!this.formulaire[idsList].includes(idNumber)) {
          this.formulaire[idsList].push(idNumber);
        }
      } else {
        // Filtrer l'ID à supprimer
        this.formulaire[idsList] = this.formulaire[idsList].filter(
          (item) => item !== idNumber
        );
      }

      console.log(
        `${type} ${idNumber} ${isChecked ? "ajouté" : "retiré"}`,
        this.formulaire[idsList]
      );
    },

    soumettreFormulaire() {
      if (!this.formulaireValide) {
        this.afficherMessage(
          "Veuillez remplir tous les champs obligatoires",
          "error"
        );
        return;
      }

      this.envoiEnCours = true;

      const donneesReunion = {
        // Conserver le format ISO pour l'API
        dateReunion: this.formulaire.dateReunion,
        sujet: this.formulaire.sujet,
        compteRendu: this.formulaire.compteRendu,
        medecinIds: [...this.formulaire.medecinIds].map((id) => Number(id)),
        infirmierIds: [...this.formulaire.infirmierIds].map((id) => Number(id)),
      };

      axios
        .post("http://localhost:3002/reunions", donneesReunion)
        .then((response) => {
          this.afficherMessage("Réunion ajoutée avec succès", "success");
          console.log("Réunion créée:", response.data);
          this.reinitialiserFormulaire();
        })
        .catch((error) => {
          console.error("Erreur lors de l'ajout:", error);
          this.afficherMessage(
            "Erreur lors de l'ajout de la réunion: " +
              (error.response?.data?.error || error.message),
            "error"
          );
        })
        .finally(() => {
          this.envoiEnCours = false;
        });
    },

    reinitialiserFormulaire() {
      this.formulaire = {
        dateReunion: this.formatDateTimeForInput(new Date()),
        sujet: "",
        compteRendu: "",
        medecinIds: [],
        infirmierIds: [],
      };

      // Décocher toutes les cases à cocher
      document
        .querySelectorAll('.checkbox-item input[type="checkbox"]')
        .forEach((checkbox) => {
          checkbox.checked = false;
        });
    },

    afficherMessage(message, type) {
      // Utiliser votre système de notification ici
      // Si vous utilisez un système comme Toastify ou un système personnalisé
      if (type === "success") {
        this.$toast ? this.$toast.success(message) : alert(message);
      } else if (type === "error") {
        this.$toast ? this.$toast.error(message) : alert(message);
      }
    },
  },
};
</script>

<style scoped>
.ajouter-reunion {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.formulaire-container {
  background-color: #f8f9fa;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}

.section {
  margin-bottom: 25px;
}

.section h2 {
  color: #2c3e50;
  border-bottom: 1px solid #ddd;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-control {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ced4da;
  border-radius: 4px;
}

textarea.form-control {
  resize: vertical;
}

.participants-section {
  margin-bottom: 20px;
}

h3 {
  font-size: 18px;
  margin-bottom: 10px;
  color: #2c3e50;
}

.checkbox-container {
  border: 1px solid #ddd;
  border-radius: 4px;
}

.checkbox-group {
  max-height: 200px;
  overflow-y: auto;
  padding: 10px;
}

.checkbox-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.checkbox-item input[type="checkbox"] {
  margin-right: 8px;
}

.form-info {
  font-size: 14px;
  color: #6c757d;
  margin-top: 10px;
}

.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 8px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  border: none;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover {
  background-color: #0069d9;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.loading-message {
  padding: 10px;
  color: #6c757d;
  font-style: italic;
}

.debugage {
  margin-top: 30px;
  padding: 15px;
  background-color: #f1f1f1;
  border-radius: 8px;
  font-size: 14px;
}

.debugage h3 {
  margin-top: 0;
  margin-bottom: 10px;
}
</style>
