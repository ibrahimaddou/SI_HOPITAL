<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Ajouter un membre du personnel administratif</h2>
      
      <form @submit.prevent="soumettreFormulaire" class="bg-white p-4 rounded shadow">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <!-- Informations personnelles -->
          <div>
            <h3 class="font-semibold mb-2">Informations personnelles</h3>
            
            <div class="mb-3">
              <label class="block mb-1">Nom *</label>
              <input 
                v-model="personnel.nom" 
                type="text" 
                required
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div class="mb-3">
              <label class="block mb-1">Prénom *</label>
              <input 
                v-model="personnel.prenom" 
                type="text" 
                required
                class="w-full p-2 border rounded"
              />
            </div>
            
            
            
            <div class="mb-3">
              <label class="block mb-1">Adresse</label>
              <input 
                v-model="personnel.adresse" 
                type="text"
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div class="mb-3">
              <label class="block mb-1">Téléphone</label>
              <input 
                v-model="personnel.telephone" 
                type="tel"
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div class="mb-3">
              <label class="block mb-1">Email</label>
              <input 
                v-model="personnel.email" 
                type="email"
                class="w-full p-2 border rounded"
              />
            </div>
          </div>
          
          <!-- Informations professionnelles -->
          <div>
            <h3 class="font-semibold mb-2">Informations professionnelles</h3>
            
            <div class="mb-3">
              <label class="block mb-1">Date d'embauche *</label>
              <input 
                v-model="personnel.date_embauche" 
                type="date" 
                required
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div class="mb-3">
              <label class="block mb-1">Poste *</label>
              <input 
                v-model="personnel.poste" 
                type="text" 
                required
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div class="mb-3">
              <label class="block mb-1">Service *</label>
              <select 
                v-model="personnel.id_service" 
                required
                class="w-full p-2 border rounded"
              >
                <option value="">Sélectionnez un service</option>
                <option value="1">Cardiologie</option>
                <option value="2">Pédiatrie</option>
                <option value="3">Urgences</option>
                <option value="4">Chirurgie</option>
              </select>
            </div>
            
           
            
            <div class="mb-3">
              <label class="block mb-1">Mot de passe *</label>
              <input 
                v-model="personnel.mot_de_passe" 
                type="password" 
                required
                class="w-full p-2 border rounded"
              />
            </div>
            
            <div class="mb-3">
              <label class="flex items-center">
                <input 
                  v-model="personnel.est_responsable" 
                  type="checkbox"
                  class="mr-2"
                />
                <span>Est responsable de service</span>
              </label>
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
        personnel: {
          nom: "",
          prenom: "",
         
          adresse: "",
          telephone: "",
          email: "",
          dateEmbauche: "",
          poste: "",
          id_service: "",
          motDePasse: "",
          est_responsable: false
        },
        envoiEnCours: false,
        message: "",
        messageClasse: ""
      };
    },
    methods: {
      soumettreFormulaire() {
        console.log("Données à envoyer:", this.personnel);
// Vérification détaillée
if (!this.personnel.nom) console.log("Nom manquant");
if (!this.personnel.prenom) console.log("Prénom manquant");
if (!this.personnel.date_embauche) console.log("Date d'embauche manquante");
if (!this.personnel.poste) console.log("Poste manquant");
if (!this.personnel.id_service) console.log("Service manquant");
//if (!this.personnel.username) console.log("Nom d'utilisateur manquant");
if (!this.personnel.mot_de_passe) console.log("Mot de passe manquant");
        // Vérification des champs obligatoires
        if (!this.personnel.nom || !this.personnel.prenom || 
            !this.personnel.date_embauche || !this.personnel.poste || !this.personnel.mot_de_passe) {
          this.afficherMessage("Veuillez remplir tous les champs obligatoires", "error");
          return;
        }
        
        this.envoiEnCours = true;
        this.message = "";
        
        axios
          .post("http://localhost:3002/personnelsAdministratifs", this.personnel)
          .then( ()=> {
            this.afficherMessage("Personnel administratif ajouté avec succès", "success");
            this.reinitialiserFormulaire();
          })
          .catch(error => {
            console.error("Erreur lors de l'ajout:", error);
            this.afficherMessage(
              "Erreur lors de l'ajout du personnel: " + 
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
        this.personnel = {
          nom: "",
          prenom: "",
          adresse: "",
          telephone: "",
          email: "",
          date_embauche: "",
          poste: "",
          id_service: "",
          mot_de_passe: "",
          est_responsable: false
        };
      }
    }
  };
  </script>
  
  <style scoped>
  input:focus, select:focus {
    outline: none;
    border-color: #4f46e5;
  }
  
  .error {
    color: red;
  }
  </style>