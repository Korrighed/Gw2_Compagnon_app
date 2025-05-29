<template>
  <body>
    <main>
      <section class="row apikey col-7 mx-auto">
        <ApiKeyForm @apiKeySubmitted="onApiKeySubmitted" />
      </section>
      <template v-if="!hasValidApiKey">
        <section class="row bank col-7 mx-auto">
          <TutoComponent />
        </section>
      </template>
      <template v-else>
        <section class="row bank col-7 mx-auto">
          <bankComponent />
        </section>
        <section class="row personnages col-7 mx-auto">
          <charactersDisplay />
        </section>
        <section class="row inventaire col-7 mx-auto">
          <inventoryDisplay />
        </section>
      </template>
    </main>
  </body>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useApiKey } from "./stores/apiKeyStore";
import charactersDisplay from "./components/charactersDisplay.vue";
import inventoryDisplay from "./components/inventoryDisplay.vue";
import ApiKeyForm from "./components/ApiKeyForm.vue";
import bankComponent from "./components/bankComponent.vue";
import TutoComponent from "./components/tutoComponent.vue";

const apiKeyStore = useApiKey();

const hasValidApiKey = computed(() => {
  return apiKeyStore.isValidApiKey;
});

onMounted(() => {
  apiKeyStore.loadFromLocalStorage();
});

const onApiKeySubmitted = (apiKey) => {
  apiKeyStore.selectApiKey(apiKey);
};
</script>

<style>
main {
  background-image: url("./assets/JanthirCad.webp");
  background-repeat: no-repeat;
  background-size: 390vh;
  width: 100%;
  background-position: 45% 13%;
  background-attachment: fixed;
  opacity: 0.9;
  min-height: 390vh;
}

.glassmorphism {
  background: rgba(248, 248, 248, 0.15) !important;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(138, 133, 133, 0.5) !important;
  border-radius: 10px;
  color: white;
  box-shadow: 1px 2px 10px black;
}
</style>
