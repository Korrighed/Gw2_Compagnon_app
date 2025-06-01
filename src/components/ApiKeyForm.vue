<template>
  <div class="input-group my-3 p-0 align-items-center">
    <!-- Affichage si clé existante -->
    <div v-if="apiKeyStore.isValidApiKey" class="d-flex col-md-10 col-7">
      <input
        class="form-control glassmorphism me-md-4 me-4 col-md-6 col-6 p-lg-3"
        :value="maskedApiKey"
        readonly
        placeholder="Clé API enregistrée"
      />
      <button
        class="btn text-white glassmorphism text-white ms-md-1 col-md-2 col-7 p-2"
        type="button"
        @click="clearApiKey"
      >
        Changez de clé
      </button>
    </div>

    <!-- Formulaire si aucune clé -->
    <div v-else class="d-flex col-md-10 col-7">
      <input
        class="form-control glassmorphism me-md-4 me-4 col-md-6 col-6"
        id="idKey"
        v-model="currentApiKey"
        placeholder="xxxx-xxxx-xxxx-xxx"
        @keyup.enter="handleApiKey"
      />
      <button
        class="btn btn-outline-secondary glassmorphism text-white ms-md-1 col-md-2 col-7 p-2"
        type="button"
        @click.prevent="handleApiKey"
      >
        Confirmez votre clé
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useApiKey } from "../stores/apiKeyStore.js";

const apiKeyStore = useApiKey();
const currentApiKey = ref("");
const emit = defineEmits(["apiKeySubmitted", "apiKeyCleared"]);

const maskedApiKey = computed(() => {
  if (!apiKeyStore.apiKey) return "";
  const key = apiKeyStore.apiKey;
  return `${key.substring(0, 8)}${"*".repeat(key.length - 16)}${key.substring(
    key.length - 8
  )}`;
});

onMounted(() => {
  apiKeyStore.loadFromLocalStorage();
});

function handleApiKey() {
  if (!currentApiKey.value) {
    console.error("Clé API invalide !");
    return;
  }
  apiKeyStore.selectApiKey(currentApiKey.value);
  emit("apiKeySubmitted", currentApiKey.value);
  currentApiKey.value = "";
}

function clearApiKey() {
  apiKeyStore.clearApiKey();
  emit("apiKeyCleared");
}
</script>

<style>
.button {
  border: 1px solid red !important;
}

.button:hover {
  border-color: rgba(138, 133, 133, 0.5) !important;
  background-image: linear-gradient(rgb(250, 0, 0), black) !important;
}
</style>
