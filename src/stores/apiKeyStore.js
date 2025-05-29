import { defineStore } from "pinia";

export const useApiKey = defineStore("apiKeyStore", {
  state: () => ({
    apiKey: "",
  }),

  getters: {
    isValidApiKey: (state) => {
      console.log("Vérification clé API:", state.apiKey);
      return state.apiKey && state.apiKey.trim().length > 0;
    },
  },

  actions: {
    selectApiKey(apiKey) {
      if (!apiKey) {
        console.error("Clé API invalide ou absente !");
        return;
      }

      const cleanApiKey = apiKey.trim().replace(/\s+/g, "");
      this.apiKey = cleanApiKey;
      this.saveToLocalStorage(cleanApiKey);
    },

    // Sauvegarder localStorage
    saveToLocalStorage(apiKey) {
      try {
        localStorage.setItem("gw2_api_key", apiKey);
      } catch (error) {
        console.error("Erreur sauvegarde localStorage :", error);
      }
    },

    // Charger depuis localStorage
    loadFromLocalStorage() {
      try {
        const savedApiKey = localStorage.getItem("gw2_api_key");
        if (savedApiKey) {
          this.apiKey = savedApiKey;
          console.log("Clé API chargée depuis localStorage");
          return true;
        }
      } catch (error) {
        console.error("Erreur chargement localStorage :", error);
      }
      return false;
    },

    // Supprimer clé API
    clearApiKey() {
      this.apiKey = "";
      try {
        localStorage.removeItem("gw2_api_key");
        console.log("Clé API supprimée");
      } catch (error) {
        console.error("Erreur suppression localStorage :", error);
      }
    },
  },
});
