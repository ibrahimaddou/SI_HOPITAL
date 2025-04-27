<template>
    <div class="admin-dashboard">
      <h1>Tableau de bord administrateur</h1>

      <main class="container mx-auto mt-4">
      
      <ListeMedecins />
      <ListeInfirm />
      <ListPersAdmin />
      
      <AjouterMedecin />
      <ListPersNet />
      
    </main>

    </div>
</template>
<script>
    import AjouterMedecin from "./AjouterMedecin.vue";
import ListeInfirm from "./ListeInfirm.vue";
import ListeMedecins from "./ListeMedecins.vue";
import ListPersAdmin from "./ListPersAdmin.vue";
import ListPersNet from "./ListPersNet.vue";

export default {
  name: "App",
  components: {
    ListeMedecins,
    ListeInfirm,
    ListPersAdmin,
    ListPersNet,
    AjouterMedecin,
    
  },

}
</script>