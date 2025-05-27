<script setup>
import { ref } from "vue";
import { useApiKey } from "../stores/apiKeyStore.js";

// Store
const apiKeyStore = useApiKey();

// Réactifs
const currentApiKey = ref("");

// Événements émis vers parent
const emit = defineEmits(["apiKeySubmitted"]);

// Gérer soumission clé API
function handleApiKey() {
  if (!currentApiKey.value) {
    console.error("Clé API invalide !");
    return;
  }

  // Enregistrer dans store
  apiKeyStore.selectApiKey(currentApiKey.value);

  // Notifier parent
  emit("apiKeySubmitted", currentApiKey.value);

  // Reset formulaire
  currentApiKey.value = "";
}
</script>

<template>
  <div class="input-group mb-2">
    <input
      class="form-control"
      id="idKey"
      v-model="currentApiKey"
      placeholder="xxxx-xxxx-xxxx-xxx"
      @keyup.enter="handleApiKey"
    />
    <button
      class="btn btn-outline-secondary"
      type="button"
      @click.prevent="handleApiKey"
    >
      Submit ApiKey
    </button>
  </div>
</template>
