<script setup>
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../stores/characterStore.js";
import { useApiKey } from "../stores/apiKeyStore.js";
import { gw2ApiService } from "@/utils/gw2Api.js";
import "@/assets/styles/crafting.css";

// Stores
const apiKeyStore = useApiKey();
const characterStore = useCharacterStore();
const { selectedCharacter } = storeToRefs(characterStore);

// Réactifs
const characterList = ref([]);
const isLoading = ref(false);
const characterDetails = ref(new Map()); // Stocke les détails de chaque personnage

// Récupérer les détails d'un personnage
async function fetchCharacterDetails(characterName) {
  try {
    const response = await gw2ApiService.getCharacterDetails(characterName);
    const activeCrafting = response.data.crafting
      .filter((craft) => craft.active)
      .map((craft) => craft.discipline);

    characterDetails.value.set(characterName, {
      profession: response.data.profession,
      crafting: activeCrafting,
    });
  } catch (error) {
    console.error(
      `Erreur lors de la récupération des détails pour ${characterName}:`,
      error
    );
  }
}

// Récupérer la liste des personnages avec leurs détails
async function fetchCharacterList() {
  if (!apiKeyStore.apiKey) {
    console.log("Aucune clé API définie - en attente...");
    return;
  }

  isLoading.value = true;
  try {
    // 1. Récupérer la liste des personnages
    const response = await gw2ApiService.getCharacters();
    characterList.value = Array.isArray(response.data) ? response.data : [];

    // 2. Charger les détails un par un
    for (const character of characterList.value) {
      await fetchCharacterDetails(character);
      // Petit délai entre chaque requête pour éviter la surcharge
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("Chargement complet des personnages et détails");
  } catch (error) {
    console.error("Erreur lors de la récupération des personnages:", error);
    characterList.value = [];
  } finally {
    isLoading.value = false;
  }
}

// Sélectionner un personnage
function handleSelectCharacter(character) {
  characterStore.selectCharacter(character);
  console.log(`Personnage sélectionné : ${character}`);
}

// Auto-fetch sur changement API Key
watch(() => apiKeyStore.apiKey, fetchCharacterList);

// Chargement initial si une clé API est déjà présente
onMounted(() => {
  if (apiKeyStore.apiKey) {
    fetchCharacterList();
  }
});
</script>

<template>
  <div>
    <!-- Loading state -->
    <div v-if="isLoading" class="loading-state">
      <span class="loading-text">Personnages en cours de chargement...</span>
    </div>

    <!-- Navigation personnages -->
    <div v-else-if="characterList.length > 0" class="character-grid">
      <div
        v-for="(item, index) in characterList"
        :key="index"
        class="character-card"
        :class="{ active: selectedCharacter === item }"
        @click="handleSelectCharacter(item)"
      >
        <div class="character-content row g-0">
          <!-- Section principale (2/3) -->
          <div class="col-10 main-info">
            <div class="character-header">
              <span class="character-name">{{ item }}</span>
            </div>
            <div class="profession">
              {{ characterDetails.get(item)?.profession }}
            </div>
          </div>

          <!-- Section crafting (1/3) -->
          <div class="col-2 d-flex align-items-start m-0 p-0">
            <div v-if="characterDetails.get(item)?.crafting.length">
              <span
                v-for="(discipline, index) in characterDetails
                  .get(item)
                  .crafting.slice(0, 2)"
                :key="discipline"
                class="crafting-icon"
                :class="`crafting-${discipline.toLowerCase()}`"
                :title="discipline"
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Message état vide -->
    <div v-else class="text-center py-3">
      <p>Aucun personnage disponible. Vérifiez votre clé API.</p>
    </div>
  </div>
</template>

<style scoped>
.character-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.3rem;
}

.character-card {
  position: relative;
  border-radius: 10px;
  background: linear-gradient(
    to bottom,
    rgb(0, 0, 0, 0.4),
    rgba(51, 50, 50, 0.4)
  );
  border: 1px solid rgba(138, 133, 133, 0.7) !important;
  backdrop-filter: blur(25px) saturate(1.2) contrast(1.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
  transition: all 0.1s ease;
  cursor: pointer;
  overflow: hidden;
  height: 9vh;
  width: 22vh;
  padding-block-start: 0.5rem;
  padding-inline-start: 0.5rem;
  color: white;
}

.character-card.active {
  border-color: #dc3545;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.6),
    rgb(255, 0, 0, 0.6)
  );
}

.character-content {
  height: 100%;
}

.character-name {
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
}

.crafting-icon {
  width: 4vh;
  height: 4vh;
  padding: 0rem;
  margin: 0rem;
}

/* Effet glassmorphism */
.character-card::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  backdrop-filter: blur(5px);
  z-index: -1;
}

.loading-state {
  text-align: center;
  padding: 2rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  margin: 1rem;
}

.loading-text {
  color: #fff;
  font-size: 1.1rem;
  font-weight: 300;
  letter-spacing: 0.5px;
  opacity: 0.8;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.4;
  }
}
</style>
