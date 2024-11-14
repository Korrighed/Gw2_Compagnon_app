<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useCharacterStore } from "../stores/characterStore.js";

const accountKey =
    "2510AB82-9F10-0148-9B76-B52311462A8800823087-0CF9-4550-B881-43B3665ACAE3";
const characterList = ref([]);
const gw2ApiUrl = "https://api.guildwars2.com/v2/characters";
const characterStore = useCharacterStore();

async function fetchCharacterList() {
  try {
    const response = await axios.get(gw2ApiUrl, {
      params: {
        access_token: accountKey,
      },
    });
    characterList.value = response.data;
    console.log(characterList.value);
  } catch (error) {
    console.error("Error could not get character list:", error);
  }
}

//Store le personnage selectionné
function handleSelectCharacter(character) {
  characterStore.selectCharacter(character);
  console.log(`Character selected: ${characterStore.selectedCharacter}`)
}
onMounted(() => {
  fetchCharacterList();
});
</script>

<template>
    <ul class="nav nav-tabs">
      <li class="nav-item" v-for="(item, index) in characterList" :key="index" @click="handleSelectCharacter(item)">
        <a  class="nav-link" href="#" :class="{ active: characterStore.isSelected(item) }">
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
