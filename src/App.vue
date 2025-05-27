<template>
  <main>
    <section class="row apikey col-7 mx-auto">
      <ApiKeyForm @apiKeySubmitted="onApiKeySubmitted" />
    </section>
    <section class="row bank col-7 mx-auto">
      <bankComponent />
    </section>
    <section class="row personnages col-7 mx-auto">
      <charactersDisplay />
    </section>
    <section class="row inventaire col-7 mx-auto">
      <inventoryDisplay />
    </section>
  </main>
</template>

<script setup>
import charactersDisplay from "./components/charactersDisplay.vue";
import inventoryDisplay from "./components/inventoryDisplay.vue";
import ApiKeyForm from "./components/ApiKeyForm.vue";
import bankComponent from "./components/bankComponent.vue";
</script>

<style>
main {
  background-image: url("./assets/JanthirCad.webp");
  background-repeat: no-repeat;
  background-size: 370vh;
  width: 100%;
  background-position: 50% 12%;
  opacity: 0.93;
}

section {
  position: relative;
  z-index: 2;
}
</style>
