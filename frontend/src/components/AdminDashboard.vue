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
    import AjouterMedecin from "./Admin/AjouterMedecin.vue";
import ListeInfirm from "./Admin/ListeInfirm.vue";
import ListeMedecins from "./Admin/ListeMedecins.vue";
import ListPersAdmin from "./Admin/ListPersAdmin.vue";
import ListPersNet from "./Admin/ListPersNet.vue";

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