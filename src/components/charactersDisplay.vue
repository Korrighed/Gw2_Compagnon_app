<script setup>
import { ref, watch } from "vue";
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../stores/characterStore.js";
import { useApiKey } from "../stores/apiKeyStore.js";
import axios from "axios";
import bankComponent from "./bankComponent.vue";


// Stores
const apiKeyStore = useApiKey();
const characterStore = useCharacterStore();
const { selectedCharacter } = storeToRefs(characterStore);

// Réactifs
const currentApiKey = ref(""); // Clé API pour le formulaire
const characterList = ref([]); // Liste des personnages
const isBankActive = ref(false); // State de la banque
const bankComponentRef = ref(null);

// Enregistrer la clé API dans le store
function handleApiKey() {
  if (!currentApiKey.value) {
    console.error("Clé API invalide !");
    return;
  }
  //Format de la clée avant enregistrement 
  apiKeyStore.selectApiKey(currentApiKey.value);
}

// Récupérer la liste des personnages
async function fetchCharacterList() {
  if (!apiKeyStore.apiKey) {
    alert("Aucune clé API définie !");
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
  console.log(`Personnage sélectionné : ${selectedCharacter}`);
}

function toggleBank() {
  isBankActive.value = !isBankActive.value;
  if (isBankActive.value && bankComponentRef.value) {
    bankComponentRef.value.fetchBank();
    console.log("Banque activée et chargement des données lancé.");
  }
}

function refreshBank() {
  if (bankComponentRef.value) {
    bankComponentRef.value.fetchBank(); // Rafraîchir les données manuellement
    console.log("Données de la banque rafraîchies !");
  }
}

watch(() => apiKeyStore.apiKey, fetchCharacterList);
</script>

<template>
  <form>
      <div class="input-group mb-2 col-6 mx-auto">
        <input type="password" class="form-control" id="idKey" v-model="currentApiKey" placeholder="xxxx-xxxx-xxxx-xxx">
        <button class="btn btn-outline-secondary" type="button" @click.prevent="handleApiKey">
          Submit ApiKey
        </button>
        <button class="btn btn-toggle" :class="{ active: isBankActive }" @click="toggleBank">
          Bank toggle
        </button>
      </div>
      <div class="text-center" v-show="isBankActive">
        <button class="btn btn-outline-primary" @click.prevent="refreshBank">refresh bank</button>
      </div>
      <bankComponent v-show="isBankActive" ref="bankComponentRef" />
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
