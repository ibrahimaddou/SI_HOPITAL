<template>
    <div class="container mx-auto p-4">
      <button @click="chargerPatientsRetardSortie">Charger les patients en retard de sortie</button>
      <div v-if="chargement">Chargement en cours...</div>
      <div v-if="erreur" class="erreur">{{ erreur }}</div>
      <div v-if="!chargement && !erreur && patientsRetard.length > 0">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Id Patient</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prénom</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chambre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date d'arrivée</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date de sortie prévue</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jours de retard</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="(patient, index) in patientsRetard" :key="index">
              <td class="px-6 py-4 whitespace-nowrap">{{ patient.id_patient }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ patient.nom }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ patient.prenom }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ patient.numero_chambre }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(patient.date_arrivee) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ formatDate(patient.date_sortie_previsionnelle) }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ patient.jours_retard }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="!chargement && !erreur && patientsCherches && patientsRetard.length === 0">
        Aucun patient en retard de sortie.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        patientsRetard: [],
        chargement: false,
        erreur: null,
        patientsCherches: false,
      };
    },
    methods: {
      chargerPatientsRetardSortie() {
        this.chargement = true;
        this.erreur = null;
  
        axios
          .get("http://localhost:3002/patientsRetardSortie")
          .then((response) => {
            if (response.data && response.data.patients) {
              this.patientsRetard = response.data.patients;
            } else if (Array.isArray(response.data)) {
              this.patientsRetard = response.data;
            } else {
              this.erreur = "Format de réponse incorrect";
              console.error("Format incorrect:", response.data);
            }
            this.patientsCherches = true;
          })
          .catch((error) => {
            this.erreur = "Erreur lors du chargement des patients en retard: " + error.message;
            console.error("Erreur:", error);
            this.patientsCherches = true;
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      formatDate(dateString) {
        if (!dateString) return '';
        
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR');
      }
    },
  };
  </script>
  
  <style scoped>
  .erreur {
    color: red;
    margin: 10px 0;
  }
  
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
  
  table {
    width: 100%;
    border-collapse: collapse;
  }
  
  th, td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  thead {
    background-color: #f4f4f4;
  }
  </style>