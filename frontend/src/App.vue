<template>
  <img alt="Vue logo" src="./assets/logo.png">
  <DataFetcher msg="Welcome to Your Vue.js App"/>
  <ListeMedecins />
</template>

<script>
import DataFetcher from './components/DataFetcher.vue'
import ListeMedecins from './components/ListeMedecins.vue'

export default {
  name: 'App',
  components: {
    DataFetcher,
    ListeMedecins
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
