<template>
  <div class="container mx-auto p-4 bg-white rounded shadow mt-6">
    <button
      @click="afficherFormulaire = !afficherFormulaire"
      class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded mb-4"
    >
      {{
        afficherFormulaire
          ? "Masquer le formulaire"
          : "Afficher le formulaire d'ajout"
      }}
    </button>

    <!-- Formulaire d'ajout d'infirmier -->
    <div v-if="afficherFormulaire" class="transition-all duration-300">
      <form @submit.prevent="ajouterInfirmier" class="space-y-3">
        <div>
          <label class="block text-sm font-medium text-gray-700">Nom</label>
          <input
            v-model="nouvelInfirmier.nom"
            type="text"
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Prénom</label>
          <input
            v-model="nouvelInfirmier.prenom"
            type="text"
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Adresse</label>
          <input
            v-model="nouvelInfirmier.adresse"
            type="text"
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Téléphone</label
          >
          <input
            v-model="nouvelInfirmier.telephone"
            type="tel"
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="nouvelInfirmier.email"
            type="email"
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Date d'embauche</label
          >
          <input
            v-model="nouvelInfirmier.dateEmbauche"
            type="date"
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >username</label
          >
          <input
            v-model="nouvelInfirmier.username"
            type="text"
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >mot de passe</label
          >
          <input
            v-model="nouvelInfirmier.mot_de_passe"
            type="text"
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
          />
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Service</label>
          <select
            v-model="nouvelInfirmier.idService"
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
          >
            <option value="">Sélectionner un service</option>
            <option value="1">Cardiologie</option>
            <option value="2">Pédiatrie</option>
            <option value="3">Neurologie</option>
            <option value="4">Radiologie</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700"
            >Qualification</label
          >
          <select
            v-model="nouvelInfirmier.qualification"
            required
            class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
          >
            <option value="">Sélectionner une qualification</option>
            <option value="IDE">Infirmier Diplômé d'État (IDE)</option>
            <option value="IBODE">Infirmier de Bloc Opératoire (IBODE)</option>
            <option value="IADE">Infirmier Anesthésiste (IADE)</option>
            <option value="Puéricultrice">Puéricultrice</option>
          </select>
        </div>
        <button
          type="submit"
          class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
        >
          Enregistrer
        </button>
      </form>

      <!-- Message de confirmation ou d'erreur pour l'ajout -->
      <div
        v-if="message"
        class="mt-3"
        :class="{ 'text-green-600': !erreur, 'text-red-600': erreur }"
      >
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
import axios from "axios";

export default {
  data() {
    return {
      afficherFormulaire: false,
      nouvelInfirmier: {
        nom: "",
        prenom: "",
        adresse: "",
        telephone: "",
        email: "",
        dateEmbauche: new Date().toISOString().split("T")[0],
        username: "",
        mot_de_passe: "",
        idService: "",
        qualification: "",
      },
      message: "",
      erreur: false,
    };
  },
  methods: {
    ajouterInfirmier() {
      // Réinitialiser le message
      this.message = "";
      this.erreur = false;

      // Vérification des champs
      const champsRequis = [
        "nom",
        "prenom",
        "adresse",
        "telephone",
        "email",
        "dateEmbauche",
        "username",
        "mot_de_passe",
        "idService",
        "qualification",
      ];
      const champManquant = champsRequis.find(
        (champ) => !this.nouvelInfirmier[champ]
      );

      if (champManquant) {
        this.message = `Veuillez remplir le champ ${champManquant}`;
        this.erreur = true;
        return;
      }

      axios
        .post("http://localhost:3002/infirmier", this.nouvelInfirmier)
        .then(() => {
          this.message = "Infirmier ajouté avec succès";

          this.nouvelInfirmier = {
            nom: "",
            prenom: "",
            adresse: "",
            telephone: "",
            email: "",
            dateEmbauche: new Date().toISOString().split("T")[0],
            username: "",
            mot_de_passe: "",
            idService: "",
            qualification: "",
          };

          this.afficherFormulaire = false;

          this.$emit("infirmier-ajoute");
        })
        .catch((error) => {
          this.message =
            "Erreur lors de l'ajout de l'infirmier: " + error.message;
          this.erreur = true;
          console.error("Erreur:", error);
        });
    },
  },
};
</script>

<style scoped>
button {
  margin-top: 15px;
  padding: 8px 16px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #45a049;
}
</style>
