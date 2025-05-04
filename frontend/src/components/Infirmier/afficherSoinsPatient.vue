<template>
    <div class="container mx-auto p-4">
      <!-- Entrée pour l'ID du patient -->
      <div class="mb-4">
        <label for="patientId" class="mr-2">ID du patient:</label>
        <input 
          id="patientId" 
          v-model="patientId" 
          type="number" 
          class="border rounded px-2 py-1"
          placeholder="Entrez l'ID du patient"
        />
        <button @click="chargerSoins" class="ml-2">Afficher les soins</button>
      </div>
  
      <!-- Informations du patient -->
      <div v-if="patient" class="bg-gray-100 p-4 rounded mb-4">
        <h2 class="text-xl font-bold">Patient: {{ patient.prenom }} {{ patient.nom }}</h2>
        <p>Date de naissance: {{ formatDate(patient.date_naissance) }}</p>
        <p>Antécédents médicaux: {{ patient.antecedents_medicaux || "Aucun antécédent enregistré" }}</p>
      </div>
  
      <div v-if="chargement">Chargement en cours...</div>

      <div v-if="erreur" class="erreur">{{ erreur }}</div>
  
      <!-- Liste des soins -->
      <div v-if="!chargement && !erreur && soins.length > 0">
        <h3 class="text-lg font-semibold mb-2">Soins prévus</h3>
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Id Soin
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Réunion décision
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Médicaments
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Administrations
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="soin in soins" :key="soin.id_soin">
              <td class="px-6 py-4 whitespace-nowrap">
                {{ soin.id_soin }}
              </td>
              <td class="px-6 py-4">{{ soin.description }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ formatDate(soin.date_reunion) }} - {{ soin.sujet_reunion }}
              </td>
              <td class="px-6 py-4">
                <ul v-if="soin.medicaments && soin.medicaments.length > 0">
                  <li v-for="(med, index) in soin.medicaments" :key="index">
                    {{ med.nom }} ({{ med.dosage }}) - {{ med.quantite }}
                  </li>
                </ul>
                <span v-else>Aucun médicament</span>
              </td>
              <td class="px-6 py-4">
                <ul v-if="soin.administrations && soin.administrations.length > 0">
                  <li v-for="(adm, index) in soin.administrations" :key="index">
                    {{ formatDateTime(adm.date_heure) }} 
                    par {{ adm.prenom_infirmier }} {{ adm.nom_infirmier }}
                  </li>
                </ul>
                <span v-else>Aucune administration enregistrée</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
  
      <!-- Message si aucun soin trouvé après tentative de chargement -->
      <div v-if="!chargement && !erreur && soinsCherches && soins.length === 0">
        Aucun soin trouvé pour ce patient.
      </div>
    </div>
  </template>
  
  <script>
  import axios from "axios";
  
  export default {
    data() {
      return {
        patientId: "", // Pour stocker l'ID saisi par l'utilisateur
        patient: null, // Pour stocker les informations du patient
        soins: [],
        chargement: false,
        erreur: null,
        soinsCherches: false, // Indique si une recherche a été effectuée
      };
    },
    methods: {
      chargerSoins() {
        if (!this.patientId) {
          this.erreur = "Veuillez entrer un ID de patient";
          return;
        }
  
        this.chargement = true;
        this.erreur = null;
        this.soins = [];
        this.patient = null;
  
        // Charger les informations du patient d'abord
        axios
          .get(`http://localhost:3002/patients/${this.patientId}`)
          .then((response) => {
            if (response.data) {
              this.patient = response.data;
              
              return axios.get(`http://localhost:3002/afficherSoinsPatient/${this.patientId}`);
            } else {
              throw new Error("Patient non trouvé");
            }
          })
          .then((response) => {
            // Vérifier la structure de la réponse pour les soins
            if (response.data && Array.isArray(response.data)) {
              this.soins = response.data;
            } else if (response.data && response.data.soins) {
              this.soins = response.data.soins;
            } else {
              this.erreur = "Format de réponse incorrect";
              console.error("Format incorrect:", response.data);
            }
            this.soinsCherches = true; // Marquer que la recherche a été effectuée
          })
          .catch((error) => {
            this.erreur = "Erreur lors du chargement des données: " + error.message;
            console.error("Erreur:", error);
            this.soinsCherches = true;
          })
          .finally(() => {
            this.chargement = false;
          });
      },
      formatDate(dateString) {
        if (!dateString) return "Non spécifiée";
  
        const date = new Date(dateString);
        return date.toLocaleDateString("fr-FR");
      },
      formatDateTime(dateTimeString) {
        if (!dateTimeString) return "Non spécifiée";
  
        const date = new Date(dateTimeString);
        return date.toLocaleDateString("fr-FR") + " " + date.toLocaleTimeString("fr-FR", {
          hour: "2-digit",
          minute: "2-digit"
        });
      },
    },
  };
  </script>
  
  <style scoped>
  .erreur {
    color: red;
    margin: 10px 0;
  }
  
  button {
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
    margin-top: 15px;
  }
  
  th,
  td {
    padding: 12px;
    text-align: left;
    border-bottom: 1px solid #ddd;
  }
  
  thead {
    background-color: #f4f4f4;
  }
  
  ul {
    list-style-type: disc;
    padding-left: 20px;
  }
  
  li {
    margin-bottom: 4px;
  }
  </style>