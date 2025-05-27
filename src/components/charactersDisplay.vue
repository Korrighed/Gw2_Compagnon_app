<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../stores/characterStore.js";
import { useApiKey } from "../stores/apiKeyStore.js";
import axios from "axios";

// Stores
const apiKeyStore = useApiKey();
const characterStore = useCharacterStore();
const { selectedCharacter } = storeToRefs(characterStore);

// Réactifs
const characterList = ref([]);

// Récupérer la liste des personnages
async function fetchCharacterList() {
  if (!apiKeyStore.apiKey) {
    console.log("Aucune clé API définie - en attente...");
    return;
  }

  const gw2ApiUrl = "https://api.guildwars2.com/v2/characters";
  try {
    const response = await axios.get(gw2ApiUrl, {
      params: {
        access_token: apiKeyStore.apiKey,
      },
    });
    characterList.value = Array.isArray(response.data) ? response.data : [];
    console.log("Liste des personnages :", characterList.value);
  } catch (error) {
    console.error("Erreur lors de la récupération des personnages :", error);
  }
}

// Sélectionner un personnage
function handleSelectCharacter(character) {
  characterStore.selectCharacter(character);
  console.log(`Personnage sélectionné : ${character}`);
}

// Auto-fetch sur changement API Key
watch(() => apiKeyStore.apiKey, fetchCharacterList);
</script>

<template>
  <div class="col-12">
    <!-- Navigation personnages -->
    <ul class="nav nav-tabs" v-if="characterList.length > 0">
      <li class="nav-item" v-for="(item, index) in characterList" :key="index">
        <a
          class="nav-link"
          href="#"
          :class="{ active: selectedCharacter === item }"
          @click.prevent="handleSelectCharacter(item)"
        >
          {{ item }}
        </a>
      </li>
    </ul>

    <!-- Message état vide -->
    <div v-else class="text-center text-muted py-3">
      <p>Aucun personnage disponible. Vérifiez votre clé API.</p>
    </div>
  </div>
</template>

<style></style>
