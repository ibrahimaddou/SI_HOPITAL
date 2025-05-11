<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Ajouter un patient</h2>
    
    <form @submit.prevent="soumettreFormulaire" class="bg-white p-4 rounded shadow">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <!-- Informations personnelles -->
        <div>
          <h3 class="font-semibold mb-2">Informations personnelles</h3>
          
          <div class="mb-3">
            <label class="block mb-1">Nom *</label>
            <input 
              v-model="patient.nom" 
              type="text" 
              required
              class="w-full p-2 border rounded"
            />
          </div>
          
          <div class="mb-3">
            <label class="block mb-1">Prénom *</label>
            <input 
              v-model="patient.prenom" 
              type="text" 
              required
              class="w-full p-2 border rounded"
            />
          </div>
          
          <div class="mb-3">
            <label class="block mb-1">Date de naissance *</label>
            <input 
              v-model="patient.date_naissance" 
              type="date" 
              required
              class="w-full p-2 border rounded"
            />
          </div>
          
          <div class="mb-3">
            <label class="block mb-1">Adresse</label>
            <input 
              v-model="patient.adresse" 
              type="text"
              class="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <!-- Informations de contact et médicales -->
        <div>
          <h3 class="font-semibold mb-2">Contact et informations médicales</h3>
          
          <div class="mb-3">
            <label class="block mb-1">Téléphone</label>
            <input 
              v-model="patient.telephone" 
              type="tel"
              class="w-full p-2 border rounded"
            />
          </div>
          
          <div class="mb-3">
            <label class="block mb-1">Email</label>
            <input 
              v-model="patient.email" 
              type="email"
              class="w-full p-2 border rounded"
            />
          </div>
          
          <div class="mb-3">
            <label class="block mb-1">Antécédents médicaux</label>
            <textarea 
              v-model="patient.antecedents_medicaux" 
              rows="4"
              class="w-full p-2 border rounded"
              placeholder="Antécédents médicaux, allergies, traitements en cours..."
            ></textarea>
          </div>
        </div>
      </div>
      
      <div class="mt-4">
        <button 
          type="submit" 
          class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          :disabled="envoiEnCours"
        >
          {{ envoiEnCours ? 'Enregistrement...' : 'Enregistrer' }}
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
      patient: {
        nom: "",
        prenom: "",
        date_naissance: "",
        adresse: "",
        telephone: "",
        email: "",
        antecedents_medicaux: ""
      },
      envoiEnCours: false,
      message: "",
      messageClasse: ""
    };
  },
  methods: {
    soumettreFormulaire() {
      // Vérification des champs obligatoires
      if (!this.patient.nom || !this.patient.prenom || !this.patient.date_naissance) {
        this.afficherMessage("Veuillez remplir tous les champs obligatoires", "error");
        return;
      }
      const aujourdhui = new Date();
    const dateNaissanceObj = new Date(this.patient.date_naissance);
      if (dateNaissanceObj>aujourdhui) {
        this.afficherMessage("Date de naissance invalide !", "error");
        return;
      }

      
      this.envoiEnCours = true;
      this.message = "";

      const patientData = {
        nom: this.patient.nom,
        prenom: this.patient.prenom,
        dateNaissance: this.patient.date_naissance,
        adresse: this.patient.adresse || null,
        telephone: this.patient.telephone || null,
        email: this.patient.email || null,
        antecedentsMedicaux: this.patient.antecedents_medicaux || null
      };
      
      axios
        .post("http://localhost:3002/patients", patientData)
        .then(() => {
          this.afficherMessage("Patient ajouté avec succès", "success");
          this.reinitialiserFormulaire();
        })
        .catch(error => {
          console.error("Erreur lors de l'ajout:", error);
          this.afficherMessage(
            "Erreur lors de l'ajout du patient: " + 
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
        this.messageClasse = "bg-green-100 text-green-700 border border-green-500";
      }
    },
    
    reinitialiserFormulaire() {
      this.patient = {
        nom: "",
        prenom: "",
        date_naissance: "",
        adresse: "",
        telephone: "",
        email: "",
        antecedents_medicaux: ""
      };
    }
  }
};
</script>

<style scoped>
input:focus, textarea:focus {
  outline: none;
  border-color: #4f46e5;
}

.error {
  color: red;
}
</style>