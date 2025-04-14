<template>
  <div id="app">
    <nav class="bg-blue-500 text-white p-4">
      <div class="container mx-auto">
        <h1 class="text-xl font-bold">Système d'Information Hospitalier</h1>
      </div>
    </nav>
    
    <main class="container mx-auto mt-4">
      <ListeMedecins />
    </main>
    
    
  </div>
  <footer class="bg-gray-100 p-4 mt-8">
      <div class="container mx-auto text-center text-gray-600">
        &copy; 2025 Système d'Information Hospitalier
      </div>
    </footer>
</template>

<script>
//import DataFetcher from './components/DataFetcher.vue'
import ListeMedecins from './components/ListeMedecins.vue'

export default {
  name: 'App',
  components: { 
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
