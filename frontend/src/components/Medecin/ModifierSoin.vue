<template>
  <div class="container mx-auto p-4">
    <!-- Message d'alerte général -->
    <div v-if="message" class="mt-4 p-2 rounded" :class="messageClasse">
      {{ message }}
    </div>

    <!-- Section de recherche ou liste des soins -->
    <div
      v-if="!soinTrouve && !chargementEnCours"
      class="bg-white p-4 rounded shadow mb-4"
    >
      <h2 class="text-xl font-bold mb-4">Rechercher un soin à modifier</h2>

      <!-- Recherche par ID -->
      <div class="flex space-x-2 mb-4">
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

      <!-- OU utiliser un tableau de tous les soins disponibles -->
      <div class="mt-6">
        <h3 class="text-lg font-semibold mb-2">
          Ou sélectionner un soin dans la liste
        </h3>

        <div class="mb-4">
          <input
            type="text"
            class="w-full p-2 border rounded"
            placeholder="Rechercher un soin..."
            v-model="searchQuery"
          />
        </div>

        <div class="overflow-x-auto">
          <table class="w-full border-collapse">
            <thead>
              <tr class="bg-gray-100">
                <th class="border px-4 py-2 text-left">ID</th>
                <th class="border px-4 py-2 text-left">Description</th>
                <th class="border px-4 py-2 text-left">Patient</th>
                <th class="border px-4 py-2 text-left">Réunion</th>
                <th class="border px-4 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="5" class="border px-4 py-2 text-center">
                  Chargement...
                </td>
              </tr>
              <tr v-else-if="filteredSoins.length === 0">
                <td colspan="5" class="border px-4 py-2 text-center">
                  Aucun soin trouvé
                </td>
              </tr>
              <tr
                v-for="soin in filteredSoins"
                :key="soin.id_soin"
                class="hover:bg-gray-50"
              >
                <td class="border px-4 py-2">{{ soin.id_soin }}</td>
                <td class="border px-4 py-2">
                  {{ truncateText(soin.description, 30) }}
                </td>
                <td class="border px-4 py-2">
                  {{ soin.nom_patient }} {{ soin.prenom_patient }}
                </td>
                <td class="border px-4 py-2">
                  {{ formatDate(soin.date_reunion) }}
                </td>
                <td class="border px-4 py-2">
                  <button
                    class="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
                    @click="selectSoin(soin)"
                  >
                    Modifier
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Indicateur de chargement -->
    <div v-if="chargementEnCours" class="text-center py-8">
      <div
        class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"
      ></div>
      <p class="mt-2">Chargement en cours...</p>
    </div>

    <!-- Formulaire de modification du soin -->
    <div v-else-if="soinTrouve">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-bold">Modifier le soin #{{ idSoin }}</h2>
        <button
          @click="retourRecherche"
          class="px-3 py-1 bg-gray-400 text-white rounded hover:bg-gray-500 text-sm"
        >
          Retour à la liste
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
            :disabled="envoiEnCours || !isFormValid"
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
      </form>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  name: "ModifierSoin",
  data() {
    return {
      // Recherche
      idSoinRecherche: "",
      rechercheEnCours: false,
      messageRecherche: "",
      messageRechercheClasse: "",
      searchQuery: "",
      loading: true,

      // État du composant
      idSoin: null,
      soinTrouve: false,
      chargementEnCours: false,
      envoiEnCours: false,
      message: "",
      messageClasse: "",

      // Données du soin
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

      // Données associées
      soins: [],
      administrations: [],
      patients: [],
      reunions: [],
      medicaments: [],
    };
  },
  computed: {
    filteredSoins() {
      if (!this.searchQuery.trim()) {
        return this.soins;
      }

      const query = this.searchQuery.toLowerCase();
      return this.soins.filter((soin) => {
        return (
          (soin.description &&
            soin.description.toLowerCase().includes(query)) ||
          (soin.nom_patient &&
            soin.nom_patient.toLowerCase().includes(query)) ||
          (soin.prenom_patient &&
            soin.prenom_patient.toLowerCase().includes(query)) ||
          (soin.id_soin && soin.id_soin.toString().includes(query))
        );
      });
    },
    isFormValid() {
      // Vérifier que tous les champs obligatoires sont remplis
      if (
        !this.soin.description ||
        !this.soin.id_patient ||
        !this.soin.id_reunion_decision
      ) {
        return false;
      }

      // Si des médicaments sont présents, vérifier qu'ils sont tous valides
      for (const med of this.soin.medicaments) {
        if (!med.id_medicament || !med.quantite) {
          return false;
        }
      }

      return true;
    },
  },
  mounted() {
    console.log("Composant ModifierSoin monté");

    // Charger les données de base (patients, réunions, médicaments, liste des soins)
    this.chargerToutesDonnees();

    // Si l'ID est fourni dans l'URL, on tente de le récupérer
    if (this.$route.params.id) {
      this.idSoinRecherche = this.$route.params.id;
      this.rechercherSoin();
    }
  },
  methods: {
    async chargerToutesDonnees() {
      try {
        this.loading = true;

        // Charger toutes les données nécessaires en parallèle
        const [
          soinsResponse,
          patientsResponse,
          reunionsResponse,
          medicamentsResponse,
        ] = await Promise.all([
          axios.get("http://localhost:3002/soins"),
          axios.get("http://localhost:3002/patients"),
          axios.get("http://localhost:3002/reunions"),
          axios.get("http://localhost:3002/afficherMedicaments"),
        ]);

        this.soins = soinsResponse.data;
        this.patients = patientsResponse.data;
        this.reunions = reunionsResponse.data;
        this.medicaments = medicamentsResponse.data;

        console.log("Données chargées:", {
          soins: this.soins,
          patients: this.patients,
          reunions: this.reunions,
          medicaments: this.medicaments,
        });
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
        this.afficherMessage(
          "Erreur lors du chargement des données: " +
            (error.response?.data?.message || error.message),
          "error"
        );
      } finally {
        this.loading = false;
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

    selectSoin(soin) {
      console.log("Soin sélectionné pour modification:", soin);

      this.chargementEnCours = true;

      // Utiliser les données du soin et récupérer les médicaments associés
      this.idSoin = soin.id_soin;
      this.soin = {
        id_patient: soin.id_patient,
        id_reunion_decision: soin.id_reunion_decision,
        description: soin.description,
        medicaments: [],
      };

      // Charger les médicaments et données détaillées du soin
      this.fetchSoinMedicaments(soin.id_soin)
        .then(() => {
          this.soinTrouve = true;
          this.chargementEnCours = false;
        })
        .catch((error) => {
          console.error(
            "Erreur lors de la récupération des détails du soin:",
            error
          );
          this.afficherMessage(
            "Erreur lors du chargement des données du soin",
            "error"
          );
          this.chargementEnCours = false;
        });
    },

    async fetchSoinMedicaments(idSoin) {
      try {
        // Si votre API le permet, récupérer les médicaments associés au soin
        const response = await axios.get(
          `http://localhost:3002/afficherMedicamentsPatient/${idSoin}`
        );

        if (response.data && Array.isArray(response.data)) {
          this.soin.medicaments = response.data.map((med) => ({
            id_medicament: med.id_medicament,
            quantite: med.quantite,
          }));
        }

        // Optionnel: récupérer l'historique des administrations si disponible
        try {
          const adminResponse = await axios.get(
            `http://localhost:3002/administrations/${idSoin}`
          );
          if (adminResponse.data && Array.isArray(adminResponse.data)) {
            this.administrations = adminResponse.data;
          }
        } catch (adminError) {
          console.log("Pas d'administrations disponibles pour ce soin");
          this.administrations = [];
        }
      } catch (error) {
        console.error(
          "Erreur lors de la récupération des médicaments du soin:",
          error
        );
        throw error;
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

    truncateText(text, maxLength) {
      if (!text) return "";
      return text.length > maxLength
        ? text.substring(0, maxLength) + "..."
        : text;
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
      if (!this.isFormValid) {
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

        // Envoyer la demande de modification
        const response = await axios.put(
          `http://localhost:3002/modifierSoin/${this.idSoin}`,
          soinData,
          {
            headers: {
              "Content-Type": "application/json",
            },
            timeout: 10000,
          }
        );

        console.log("Réponse du serveur:", response.data);

        if (response.data.success) {
          this.afficherMessage("Soin modifié avec succès", "success");

          // Mettre à jour la liste des soins dans le tableau
          await this.chargerToutesDonnees();

          // Mettre à jour les données affichées si nécessaire
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

      // Masquer le message après 5 secondes pour les messages de succès
      if (type === "success") {
        setTimeout(() => {
          this.message = "";
        }, 5000);
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
