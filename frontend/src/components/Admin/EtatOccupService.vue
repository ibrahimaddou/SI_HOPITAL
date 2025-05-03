<template>
    <div class="container mx-auto p-4">
      <div class="mb-4 flex flex-col md:flex-row gap-4">
        <div>
          <label class="block mb-1">Service</label>
          <select v-model="idService" class="p-2 border rounded">
            <option value="">Sélectionnez un service</option>
            <option value="1">Cardiologie</option>
            <option value="2">Pédiatrie</option>
            <option value="3">Urgences</option>
            <option value="4">Chirurgie</option>
          </select>
        </div>
        <div>
          <label class="block mb-1">Date</label>
          <input type="date" v-model="date" class="p-2 border rounded" />
        </div>
        <div class="flex items-end">
          <button @click="chargerEtatOccupation" class="p-2 bg-green-500 text-white rounded">
            Afficher
          </button>
        </div>
      </div>
  
      <div v-if="chargement">Chargement en cours...</div>
      <div v-if="erreur" class="text-red-500">{{ erreur }}</div>
  
      <div v-if="infoService" class="border rounded p-4">
        <h3 class="text-xl mb-3">{{ infoService.nom_service }}</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p><strong>Médecin référent:</strong> {{ infoService.medecin_referent }}</p>
            <p><strong>Capacité totale:</strong> {{ infoService.capacite_totale }} lits</p>
            <p><strong>Lits occupés:</strong> {{ infoService.lits_occupes }}</p>
          </div>
          <div>
            <p><strong>Taux d'occupation:</strong> {{ infoService.taux_occupation }}%</p>
            <div class="w-full bg-gray-200 rounded h-4 mt-2">
              <div class="h-4 rounded bg-blue-500" :style="{ width: infoService.taux_occupation + '%' }"></div>
            </div>
          </div>
        </div>
      </div>
  
      <div v-if="!chargement && !erreur && statutCherche && !infoService">
        Aucune information disponible pour ce service à cette date.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        idService: "",
        date: new Date().toISOString().split("T")[0],
        infoService: null,
        chargement: false,
        erreur: null,
        statutCherche: false,
      };
    },
    methods: {
      chargerEtatOccupation() {
        if (!this.idService || !this.date) {
          this.erreur = "Veuillez sélectionner un service et une date";
          return;
        }
  
        this.chargement = true;
        this.erreur = null;
        this.infoService = null;
  
        axios
          .get(`http://localhost:3002/etatOccupationService/${this.idService}/${this.date}`)
          .then((response) => {
            this.infoService = response.data;
            this.statutCherche = true;
          })
          .catch((error) => {
            this.erreur = "Erreur: " + (error.response?.data?.error || error.message);
            this.statutCherche = true;
          })
          .finally(() => {
            this.chargement = false;
          });
      }
    }
  };
  </script>
  
  <style scoped>
  button {
    cursor: pointer;
  }
  button:hover {
    background-color: #3e8e41;
  }
  </style>