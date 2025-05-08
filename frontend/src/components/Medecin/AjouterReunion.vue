<template>
  <div class="ajouter-reunion">
    <h1>Planifier une réunion</h1>

    <!-- Message d'alerte -->
    <div v-if="message" class="alert" :class="message.type">
      {{ message.text }}
    </div>

    <div class="formulaire-container">
      <form @submit.prevent="soumettreFormulaire">
        <div class="section">
          <h2>Informations sur la réunion</h2>

          <div class="form-row">
            <div class="form-group">
              <label for="dateReunionDate">Date de la réunion</label>
              <input
                type="date"
                id="dateReunionDate"
                v-model="formulaire.dateReunionDate"
                required
                class="form-control"
                :min="minDate"
              />
            </div>

            <div class="form-group">
              <label for="dateReunionTime">Heure de la réunion</label>
              <input
                type="time"
                id="dateReunionTime"
                v-model="formulaire.dateReunionTime"
                required
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="sujet">Sujet</label>
            <input
              type="text"
              id="sujet"
              v-model="formulaire.sujet"
              required
              class="form-control"
              placeholder="Ex: Discussion des cas prioritaires"
            />
          </div>

          <div class="form-group">
            <label for="compteRendu"
              >Compte rendu préliminaire (optionnel)</label
            >
            <textarea
              id="compteRendu"
              v-model="formulaire.compteRendu"
              class="form-control"
              rows="4"
              placeholder="Points à aborder, objectifs de la réunion..."
            ></textarea>
          </div>
        </div>

        <div class="section">
          <h2>Participants</h2>

          <!-- Section médecins avec défilement -->
          <div class="participants-section">
            <h3>Médecins participants</h3>
            <div class="participants-list">
              <div v-if="medecins.length > 0" class="participant-items">
                <div
                  v-for="medecin in medecins"
                  :key="'med-' + medecin.id_personne"
                  class="participant-item"
                >
                  <input
                    type="checkbox"
                    :id="'medecin-' + medecin.id_personne"
                    :value="medecin.id_personne"
                    v-model="formulaire.medecinIds"
                  />
                  <label :for="'medecin-' + medecin.id_personne">
                    {{ medecin.nom }} {{ medecin.prenom }} ({{
                      medecin.specialite
                    }})
                  </label>
                </div>
              </div>
              <div v-else class="no-participants">
                Chargement des médecins...
              </div>
            </div>
          </div>

          <!-- Section infirmiers avec défilement -->
          <div class="participants-section">
            <h3>Infirmiers participants</h3>
            <div class="participants-list">
              <div v-if="infirmiers.length > 0" class="participant-items">
                <div
                  v-for="infirmier in infirmiers"
                  :key="'inf-' + infirmier.id_personne"
                  class="participant-item"
                >
                  <input
                    type="checkbox"
                    :id="'infirmier-' + infirmier.id_personne"
                    :value="infirmier.id_personne"
                    v-model="formulaire.infirmierIds"
                  />
                  <label :for="'infirmier-' + infirmier.id_personne">
                    {{ infirmier.nom }} {{ infirmier.prenom }} ({{
                      infirmier.qualification || "Infirmier"
                    }})
                  </label>
                </div>
              </div>
              <div v-else class="no-participants">
                Chargement des infirmiers...
              </div>
            </div>
          </div>

          <div
            class="form-message"
            v-if="
              formulaire.medecinIds.length === 0 &&
              formulaire.infirmierIds.length === 0
            "
          >
            Veuillez sélectionner au moins un participant
          </div>
        </div>

        <div class="form-actions">
          <button
            type="button"
            class="btn btn-secondary"
            @click="reinitialiserFormulaire"
          >
            Annuler
          </button>
          <button
            type="submit"
            class="btn btn-primary"
            :disabled="envoiEnCours || !formulaireValide"
          >
            {{ envoiEnCours ? "Enregistrement..." : "Planifier la réunion" }}
          </button>
        </div>
      </form>
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
        dateReunionDate: new Date().toISOString().split("T")[0],
        dateReunionTime: "14:00",
        sujet: "",
        compteRendu: "",
        medecinIds: [],
        infirmierIds: [],
      },
      medecins: [],
      infirmiers: [],
      envoiEnCours: false,
      message: null,
      loading: {
        medecins: false,
        infirmiers: false,
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
    formulaireValide() {
      return (
        this.formulaire.dateReunionDate &&
        this.formulaire.dateReunionTime &&
        this.formulaire.sujet &&
        (this.formulaire.medecinIds.length > 0 ||
          this.formulaire.infirmierIds.length > 0)
      );
    },
  },
  mounted() {
    console.log("Composant AjouterReunion monté");
    this.chargerMedecins();
    this.chargerInfirmiers();
  },
  methods: {
    async chargerMedecins() {
      try {
        this.loading.medecins = true;
        console.log("Récupération des médecins...");
        const response = await axios.get("http://localhost:3002/medecins");
        this.medecins = response.data;
        console.log("Médecins récupérés:", this.medecins);
      } catch (error) {
        console.error("Erreur lors de la récupération des médecins:", error);
        this.afficherMessage(
          "Erreur lors du chargement des médecins. Veuillez réessayer.",
          "error"
        );
      } finally {
        this.loading.medecins = false;
      }
    },

    async chargerInfirmiers() {
      try {
        this.loading.infirmiers = true;
        console.log("Récupération des infirmiers...");
        const response = await axios.get("http://localhost:3002/infirmiers");
        this.infirmiers = response.data;
        console.log("Infirmiers récupérés:", this.infirmiers);
      } catch (error) {
        console.error("Erreur lors de la récupération des infirmiers:", error);
        this.afficherMessage(
          "Erreur lors du chargement des infirmiers. Veuillez réessayer.",
          "error"
        );
      } finally {
        this.loading.infirmiers = false;
      }
    },

    formatDateTimeForAPI(date, time) {
      // Combiner la date et l'heure en un format ISO
      const dateReunion = new Date(`${date}T${time}`);
      return dateReunion.toISOString().split(".")[0]; // Sans les millisecondes
    },

    async soumettreFormulaire() {
      if (!this.formulaireValide) {
        this.afficherMessage(
          "Veuillez remplir tous les champs obligatoires et sélectionner au moins un participant.",
          "error"
        );
        return;
      }

      this.envoiEnCours = true;

      try {
        const donneesReunion = {
          dateReunion: this.formatDateTimeForAPI(
            this.formulaire.dateReunionDate,
            this.formulaire.dateReunionTime
          ),
          sujet: this.formulaire.sujet,
          compteRendu: this.formulaire.compteRendu || null,
          medecinIds: [...this.formulaire.medecinIds],
          infirmierIds: [...this.formulaire.infirmierIds],
        };

        console.log(
          "Envoi des données pour créer une réunion:",
          donneesReunion
        );

        const response = await axios.post(
          "http://localhost:3002/reunions",
          donneesReunion
        );

        console.log("Réponse du serveur:", response);

        this.afficherMessage(
          "La réunion a été planifiée avec succès",
          "success"
        );
        this.reinitialiserFormulaire();
      } catch (error) {
        console.error("Erreur lors de la planification de la réunion:", error);

        let messageErreur = "Erreur lors de la planification de la réunion.";

        if (error.response) {
          console.log("Détails de l'erreur:", error.response);
          if (error.response.data && error.response.data.message) {
            messageErreur = error.response.data.message;
          } else if (error.response.data && error.response.data.error) {
            messageErreur = error.response.data.error;
          }
        }

        this.afficherMessage(messageErreur, "error");
      } finally {
        this.envoiEnCours = false;
      }
    },

    reinitialiserFormulaire() {
      this.formulaire = {
        dateReunionDate: new Date().toISOString().split("T")[0],
        dateReunionTime: "14:00",
        sujet: "",
        compteRendu: "",
        medecinIds: [],
        infirmierIds: [],
      };

      this.message = null;
    },

    afficherMessage(texte, type) {
      this.message = {
        text: texte,
        type: type,
      };
    },
  },
};
</script>

<style scoped>
.ajouter-reunion {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 20px;
}

.alert {
  padding: 10px 15px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #ccc;
}

.alert.success {
  background-color: #dff0d8;
  border-color: #d6e9c6;
  color: #3c763d;
}

.alert.error {
  background-color: #f2dede;
  border-color: #ebccd1;
  color: #a94442;
}

.formulaire-container {
  background-color: #fff;
  padding: 25px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border: 1px solid #ddd;
}

.section {
  margin-bottom: 25px;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.section h2 {
  color: #2c3e50;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
}

.form-row {
  display: flex;
  gap: 15px;
}

.form-row .form-group {
  flex: 1;
}

.form-group {
  margin-bottom: 15px;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
  font-size: 14px;
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
  font-size: 16px;
  margin-bottom: 10px;
  color: #2c3e50;
}

.participants-list {
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 10px;
}

.participant-item {
  margin-bottom: 8px;
  display: flex;
  align-items: center;
}

.participant-item input[type="checkbox"] {
  margin-right: 8px;
}

.no-participants {
  padding: 10px;
  color: #6c757d;
  font-style: italic;
}

.form-message {
  font-size: 14px;
  color: #6c757d;
  margin-top: 10px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
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
  opacity: 0.65;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}
</style>
