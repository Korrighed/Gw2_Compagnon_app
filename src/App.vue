<template>
  <body>
    <main>
      <section class="row apikey col-lg-7 col-md-10 col-10 mx-auto">
        <ApiKeyForm @apiKeySubmitted="onApiKeySubmitted" />
      </section>
      <template v-if="!hasValidApiKey">
        <section class="row bank col-lg-7 col-md-10 col-10 mx-auto">
          <TutoComponent />
        </section>
      </template>
      <template v-else>
        <section class="row bank col-lg-7 col-md-10 col-10 mx-auto">
          <bankComponent />
        </section>
        <section class="row personnages col-lg-7 col-md-10 col-10 mx-auto">
          <charactersDisplay />
        </section>
        <section class="row inventaire col-lg-7 col-md-10 col-10 mx-auto">
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
  opacity: 0.95;
  min-height: 390vh;
}

.glassmorphism {
  background: rgba(0, 0, 0, 0.4) !important; /* Fond plus sombre */
  backdrop-filter: blur(25px) saturate(1.2) contrast(1.1);
  border: 1px solid rgba(138, 133, 133, 0.7) !important;
  border-radius: 10px;
  color: white;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.8);
}

.chevronIcon {
  width: 6vh;
  height: 6vh;
  filter: brightness(0) invert(1);
  transition: transform 0.3s ease;
}

/* Rotation quand accordéon ouvert */
.widget-header.active .chevronIcon {
  transform: rotate(180deg);
}
</style>
