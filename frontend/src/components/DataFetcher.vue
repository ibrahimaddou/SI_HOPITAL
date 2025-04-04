<template>
  <div>
    <h1>{{ message }}</h1>
    <button @click="fetchData">Charger les données</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      message: ''
    }
  },
  methods: {
    fetchData() {
      axios.get('http://localhost:3002/api/data')
        .then(response => {
          this.message = response.data.message;
        })
        .catch(error => {
          console.error('Erreur:', error);
        });
    }
  }
}
</script>