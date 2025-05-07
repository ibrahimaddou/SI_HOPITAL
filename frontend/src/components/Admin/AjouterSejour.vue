<template>
  <div class="container mx-auto p-4">
    <h2 class="text-xl font-bold mb-4">Ajouter un nouveau séjour</h2>
    
    <form @submit.prevent="soumettreFormulaire" class="bg-white p-4 rounded shadow">
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
              <option v-for="patient in patients" :key="patient.id_patient" :value="patient.id_patient">
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
              <option v-for="s in services" :key="s.id_service" :value="s.id_service">
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
              <option v-for="c in chambres" :key="c.id_chambre" :value="c.id_chambre">
                {{ c.numero }} (Étage: {{ c.etage }}, Capacité: {{ c.capacite }})
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
              <option v-for="lit in litsDisponibles" :key="lit.id_lit" :value="lit.id_lit">
                Lit n°{{ lit.numero_lit }}
              </option>
            </select>
          </div>
          
          <div class="mb-3">
            <label class="block mb-1">Personnel administratif responsable *</label>
            <select 
              v-model="sejour.idAdminAffectation" 
              required
              class="w-full p-2 border rounded"
            >
              <option value="">Sélectionnez un administratif</option>
              <option v-for="admin in personnelsAdmin" :key="admin.id_personne" :value="admin.id_personne">
                {{ admin.nom }} {{ admin.prenom }}
              </option>
            </select>
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
      sejour: {
        idPatient: "",
        idLit: "",
        dateArrivee: "",
        raisonSejour: "",
        idAdminAffectation: "",  // Assurez-vous que cette propriété est initialisée
        dateSortiePrevisionnelle: ""
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
      
    };
  },
  computed: {
    litsDisponibles() {
      return this.lits;
    }
  },
  mounted() {
    this.chargerDonnees();
  },
  methods: {
    chargerDonnees() {
      // Charger les patients
      axios.get("http://localhost:3002/patients")
        .then(response => {
          this.patients = response.data;
        })
        .catch(error => {
          console.error("Erreur lors du chargement des patients:", error);
          this.afficherMessage("Erreur lors du chargement des patients", "error");
        });
      
      // Charger les services
      axios.get("http://localhost:3002/services")
        .then(response => {
          this.services = response.data;
        })
        .catch(error => {
          console.error("Erreur lors du chargement des services:", error);
          this.afficherMessage("Erreur lors du chargement des services", "error");
        });
      
      // Charger les personnels administratifs
      axios.get("http://localhost:3002/personnelsAdministratifs")
        .then(response => {
          this.personnelsAdmin = response.data;
        })
        .catch(error => {
          console.error("Erreur lors du chargement des personnels administratifs:", error);
          this.afficherMessage("Erreur lors du chargement des personnels administratifs", "error");
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
      
      axios.get(`http://localhost:3002/afficherChambres/${this.service}`)
        .then(response => {
          this.chambres = response.data;
          this.chambre = "";
          this.lits = [];
          this.sejour.idLit = "";
        })
        .catch(error => {
          console.error("Erreur lors du chargement des chambres:", error);
          this.afficherMessage("Erreur lors du chargement des chambres", "error");
        });
    },
    
    chargerLits() {
      if (!this.chambre) {
        this.lits = [];
        this.sejour.idLit = "";
        return;
      }
      
      axios.get(`http://localhost:3002/litsDisponibles/${this.chambre}`)
        .then(response => {
          this.lits = response.data;
          this.sejour.idLit = "";
        })
        .catch(error => {
          console.error("Erreur lors du chargement des lits:", error);
          this.afficherMessage("Erreur lors du chargement des lits", "error");
        });
    },
    
    soumettreFormulaire() {
  // Vérification des champs obligatoires
  if (!this.sejour.idPatient || !this.sejour.idLit || !this.sejour.dateArrivee || 
      !this.sejour.raisonSejour || !this.sejour.idAdminAffectation) {
    this.afficherMessage("Veuillez remplir tous les champs obligatoires", "error");
    return;
  }
  
  this.envoiEnCours = true;
  this.message = "";
  
  // Envoi direct des données telles quelles en camelCase
  axios
    .post("http://localhost:3002/sejours", {
      idPatient: parseInt(this.sejour.idPatient, 10),
      idLit: parseInt(this.sejour.idLit, 10),
      dateArrivee: this.sejour.dateArrivee,
      raisonSejour: this.sejour.raisonSejour,
      idAdminAffectation: parseInt(this.sejour.idAdminAffectation, 10),
      dateSortiePrevisionnelle: this.sejour.dateSortiePrevisionnelle || null
    })
    .then(() => {
      this.afficherMessage("Séjour ajouté avec succès", "success");
      this.reinitialiserFormulaire();
    })
    .catch(error => {
      console.error("Erreur lors de l'ajout:", error);
      console.error("Détails de l'erreur:", error.response?.data);
      this.afficherMessage(
        "Erreur lors de l'ajout du séjour: " + 
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
      this.sejour = {
        idPatient: "",
        idLit: "",
        dateArrivee: "",
        raisonSejour: "",
        idAdminAffectation: "",
        dateSortiePrevisionnelle: ""
      };
      this.service = "";
      this.chambre = "";
      this.lits = [];
    }
  }
};
</script>

<style scoped>
input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #4f46e5;
}

.error {
  color: red;
}
</style>