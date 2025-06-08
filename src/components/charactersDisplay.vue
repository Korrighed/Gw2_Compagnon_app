<script setup>
import { ref, watch, onMounted } from "vue";
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../stores/characterStore.js";
import { useApiKey } from "../stores/apiKeyStore.js";
import { gw2ApiService } from "@/utils/gw2Api.js";
import "../assets/styles/crafting.css";

// Stores
const apiKeyStore = useApiKey();
const characterStore = useCharacterStore();
const { selectedCharacter } = storeToRefs(characterStore);

// Réactifs
const characterList = ref([]);
const isLoading = ref(false);
const characterDetails = ref(new Map()); // Stocke les détails de chaque personnage

// Utility function for retries
async function withTimeout(promise, timeout = 12000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const result = await promise;
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Récupérer les détails d'un personnage
async function fetchCharacterDetails(characterName) {
  const maxRetries = 2;
  let attempt = 0;

  while (attempt < maxRetries) {
    try {
      const [coreResponse, craftingResponse] = await Promise.allSettled([
        withTimeout(gw2ApiService.getCharacterCore(characterName)),
        withTimeout(gw2ApiService.getCharacterCrafting(characterName)),
      ]);

      // Traitement même si une requête échoue
      const coreData =
        coreResponse.status === "fulfilled" ? coreResponse.value.data : null;
      const craftingData =
        craftingResponse.status === "fulfilled"
          ? craftingResponse.value.data.crafting // Accès au tableau via .crafting
          : [];

      const activeCrafting = Array.isArray(craftingData)
        ? craftingData
            .filter((craft) => craft.active === true) // Accès direct à craft.active
            .map((craft) => craft.discipline) // Accès direct à craft.discipline
        : [];

      characterDetails.value.set(characterName, {
        profession: coreData?.profession || "Classe non trouvée :(",
        crafting: activeCrafting,
      });

      console.log(
        `Chargement réussi pour ${characterName} (tentative ${attempt + 1})`
      );
      return;
    } catch (error) {
      attempt++;
      console.warn(
        `Échec du chargement pour ${characterName} (tentative ${attempt}/${maxRetries})`,
        error.message // Ajout du message d'erreur spécifique
      );

      if (attempt === maxRetries) {
        console.error(
          `Échec définitif pour ${characterName} après ${maxRetries} tentatives`,
          error.message
        );
        characterDetails.value.set(characterName, {
          profession: "Classe non trouvée :(",
          crafting: [],
        });
        return; // Sortir de la fonction après le nombre max de tentatives
      }

      // Attendre avant la prochaine tentative
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
}

// Récupérer la liste des personnages avec leurs détails
async function fetchCharacterList() {
  if (!apiKeyStore.apiKey) {
    console.log("Aucune clé API définie - en attente...");
    return;
  }

  isLoading.value = true; // Début du chargement

  try {
    // 1. Chargement rapide de la liste des personnages
    const response = await gw2ApiService.getCharacters();
    characterList.value = Array.isArray(response.data) ? response.data : [];

    // 2. Lancer le chargement des détails en arrière-plan
    await loadCharacterDetails();
  } catch (error) {
    console.error("Erreur lors de la récupération des personnages:", error);
    characterList.value = [];
  } finally {
    isLoading.value = false; // Fin du chargement
  }
}

// Modification de loadCharacterDetails pour retourner une promesse
async function loadCharacterDetails() {
  const chunkSize = 2;
  for (let i = 0; i < characterList.value.length; i += chunkSize) {
    const chunk = characterList.value.slice(i, i + chunkSize);
    await Promise.all(
      chunk.map((character) => fetchCharacterDetails(character))
    );
    if (i + chunkSize < characterList.value.length) {
      await new Promise((resolve) => setTimeout(resolve, 700));
    }
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

    <template v-else-if="characterList.length > 0">
      <!-- Desktop Grid (masqué sur mobile) -->
      <div class="d-none d-lg-block">
        <div class="character-grid">
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
                    v-for="discipline in characterDetails.get(item).crafting"
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
      </div>

      <!-- Mobile Menu (masqué sur desktop) -->
      <div class="d-lg-none">
        <div class="dropdown">
          <button
            class="btn dropdown-toggle w-100 character-button"
            :class="{ 'character-selected': selectedCharacter }"
            type="button"
            id="dropdownMenuButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <template v-if="selectedCharacter">
              <div class="d-flex justify-content-between align-items-center">
                <div>
                  <span class="character-name">{{ selectedCharacter }}</span>
                  <small class="d-block">
                    {{ characterDetails.get(selectedCharacter)?.profession }}
                  </small>
                </div>
                <div class="crafting-icons">
                  <span
                    v-for="discipline in characterDetails.get(selectedCharacter)
                      ?.crafting"
                    :key="discipline"
                    class="crafting-icon"
                    :class="`crafting-${discipline.toLowerCase()}`"
                    :title="discipline"
                  ></span>
                </div>
              </div>
            </template>
            <template v-else> Sélectionnez un personnage </template>
          </button>
          <ul
            class="dropdown-menu dropdown-menu-dark w-100"
            aria-labelledby="dropdownMenuButton"
          >
            <li v-for="(item, index) in characterList" :key="index">
              <!-- Ajouter data-bs-toggle="dropdown" sur le lien -->
              <a
                class="dropdown-item d-flex justify-content-between align-items-center"
                :class="{ active: selectedCharacter === item }"
                @click="handleSelectCharacter(item)"
                data-bs-toggle="dropdown"
              >
                <div>
                  <span class="character-name">{{ item }}</span>
                  <small class="d-block">{{
                    characterDetails.get(item)?.profession
                  }}</small>
                </div>
                <div class="crafting-icons">
                  <span
                    v-for="discipline in characterDetails.get(item)?.crafting"
                    :key="discipline"
                    class="crafting-icon"
                    :class="`crafting-${discipline.toLowerCase()}`"
                    :title="discipline"
                  ></span>
                </div>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </template>

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

/* Ajout styles mobile */
.dropdown-menu {
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 1);
  max-height: 50vh;
  overflow-y: auto;
}

.dropdown-menu-dark {
  list-style: none;
  padding: 0;
  margin: 0;
}

.dropdown-item {
  color: white;
  padding: 0.75rem 1rem;
  z-index: 1000;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.character-button {
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
  padding: 0.75rem 1rem; /* Même padding que dropdown-item */
  height: 6rem;
  transition: all 0.3s ease;
  text-align: left; /* Alignement à gauche comme les items */
}

.character-button.character-selected {
  background: linear-gradient(
    to right,
    rgba(220, 53, 69, 0.6),
    rgba(0, 0, 0, 0.6)
  );
  border-left: 4px solid rgba(220, 53, 69, 0.8);
}

/* Style commun pour le hover du bouton et des items */
.character-button:hover,
.dropdown-item:hover {
  background: linear-gradient(
    to right,
    rgba(220, 53, 69, 0.6),
    rgba(0, 0, 0, 0.6)
  );
  border-left: 4px solid rgba(220, 53, 69, 0.8);
  color: white;
}

/* Ajuster le style des éléments internes pour qu'ils correspondent */
.character-button .character-info,
.dropdown-item > div {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.character-button small,
.dropdown-item small {
  font-size: 0.8rem;
  opacity: 0.8;
}

.crafting-icons {
  display: flex;
  gap: 0.25rem;
}

@media (max-width: 768px) {
  .crafting-icon {
    width: 3vh;
    height: 3vh;
  }
}
</style>
