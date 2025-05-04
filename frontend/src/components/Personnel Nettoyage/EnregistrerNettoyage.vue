<template>
    <div class="container mx-auto p-4">
      <h2 class="text-xl font-bold mb-4">Enregistrer le nettoyage de la chambre</h2>
      
      <div v-if="chargement">Chargement en cours...</div>
      <div v-if="erreur" class="erreur">{{ erreur }}</div>
      
      <form @submit.prevent="enregistrerNettoyage" class="form-container">
        <div class="form-group">
          <label for="chambreId">Chambre</label>
          <select id="chambreId" v-model="formulaire.chambreId" required>
            <option value="">Sélectionnez une chambre</option>
            <option v-for="chambre in chambres" :key="chambre.id" :value="chambre.id">
              Chambre {{ chambre.numero }} (Étage {{ chambre.etage }})
            </option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="dateNettoyage">Date et heure</label>
          <input 
            type="datetime-local" 
            id="dateNettoyage" 
            v-model="formulaire.dateNettoyage"
            required
          >
        </div>
        
        <div class="form-group">
          <label>Type de nettoyage</label>
          <div class="checkbox-group">
            <div>
              <input type="checkbox" id="standardCheck" v-model="formulaire.standard">
              <label for="standardCheck">Standard</label>
            </div>
            <div>
              <input type="checkbox" id="desinfectionCheck" v-model="formulaire.desinfection">
              <label for="desinfectionCheck">Désinfection</label>
            </div>
            <div>
              <input type="checkbox" id="literieCheck" v-model="formulaire.literie">
              <label for="literieCheck">Changement literie</label>
            </div>
          </div>
        </div>
        
        <div class="form-group">
          <label for="duree">Durée (minutes)</label>
          <input type="number" id="duree" v-model="formulaire.duree" min="1" required>
        </div>
        
        <div class="form-group">
          <label for="commentaire">Commentaire</label>
          <textarea 
            id="commentaire" 
            v-model="formulaire.commentaire"
            rows="3"
            placeholder="Observations, particularités..."
          ></textarea>
        </div>
        
        <div class="form-group">
          <label>État final</label>
          <div class="radio-group">
            <div>
              <input type="radio" id="etatPret" value="pret" v-model="formulaire.etat" required>
              <label for="etatPret">Prête à être occupée</label>
            </div>
            <div>
              <input type="radio" id="etatProbleme" value="probleme" v-model="formulaire.etat">
              <label for="etatProbleme">Problème à signaler</label>
            </div>
          </div>
        </div>
        
        <div v-if="formulaire.etat === 'probleme'" class="form-group">
          <label for="probleme">Description du problème</label>
          <textarea 
            id="probleme" 
            v-model="formulaire.probleme"
            rows="3"
            placeholder="Décrivez le problème rencontré"
            required
          ></textarea>
        </div>
        
        <div class="button-group">
          <button type="submit" :disabled="envoiEnCours">
            {{ envoiEnCours ? 'Enregistrement...' : 'Enregistrer le nettoyage' }}
          </button>
        </div>
      </form>
      
      <div v-if="message" class="message-succes">
        {{ message }}
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        chambres: [],
        chargement: false,
        envoiEnCours: false,
        erreur: null,
        message: null,
        formulaire: {
          chambreId: "",
          dateNettoyage: this.getCurrentDateTime(),
          standard: true,
          desinfection: false,
          literie: true,
          duree: 30,
          commentaire: "",
          etat: "pret",
          probleme: ""
        }
      };
    },
    methods: {
      getCurrentDateTime() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        return `${year}-${month}-${day}T${hours}:${minutes}`;
      },
      chargerChambres() {
        this.chargement = true;
        this.erreur = null;
        
        axios.get("http://localhost:3002/chambresEnNettoyage")
          .then(response => {
            if (response.data && Array.isArray(response.data)) {
              this.chambres = response.data;
            } else if (response.data && response.data.chambres) {
              this.chambres = response.data.chambres;
            } else {
              this.erreur = "Format de réponse incorrect";
            }
          })
          .catch(error => {
            this.erreur = "Erreur lors du chargement des chambres: " + error.message;
            console.error("Erreur:", error);
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      enregistrerNettoyage() {
        this.envoiEnCours = true;
        this.erreur = null;
        this.message = null;
        
        const donnees = {
          chambreId: this.formulaire.chambreId,
          dateNettoyage: this.formulaire.dateNettoyage,
          nettoyageStandard: this.formulaire.standard,
          desinfection: this.formulaire.desinfection,
          changementLiterie: this.formulaire.literie,
          dureeMinutes: this.formulaire.duree,
          commentaires: this.formulaire.commentaire,
          etatChambre: this.formulaire.etat,
          descriptionProbleme: this.formulaire.probleme
        };
        
        axios.post("http://localhost:3002/enregistrerNettoyage", donnees)
          .then(() => {
            this.message = "Nettoyage enregistré avec succès !";
            // Réinitialiser le formulaire
            this.formulaire = {
              chambreId: "",
              dateNettoyage: this.getCurrentDateTime(),
              standard: true,
              desinfection: false,
              literie: true,
              duree: 30,
              commentaire: "",
              etat: "pret",
              probleme: ""
            };
            // Actualiser la liste des chambres
            this.chargerChambres();
          })
          .catch(error => {
            this.erreur = "Erreur lors de l'enregistrement: " + (error.response?.data?.message || error.message);
            console.error("Erreur:", error);
          })
          .finally(() => {
            this.envoiEnCours = false;
          });
      }
    },
    mounted() {
      this.chargerChambres();
    }
  };
  </script>
  
  <style scoped>
  .form-container {
    max-width: 800px;
    margin: 0 auto;
  }
  
  .form-group {
    margin-bottom: 20px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
  }
  
  input[type="text"],
  input[type="number"],
  input[type="datetime-local"],
  select,
  textarea {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 16px;
  }
  
  .checkbox-group,
  .radio-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  
  .checkbox-group div,
  .radio-group div {
    display: flex;
    align-items: center;
  }
  
  .checkbox-group input,
  .radio-group input {
    margin-right: 8px;
  }
  
  button {
    padding: 10px 16px;
    background-color: #4caf50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 16px;
  }
  
  button:hover {
    background-color: #45a049;
  }
  
  button:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
  
  .erreur {
    color: red;
    margin-bottom: 20px;
  }
  
  .message-succes {
    margin-top: 20px;
    padding: 10px;
    background-color: #d4edda;
    color: #155724;
    border-radius: 4px;
  }
  </style>