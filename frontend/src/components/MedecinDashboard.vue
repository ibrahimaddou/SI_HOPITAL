<template>
    <div class="admin-dashboard">
      <h1>Tableau de bord administrateur</h1>

      <main class="container mx-auto mt-4">

      <ListPatient />
    </main>

    </div>
</template>
<script>
    import ListPatient from "./Medecin/ListPatient.vue";



export default {
  name: "App",
  components: {
    ListPatient,
    
  },

}
</script>