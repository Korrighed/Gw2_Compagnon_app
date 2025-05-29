<template>
  <body>
    <main>
      <section class="row apikey col-7 mx-auto">
        <ApiKeyForm @apiKeySubmitted="onApiKeySubmitted" />
      </section>
      <section class="row bank col-7 mx-auto">
        <bankComponent />
      </section>
      <section class="row bank col-7 mx-auto">
        <TutoComponent />
      </section>
      <section class="row personnages col-7 mx-auto">
        <charactersDisplay />
      </section>
      <section class="row inventaire col-7 mx-auto">
        <inventoryDisplay />
      </section>
    </main>
  </body>
</template>

<script setup>
import charactersDisplay from "./components/charactersDisplay.vue";
import inventoryDisplay from "./components/inventoryDisplay.vue";
import ApiKeyForm from "./components/ApiKeyForm.vue";
import bankComponent from "./components/bankComponent.vue";
import TutoComponent from "./components/tutoComponent.vue";
</script>

<style>
main {
  background-image: url("./assets/JanthirCad.webp");
  background-repeat: no-repeat;
  background-size: 370vh;
  width: 100%;
  background-position: 50% 12%;
  background-attachment: fixed;
  opacity: 0.93;
  min-height: 100vh;
}

section {
  position: relative;
  z-index: 2;
  color: white;

  /* Glassmorphisme */
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(2.5px);

  /* Bordure simple arrondie */
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 10px;

  /* Padding pour contenu */
  padding: 1rem;
  margin: 1rem 0;

  box-shadow: 1px 2px 10px black;
}
</style>
