<template>
    <div class="row">
      <div class="mt-2">
        <charactersDisplay />
      </div>
    </div>
    <div class="row">
        <inventoryDisplay />
    </div>
  </template>
  
  <script setup>
    import charactersDisplay from './components/charactersDisplay.vue'; 
    import inventoryDisplay from  './components/inventoryDisplay.vue';
  </script>
  
<style>
</style>