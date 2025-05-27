import { defineStore } from "pinia";

export const useApiKey = defineStore("apiKeyStore", {
  state: () => ({
    apiKey: "",
  }),

  actions: {
    // Enregistrer clé API
    selectApiKey(apiKey) {
      if (!apiKey) {
        console.error("Clé API invalide ou absente !");
        return;
      }

      // Nettoyer et enregistrer
      const cleanApiKey = apiKey.trim().replace(/\s+/g, "");
      this.apiKey = cleanApiKey;

      // Persister dans localStorage
      this.saveToLocalStorage(cleanApiKey);
      console.log("Clé API enregistrée et persistée");
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
