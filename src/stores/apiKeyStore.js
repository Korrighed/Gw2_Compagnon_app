// src/stores/characterStore.js
import { defineStore } from "pinia";

export const useApiKey = defineStore("apiKey", {
  state: () => ({
    apiKey: null,
  }),
  actions: {
    selectApiKey(apiKey) {
      this.apiKey = apiKey;
      console.log(`Clé API enregistrée : ${this.apiKey}`);
    },
  },
});
