<template>
  <div class="container mx-auto">
    <h2 class="text-xl font-semibold mb-4">Ajouter un nouveau médecin</h2>
    
    <!-- Formulaire d'ajout de médecin (toujours visible) -->
    <form @submit.prevent="ajouterMedecin" class="space-y-3">
      <div>
        <label class="block text-sm font-medium text-gray-700">Nom</label>
        <input 
          v-model="nouveauMedecin.nom" 
          type="text" 
          required 
          class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Prénom</label>
        <input 
          v-model="nouveauMedecin.prenom" 
          type="text" 
          required 
          class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Adresse</label>
        <input 
          v-model="nouveauMedecin.adresse" 
          type="text" 
          required 
          class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Téléphone</label>
        <input 
          v-model="nouveauMedecin.telephone" 
          type="tel" 
          required 
          class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Email</label>
        <input 
          v-model="nouveauMedecin.email" 
          type="email" 
          required 
          class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Date d'embauche</label>
        <input 
          v-model="nouveauMedecin.dateEmbauche" 
          type="date" 
          required 
          class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Mot de passe</label>
        <input 
          v-model="nouveauMedecin.motDePasse" 
          type="password" 
          required 
          class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border"
        >
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700">Service</label>
        <select 
          v-model="selectedService" 
          @change="updateSpecialite"
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
        <label class="block text-sm font-medium text-gray-700">Spécialité</label>
        <input 
          v-model="nouveauMedecin.specialite" 
          type="text" 
          readonly
          required 
          class="mt-1 block w-full rounded border-gray-300 shadow-sm p-2 border bg-gray-100"
        >
      </div>
      <button 
        type="submit" 
        class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
      >
        Enregistrer
      </button>
    </form>
    
    <!-- Message de confirmation ou d'erreur pour l'ajout -->
    <div v-if="message" class="mt-3 p-3 rounded" :class="{'bg-green-100 text-green-800': !erreur, 'bg-red-100 text-red-800': erreur}">
      {{ message }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      selectedService: '',
      nouveauMedecin: {
        nom: '',
        prenom: '',
        adresse: '',
        telephone: '',
        email: '',
        dateEmbauche: new Date().toISOString().split('T')[0],
        motDePasse: '',
        idService: '',
        specialite: ''
      },
      message: '',
      erreur: false
    }
  },
  methods: {
    updateSpecialite() {
      this.nouveauMedecin.idService = this.selectedService;
      
      // Définir la spécialité en fonction du service sélectionné
      switch(this.selectedService) {
        case '1':
          this.nouveauMedecin.specialite = 'Cardiologue';
          break;
        case '2':
          this.nouveauMedecin.specialite = 'Pédiatre';
          break;
        case '3':
          this.nouveauMedecin.specialite = 'Neurologue';
          break;
        case '4':
          this.nouveauMedecin.specialite = 'Radiologue';
          break;
        default:
          this.nouveauMedecin.specialite = '';
      }
    },
    ajouterMedecin() {
      // Réinitialiser le message
      this.message = '';
      this.erreur = false;
      
      // Vérification des champs
      const champsRequis = ['nom', 'prenom', 'adresse', 'telephone', 'email', 'dateEmbauche', 'motDePasse', 'idService', 'specialite'];
      const champManquant = champsRequis.find(champ => !this.nouveauMedecin[champ]);
      
      if (champManquant) {
        this.message = `Veuillez remplir le champ ${champManquant}`;
        this.erreur = true;
        return;
      }
      
      axios.post('http://localhost:3002/medecins', this.nouveauMedecin)
        .then(() => { 
          this.message = "Médecin ajouté avec succès";
          
          // Réinitialiser le formulaire
          this.nouveauMedecin = {
            nom: '',
            prenom: '',
            adresse: '',
            telephone: '',
            email: '',
            dateEmbauche: new Date().toISOString().split('T')[0],
            motDePasse: '',
            idService: '',
            specialite: ''
          };
          this.selectedService = '';
          
          // Émettre l'événement pour indiquer qu'un médecin a été ajouté
          this.$emit('medecin-ajoute');
        })
        .catch(error => {
          this.message = "Erreur lors de l'ajout du médecin: " + error.message;
          this.erreur = true;
          console.error('Erreur:', error);
        });
    }
  }
}
</script>