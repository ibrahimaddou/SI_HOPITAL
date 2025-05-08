<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Ajouter un nouveau séjour</h2>

    <!-- Section de débogage -->
    <div class="mb-4 p-3 bg-gray-100 rounded">
      <h3 class="font-bold mb-2">Informations d'authentification :</h3>
      <p><strong>Token disponible :</strong> {{ authToken ? "Oui" : "Non" }}</p>
      <p v-if="userData">
        <strong>Utilisateur connecté :</strong> {{ userData.nom }}
        {{ userData.prenom }} ({{ userData.userType }})
      </p>
      <p v-if="authToken">
        <strong>Début du token :</strong> {{ tokenPreview }}
      </p>
    </div>

    <form
      @submit.prevent="soumettreFormulaire"
      class="bg-white p-4 rounded shadow"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Informations sur le patient et le séjour -->
        <div>
          <h3 class="font-semibold mb-2">Informations sur le patient</h3>

          <div class="mb-3">
            <label class="block mb-1">Patient *</label>
            <select
              v-model="sejour.idPatient"
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
            <label class="block mb-1">Raison du séjour *</label>
            <textarea
              v-model="sejour.raisonSejour"
              required
              class="w-full p-2 border rounded"
              rows="3"
            ></textarea>
          </div>

          <div class="mb-3">
            <label class="block mb-1">Date d'arrivée *</label>
            <input
              v-model="sejour.dateArrivee"
              type="date"
              required
              class="w-full p-2 border rounded"
            />
          </div>

          <div class="mb-3">
            <label class="block mb-1">Date de sortie prévisionnelle</label>
            <input
              v-model="sejour.dateSortiePrevisionnelle"
              type="date"
              class="w-full p-2 border rounded"
            />
          </div>
        </div>

        <!-- Chambre et lit -->
        <div>
          <h3 class="font-semibold mb-2">Affectation de chambre et lit</h3>

          <div class="mb-3">
            <label class="block mb-1">Service *</label>
            <select
              v-model="service"
              required
              class="w-full p-2 border rounded"
              @change="chargerChambres"
            >
              <option value="">Sélectionnez un service</option>
              <option
                v-for="s in services"
                :key="s.id_service"
                :value="s.id_service"
              >
                {{ s.nom }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="block mb-1">Chambre *</label>
            <select
              v-model="chambre"
              required
              class="w-full p-2 border rounded"
              @change="chargerLits"
              :disabled="!service"
            >
              <option value="">Sélectionnez une chambre</option>
              <option
                v-for="c in chambres"
                :key="c.id_chambre"
                :value="c.id_chambre"
              >
                {{ c.numero }} (Étage: {{ c.etage }}, Capacité:
                {{ c.capacite }})
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="block mb-1">Lit *</label>
            <select
              v-model="sejour.idLit"
              required
              class="w-full p-2 border rounded"
              :disabled="!chambre"
            >
              <option value="">Sélectionnez un lit</option>
              <option
                v-for="lit in litsDisponibles"
                :key="lit.id_lit"
                :value="lit.id_lit"
              >
                Lit n°{{ lit.numero_lit }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="block mb-1"
              >Personnel administratif responsable *</label
            >
            <select
              v-model="sejour.idAdminAffectation"
              required
              class="w-full p-2 border rounded"
            >
              <option value="">Sélectionnez un administratif</option>
              <option
                v-for="admin in personnelsAdmin"
                :key="admin.id_personne"
                :value="admin.id_personne"
              >
                {{ admin.nom }} {{ admin.prenom }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <!-- Section de débogage pour vérifier les données avant envoi -->
      <div class="mb-4 p-3 bg-gray-100 rounded">
        <h3 class="font-bold mb-2">Données à envoyer :</h3>
        <pre>{{ JSON.stringify(sejourDataToSend, null, 2) }}</pre>
      </div>

      <div class="mt-4">
        <button
          type="submit"
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          :disabled="envoiEnCours"
        >
          {{ envoiEnCours ? "Enregistrement..." : "Enregistrer" }}
        </button>

        <!-- Bouton de test d'authentification -->
        <button
          type="button"
          @click="testerAuthentification"
          class="ml-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Tester l'authentification
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
      sejour: {
        idPatient: "",
        idLit: "",
        dateArrivee: "",
        dateSortiePrevisionnelle: "",
        raisonSejour: "",
        idAdminAffectation: "",
      },
      service: "",
      chambre: "",
      patients: [],
      services: [],
      chambres: [],
      lits: [],
      personnelsAdmin: [],
      envoiEnCours: false,
      message: "",
      messageClasse: "",
      userData: null,
    };
  },
  computed: {
    litsDisponibles() {
      return this.lits.filter((lit) => !lit.occupe);
    },

    // Récupération du token depuis le localStorage
    authToken() {
      const token = localStorage.getItem("token");
      console.log("Token récupéré:", token ? "Présent" : "Absent");
      return token;
    },

    // Aperçu du token (premiers caractères)
    tokenPreview() {
      if (!this.authToken) return "";
      return this.authToken.substring(0, 20) + "...";
    },

    // En-têtes avec l'autorisation
    authHeaders() {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${this.authToken}`,
      };
      console.log("Headers d'authentification:", headers);
      return headers;
    },

    // Prépare les données à envoyer
    sejourDataToSend() {
      return {
        idPatient: this.sejour.idPatient
          ? parseInt(this.sejour.idPatient)
          : null,
        idLit: this.sejour.idLit ? parseInt(this.sejour.idLit) : null,
        dateArrivee: this.sejour.dateArrivee,
        dateSortiePrevisionnelle: this.sejour.dateSortiePrevisionnelle || null,
        raisonSejour: this.sejour.raisonSejour
          ? this.sejour.raisonSejour.trim()
          : "",
        idAdminAffectation: this.sejour.idAdminAffectation
          ? parseInt(this.sejour.idAdminAffectation)
          : null,
      };
    },
  },
  mounted() {
    console.log("Composant monté. Vérification du token...");
    if (this.authToken) {
      console.log("Token trouvé, chargement des données...");
      // Extraire les informations utilisateur du localStorage
      try {
        const userDataStr = localStorage.getItem("userData");
        if (userDataStr) {
          this.userData = JSON.parse(userDataStr);
          console.log("Données utilisateur chargées:", this.userData);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des données utilisateur:",
          error
        );
      }

      this.chargerDonnees();
    } else {
      console.warn(
        "Aucun token trouvé. L'utilisateur n'est peut-être pas connecté."
      );
      this.afficherMessage(
        "Veuillez vous connecter pour accéder à cette fonctionnalité",
        "error"
      );
    }
  },

  methods: {
    chargerDonnees() {
      // Charger les patients
      axios
        .get("http://localhost:3002/patients", { headers: this.authHeaders })
        .then((response) => {
          console.log("Patients chargés avec succès");
          this.patients = response.data;
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des patients:", error);
          this.afficherMessage(
            `Erreur lors du chargement des patients: ${
              error.response?.status === 401 ? "Non autorisé" : error.message
            }`,
            "error"
          );
        });

      // Charger les services
      axios
        .get("http://localhost:3002/services", { headers: this.authHeaders })
        .then((response) => {
          console.log("Services chargés avec succès");
          this.services = response.data;
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des services:", error);
          this.afficherMessage(
            `Erreur lors du chargement des services: ${
              error.response?.status === 401 ? "Non autorisé" : error.message
            }`,
            "error"
          );
        });

      // Charger les personnels administratifs
      axios
        .get("http://localhost:3002/personnelsAdministratifs", {
          headers: this.authHeaders,
        })
        .then((response) => {
          console.log("Personnels administratifs chargés avec succès");
          this.personnelsAdmin = response.data;
        })
        .catch((error) => {
          console.error(
            "Erreur lors du chargement des personnels administratifs:",
            error
          );
          this.afficherMessage(
            `Erreur lors du chargement des personnels administratifs: ${
              error.response?.status === 401 ? "Non autorisé" : error.message
            }`,
            "error"
          );
        });
    },

    chargerChambres() {
      if (!this.service) {
        this.chambres = [];
        this.chambre = "";
        this.lits = [];
        this.sejour.idLit = "";
        return;
      }

      axios
        .get(`http://localhost:3002/afficherChambres/${this.service}`, {
          headers: this.authHeaders,
        })
        .then((response) => {
          console.log("Chambres chargées avec succès");
          this.chambres = response.data;
          this.chambre = "";
          this.lits = [];
          this.sejour.idLit = "";
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des chambres:", error);
          this.afficherMessage(
            `Erreur lors du chargement des chambres: ${
              error.response?.status === 401 ? "Non autorisé" : error.message
            }`,
            "error"
          );
        });
    },

    chargerLits() {
      if (!this.chambre) {
        this.lits = [];
        this.sejour.idLit = "";
        return;
      }

      axios
        .get(`http://localhost:3002/litsDisponibles/${this.chambre}`, {
          headers: this.authHeaders,
        })
        .then((response) => {
          console.log("Lits chargés avec succès");
          this.lits = response.data;
          this.sejour.idLit = "";
        })
        .catch((error) => {
          console.error("Erreur lors du chargement des lits:", error);
          this.afficherMessage(
            `Erreur lors du chargement des lits: ${
              error.response?.status === 401 ? "Non autorisé" : error.message
            }`,
            "error"
          );
        });
    },

    // Fonction de test d'authentification
    testerAuthentification() {
      console.log("Test d'authentification en cours...");
      console.log("Token actuel:", this.authToken);

      // Essayez un endpoint simple pour tester l'authentification
      axios
        .get("http://localhost:3002/test-auth", {
          headers: this.authHeaders,
        })
        .then((response) => {
          console.log("Test d'authentification réussi:", response.data);
          this.afficherMessage("Authentification réussie!", "success");
        })
        .catch((error) => {
          console.error("Erreur de test d'authentification:", error);

          if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);

            if (error.response.status === 401) {
              this.afficherMessage(
                "Authentification échouée: Token invalide ou expiré",
                "error"
              );
            } else if (error.response.status === 404) {
              this.afficherMessage(
                "Route de test non trouvée. Ajoutez-la à votre API.",
                "error"
              );
            } else {
              this.afficherMessage(
                `Erreur: ${error.response?.data?.message || error.message}`,
                "error"
              );
            }
          } else {
            this.afficherMessage(
              `Erreur de connexion: ${error.message}`,
              "error"
            );
          }
        });
    },

    soumettreFormulaire() {
      // Vérification des champs obligatoires
      if (
        !this.sejour.idPatient ||
        !this.sejour.idLit ||
        !this.sejour.dateArrivee ||
        !this.sejour.raisonSejour.trim() ||
        !this.sejour.idAdminAffectation
      ) {
        console.log("Validation échouée: un ou plusieurs champs sont vides.");
        this.afficherMessage(
          "Veuillez remplir tous les champs obligatoires",
          "error"
        );
        return;
      }

      // Vérification de la présence du token
      if (!this.authToken) {
        this.afficherMessage(
          "Non authentifié: Veuillez vous connecter à nouveau",
          "error"
        );
        return;
      }

      this.envoiEnCours = true;
      this.message = "";

      console.log("Envoi de la requête d'ajout de séjour");
      console.log("Données à envoyer:", JSON.stringify(this.sejourDataToSend));

      // Ajout du token dans les headers pour l'ajout de séjour
      axios
        .post("http://localhost:3002/sejours", this.sejourDataToSend, {
          headers: this.authHeaders,
        })
        .then((response) => {
          console.log("Séjour ajouté avec succès:", response.data);
          this.afficherMessage("Séjour ajouté avec succès", "success");
          this.reinitialiserFormulaire();
        })
        .catch((error) => {
          console.error("Erreur lors de l'ajout:", error);

          if (error.response) {
            console.log("Status:", error.response.status);
            console.log("Data:", error.response.data);

            // Gestion spécifique des erreurs d'authentification
            if (error.response.status === 401) {
              this.afficherMessage(
                "Session expirée ou non autorisée: Veuillez vous reconnecter",
                "error"
              );
            } else if (error.response.status === 400) {
              this.afficherMessage(
                `Erreur de validation: ${
                  error.response.data.message || "Données invalides"
                }`,
                "error"
              );
            } else {
              this.afficherMessage(
                "Erreur lors de l'ajout du séjour: " +
                  (error.response?.data?.error ||
                    error.response?.data?.message ||
                    error.message),
                "error"
              );
            }

            // Pour mieux déboguer, affichons plus de détails dans la console
            console.log("Headers envoyés:", this.authHeaders);
            console.log("Endpoint:", "http://localhost:3002/sejours");
            console.log("Données envoyées:", this.sejourDataToSend);
          } else {
            this.afficherMessage(
              `Erreur de connexion: ${error.message}`,
              "error"
            );
          }
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
      this.sejour = {
        idPatient: "",
        idLit: "",
        dateArrivee: "",
        dateSortiePrevisionnelle: "",
        raisonSejour: "",
        idAdminAffectation: "",
      };
      this.service = "";
      this.chambre = "";
      this.lits = [];
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
