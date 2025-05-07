// SOLUTION COMPLÈTE POUR LE COMPOSANT VUE
<template>
  <div class="container mx-auto p-4">
    <!-- Formulaire de recherche du soin -->

    <div
      v-if="!soinTrouve && !chargementEnCours"
      class="bg-white p-4 rounded shadow mb-4"
    >
      <h2 class="text-xl font-bold mb-4">Rechercher un soin à modifier</h2>
      <div class="flex space-x-2">
        <div class="flex-grow">
          <input
            v-model="idSoinRecherche"
            type="number"
            class="w-full p-2 border rounded"
            placeholder="Entrez l'ID du soin"
          />
        </div>
        <button
          @click="rechercherSoin"
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          :disabled="!idSoinRecherche || rechercheEnCours"
        >
          {{ rechercheEnCours ? "Recherche..." : "Rechercher" }}
        </button>
      </div>
      <div
        v-if="messageRecherche"
        class="mt-2 p-2 rounded"
        :class="messageRechercheClasse"
      >
        {{ messageRecherche }}
      </div>
    </div>

    <div v-if="chargementEnCours" class="text-center py-8">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
      ></div>
      <p class="mt-2">Chargement en cours...</p>
    </div>

    <div v-else-if="soinTrouve">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Modifier le soin #{{ idSoin }}</h2>
        <button
          @click="retourRecherche"
          class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
        >
          Rechercher un autre soin
        </button>
      </div>

      <form
        @submit.prevent="soumettreFormulaire"
        class="bg-white p-4 rounded shadow"
      >
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Informations sur le soin -->
          <div>
            <h3 class="font-semibold mb-2">Informations sur le soin</h3>

            <div class="mb-3">
              <label class="block mb-1">Patient *</label>
              <select
                v-model="soin.id_patient"
                required
                class="w-full p-2 border rounded"
              >
                <option value="">Sélectionnez un patient</option>
                <option
                  v-for="patient in patients"
                  :key="patient.id_patient || patient.id_personne"
                  :value="patient.id_patient || patient.id_personne"
                >
                  {{ patient.nom }} {{ patient.prenom }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="block mb-1">Réunion de décision *</label>
              <select
                v-model="soin.id_reunion_decision"
                required
                class="w-full p-2 border rounded"
              >
                <option value="">Sélectionnez une réunion</option>
                <option
                  v-for="reunion in reunions"
                  :key="reunion.id_reunion"
                  :value="reunion.id_reunion"
                >
                  {{ formatDate(reunion.date_reunion) }} - {{ reunion.sujet }}
                </option>
              </select>
            </div>

            <div class="mb-3">
              <label class="block mb-1">Description du soin *</label>
              <textarea
                v-model="soin.description"
                required
                class="w-full p-2 border rounded"
                rows="4"
                placeholder="Décrivez le soin à administrer"
              ></textarea>
            </div>

            <div
              class="mb-3"
              v-if="administrations && administrations.length > 0"
            >
              <h4 class="font-semibold text-sm mb-1">
                Historique des administrations
              </h4>
              <div class="border p-2 rounded max-h-48 overflow-y-auto">
                <div
                  v-for="admin in administrations"
                  :key="admin.id_administration"
                  class="mb-2 p-2 bg-gray-50 text-sm rounded"
                >
                  <div class="font-semibold">
                    {{ formatDate(admin.date_heure) }}
                  </div>
                  <div>
                    Infirmier: {{ admin.prenom_infirmier }}
                    {{ admin.nom_infirmier }}
                  </div>
                  <div v-if="admin.commentaires">
                    Commentaire: {{ admin.commentaires }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Médicaments associés -->
          <div>
            <h3 class="font-semibold mb-2">Médicaments associés</h3>

            <div class="mb-3">
              <label class="block mb-1">Sélectionner un médicament</label>
              <div class="flex space-x-2">
                <select
                  v-model="medicamentSelectionne.id_medicament"
                  class="w-full p-2 border rounded"
                >
                  <option value="">Sélectionnez un médicament</option>
                  <option
                    v-for="med in medicaments"
                    :key="med.id_medicament"
                    :value="med.id_medicament"
                  >
                    {{ med.nom }} ({{ med.dosage }})
                  </option>
                </select>
                <button
                  type="button"
                  @click="ajouterMedicament"
                  class="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                  :disabled="
                    !medicamentSelectionne.id_medicament ||
                    !medicamentSelectionne.quantite
                  "
                >
                  +
                </button>
              </div>
            </div>

            <div class="mb-3" v-if="medicamentSelectionne.id_medicament">
              <label class="block mb-1">Quantité / Posologie</label>
              <input
                v-model="medicamentSelectionne.quantite"
                type="text"
                class="w-full p-2 border rounded"
                placeholder="Ex: 1 comprimé x 3/jour pendant 7 jours"
              />
            </div>

            <div class="mb-3" v-if="medicamentSelectionne.id_medicament">
              <div class="text-sm mb-2">
                <strong>Médicament sélectionné:</strong>
                {{
                  medicaments.find(
                    (m) =>
                      m.id_medicament === medicamentSelectionne.id_medicament
                  )?.nom
                }}
                ({{
                  medicaments.find(
                    (m) =>
                      m.id_medicament === medicamentSelectionne.id_medicament
                  )?.dosage
                }})
              </div>
              <div
                class="text-sm text-gray-600"
                v-if="
                  medicaments.find(
                    (m) =>
                      m.id_medicament === medicamentSelectionne.id_medicament
                  )?.description
                "
              >
                {{
                  medicaments.find(
                    (m) =>
                      m.id_medicament === medicamentSelectionne.id_medicament
                  )?.description
                }}
              </div>
            </div>

            <div class="mb-3" v-if="soin.medicaments.length > 0">
              <label class="block mb-1">Médicaments associés</label>
              <div class="border rounded p-2 max-h-48 overflow-y-auto">
                <div
                  v-for="(med, index) in soin.medicaments"
                  :key="index"
                  class="mb-2 p-2 bg-gray-50 rounded"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <div class="font-semibold">
                        {{
                          medicaments.find(
                            (m) => m.id_medicament === med.id_medicament
                          )?.nom
                        }}
                        ({{
                          medicaments.find(
                            (m) => m.id_medicament === med.id_medicament
                          )?.dosage
                        }})
                      </div>
                      <div class="text-sm">{{ med.quantite }}</div>
                    </div>
                    <button
                      type="button"
                      @click="supprimerMedicament(index)"
                      class="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm"
                    >
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-4 flex space-x-4">
          <button
            type="submit"
            class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            :disabled="envoiEnCours"
          >
            {{
              envoiEnCours
                ? "Enregistrement..."
                : "Enregistrer les modifications"
            }}
          </button>

          <button
            type="button"
            class="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            @click="retourRecherche"
          >
            Annuler
          </button>
        </div>

        <div v-if="message" class="mt-4 p-2 rounded" :class="messageClasse">
          {{ message }}
        </div>
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      idSoinRecherche: "",
      idSoin: null,
      soinTrouve: false,
      rechercheEnCours: false,
      messageRecherche: "",
      messageRechercheClasse: "",
      soin: {
        id_patient: "",
        id_reunion_decision: "",
        description: "",
        medicaments: [],
      },
      medicamentSelectionne: {
        id_medicament: "",
        quantite: "",
      },
      administrations: [],
      patients: [],
      reunions: [],
      medicaments: [],
      chargementEnCours: false,
      envoiEnCours: false,
      message: "",
      messageClasse: "",
    };
  },
  mounted() {
    // Charger les données de base (patients, réunions, médicaments)
    this.chargerDonneesDeBase();

    // Si l'ID est fourni dans l'URL, on tente de le récupérer
    if (this.$route.params.id) {
      this.idSoinRecherche = this.$route.params.id;
      this.rechercherSoin();
    }
  },
  methods: {
    async chargerDonneesDeBase() {
      try {
        // Charger les données de base (patients, réunions, médicaments)
        const [patientsResponse, reunionsResponse, medicamentsResponse] =
          await Promise.all([
            axios.get("http://localhost:3002/patients"),
            axios.get("http://localhost:3002/reunions"),
            axios.get("http://localhost:3002/afficherMedicaments"),
          ]);

        this.patients = patientsResponse.data;
        this.reunions = reunionsResponse.data;
        this.medicaments = medicamentsResponse.data;
      } catch (error) {
        console.error("Erreur lors du chargement des données de base:", error);
        this.afficherMessage(
          "Erreur lors du chargement des données: " +
            (error.response?.data?.message || error.message),
          "error"
        );
      }
    },

    async rechercherSoin() {
      if (!this.idSoinRecherche) {
        this.messageRecherche = "Veuillez entrer un ID de soin";
        this.messageRechercheClasse =
          "bg-red-100 text-red-700 border border-red-500";
        return;
      }

      this.rechercheEnCours = true;
      this.messageRecherche = "";

      try {
        this.chargementEnCours = true;

        // Charger les informations du soin à modifier
        const soinResponse = await axios.get(
          `http://localhost:3002/soins/${this.idSoinRecherche}`
        );
        const soinData = soinResponse.data;

        console.log("Données du soin récupérées:", soinData);

        // S'assurer que les medicaments sont bien un tableau
        const medicaments = Array.isArray(soinData.medicaments)
          ? soinData.medicaments.map((med) => ({
              id_medicament: med.id_medicament,
              quantite: med.quantite,
            }))
          : [];

        // Mettre en forme les données du soin
        this.soin = {
          id_patient: soinData.id_patient,
          id_reunion_decision: soinData.id_reunion_decision,
          description: soinData.description,
          medicaments: medicaments,
        };

        // Récupérer l'historique des administrations si disponible
        if (soinData.administrations) {
          this.administrations = soinData.administrations;
        }

        this.idSoin = this.idSoinRecherche;
        this.soinTrouve = true;
      } catch (error) {
        console.error("Erreur lors de la recherche du soin:", error);
        this.messageRecherche =
          "Soin non trouvé ou erreur lors de la recherche: " +
          (error.response?.data?.message || error.message);
        this.messageRechercheClasse =
          "bg-red-100 text-red-700 border border-red-500";
        this.soinTrouve = false;
      } finally {
        this.rechercheEnCours = false;
        this.chargementEnCours = false;
      }
    },

    retourRecherche() {
      this.soinTrouve = false;
      this.idSoin = null;
      this.message = "";
      this.messageRecherche = "";
      this.soin = {
        id_patient: "",
        id_reunion_decision: "",
        description: "",
        medicaments: [],
      };
      this.administrations = [];
    },

    formatDate(dateString) {
      if (!dateString) return "";
      const date = new Date(dateString);
      return date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    ajouterMedicament() {
      if (
        !this.medicamentSelectionne.id_medicament ||
        !this.medicamentSelectionne.quantite
      ) {
        this.afficherMessage(
          "Veuillez sélectionner un médicament et indiquer la quantité",
          "error"
        );
        return;
      }

      // Vérifier si le médicament est déjà dans la liste
      const medicamentExistant = this.soin.medicaments.find(
        (med) => med.id_medicament === this.medicamentSelectionne.id_medicament
      );

      if (medicamentExistant) {
        this.afficherMessage("Ce médicament a déjà été ajouté", "error");
        return;
      }

      // Ajouter le médicament à la liste
      this.soin.medicaments.push({
        id_medicament: parseInt(this.medicamentSelectionne.id_medicament),
        quantite: this.medicamentSelectionne.quantite,
      });

      console.log("Médicament ajouté:", {
        id_medicament: parseInt(this.medicamentSelectionne.id_medicament),
        quantite: this.medicamentSelectionne.quantite,
      });
      console.log("Liste des médicaments:", this.soin.medicaments);

      // Réinitialiser le médicament sélectionné
      this.medicamentSelectionne = {
        id_medicament: "",
        quantite: "",
      };
    },

    supprimerMedicament(index) {
      this.soin.medicaments.splice(index, 1);
      console.log(
        "Liste des médicaments après suppression:",
        this.soin.medicaments
      );
    },

    async soumettreFormulaire() {
      // Vérification des champs obligatoires
      if (
        !this.soin.id_patient ||
        !this.soin.id_reunion_decision ||
        !this.soin.description
      ) {
        this.afficherMessage(
          "Veuillez remplir tous les champs obligatoires",
          "error"
        );
        return;
      }

      this.envoiEnCours = true;
      this.message = "";

      try {
        // Créer l'objet avec les données du soin
        const soinData = {
          description: this.soin.description,
          id_patient: parseInt(this.soin.id_patient),
          id_reunion_decision: parseInt(this.soin.id_reunion_decision),
          medicaments: this.soin.medicaments.map((med) => ({
            id_medicament: parseInt(med.id_medicament),
            quantite: med.quantite.replace("×", "x"), // Remplacer le caractère spécial × par x
          })),
        };

        console.log(
          "Données envoyées au serveur:",
          JSON.stringify(soinData, null, 2)
        );

        // Ajouter des headers spécifiques pour le debugging
        const response = await axios.put(
          `http://localhost:3002/modifierSoin/${this.idSoin}`,
          soinData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            // Ajouter un timeout plus long pour voir si c'est un problème de délai
            timeout: 10000,
          }
        );

        console.log("Réponse du serveur:", response.data);

        if (response.data.success) {
          this.afficherMessage("Soin modifié avec succès", "success");

          // Mettre à jour les données affichées
          if (response.data.soin) {
            this.soin = {
              id_patient: response.data.soin.id_patient,
              id_reunion_decision: response.data.soin.id_reunion_decision,
              description: response.data.soin.description,
              medicaments: response.data.soin.medicaments.map((med) => ({
                id_medicament: med.id_medicament,
                quantite: med.quantite,
              })),
            };
          }
        } else {
          this.afficherMessage(
            response.data.message || "Une erreur est survenue",
            "error"
          );
        }
      } catch (error) {
        console.error("Erreur lors de la modification:", error);
        console.error(
          "Détails de l'erreur:",
          error.response?.data || error.message
        );

        // Afficher plus de détails sur l'erreur
        let messageErreur = "Erreur lors de la modification du soin: ";

        if (error.response) {
          // La requête a été faite et le serveur a répondu avec un code d'état
          messageErreur += `Statut: ${error.response.status} - ${
            error.response?.data?.message || JSON.stringify(error.response.data)
          }`;
        } else if (error.request) {
          // La requête a été faite mais aucune réponse n'a été reçue
          messageErreur +=
            "Aucune réponse reçue du serveur. Vérifiez que le serveur est en marche.";
        } else {
          // Une erreur s'est produite lors de la configuration de la requête
          messageErreur += error.message;
        }

        this.afficherMessage(messageErreur, "error");
      } finally {
        this.envoiEnCours = false;
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

.error {
  color: red;
}
</style>
