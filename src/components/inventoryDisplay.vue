<script setup>
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../stores/characterStore.js";
import { ref, onMounted, watch } from "vue";
import axios from "axios";

const characterStore = useCharacterStore();
const { selectedCharacter } = storeToRefs(characterStore);
const inventoryList = ref([]);
const accountKeyInvent = "AB80A66C-EB05-F647-8E04-917AE8028FDE2DB0E55F-FDE0-4C57-8602-F8637CE9C5A4";

// Fonction pour récupérer l'inventaire du personnage sélectionné
async function fetchInventory() {
  if (!selectedCharacter.value) {
    console.log("Aucun personnage sélectionné.");
    return;
  }

  const gw2ApiInventoryUrl = `https://api.guildwars2.com/v2/characters/${encodeURIComponent(selectedCharacter.value)}/inventory`;

  try {
    const response = await axios.get(gw2ApiInventoryUrl, {
      params: {
        access_token: accountKeyInvent,
      },
    });
    inventoryList.value = response.data;
    console.log("Inventaire récupéré :", inventoryList.value);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'inventaire :", error);
  }
}

// Surveiller le changement du personnage sélectionné et récupérer l'inventaire
watch(selectedCharacter, (newValue) => {
  if (newValue) {
    fetchInventory();
  }
});

onMounted(() => {
  if (selectedCharacter.value) {
    fetchInventory();
  }
});
</script>

<template>

</template>

<style>
/* Styles optionnels */
.nav-link.active {
  background-color: #007bff;
  color: white;
}
</style>
