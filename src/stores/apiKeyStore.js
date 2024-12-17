// src/stores/characterStore.js
import { defineStore } from "pinia";

export const useApiKey = defineStore("apiKeyStore", {
  state: () => ({
    apiKey: "",
  }),
  actions: {
    selectApiKey(apiKey) {
      if (!apiKey) {
        console.error("Clé API invalide ou absente !");
        return;
      }
      this.apiKey = apiKey.trim().replace(/\s+/g, "");
    },
  },
});
