<template>
  <div class="admin-dashboard">
    <h1>Tableau de bord Medecin</h1>

    <main class="container mx-auto mt-4">
      <ListPatient />
      <dossierPatient />
    </main>
  </div>
</template>
<script>
import ListPatient from "./Medecin/ListPatient.vue";
import DossierPatient from "./Medecin/DossierPatient.vue";

export default {
  name: "App",
  components: {
    ListPatient,
    DossierPatient,
  },
};
</script>
