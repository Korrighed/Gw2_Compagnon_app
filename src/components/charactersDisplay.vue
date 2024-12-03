<script setup>
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";
import axios from "axios";
import { useCharacterStore } from "../stores/characterStore.js";
import { useApiKey } from "../stores/apiKeyStore.js";

// Stores
const apiKeyStore = useApiKey();
const characterStore = useCharacterStore();
const { selectedCharacter } = storeToRefs(characterStore);

// Réactifs
const currentApiKey = ref(""); // Clé API pour le formulaire
const characterList = ref([]); // Liste des personnages

// URL API Guild Wars 2
const gw2ApiUrl = "https://api.guildwars2.com/v2/characters";

// Enregistrer la clé API dans le store
function handleApiKey() {
  const apiKey = currentApiKey;
  if (!apiKey) {
    console.error("Clé API invalide !");
    return;
  }
  apiKeyStore.selectApiKey(apiKey); // Stocker une clé sans espaces superflus
  console.log(`Clé API enregistrée : ${apiKey}`);
}



// Récupérer la liste des personnages
async function fetchCharacterList() {
  if (!apiKeyStore.apiKey) {
    alert("Aucune clé API définie !");
    return;
  }

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
  console.log(`Personnage sélectionné : ${selectedCharacter}`);
}

// Regarder les changements de clé API
watch(() => apiKeyStore.apiKey, fetchCharacterList);
</script>

<template>
  <form>
    <div class="row">
      <div class="input-group mb-2 col-6 mx-auto">
        <input type="password" class="form-control" id="idKey" placeholder="xxxxx-xxxx-xxxx-xxxx"
          v-model="currentApiKey" />
        <button class="btn btn-outline-secondary" type="button">Voir</button>
        <button class="btn btn-outline-secondary" type="button" @click="handleApiKey">
          Soumettre
        </button>
      </div>
    </div>
  </form>
  <ul class="nav nav-tabs">
    <li class="nav-item" v-for="(item, index) in characterList" :key="index" @click="handleSelectCharacter(item)">
      <a class="nav-link" href="#" :class="{ active: selectedCharacter === item }">
        {{ item }}
      </a>
    </li>
  </ul>
</template>

<style>
.nav-link.active {
  background-color: #007bff;
  color: white;
}
</style>
