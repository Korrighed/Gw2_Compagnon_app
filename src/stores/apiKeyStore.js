import { defineStore } from "pinia";

export const useApiKey = defineStore("apiKeyStore", {
  state: () => ({
    apiKey: "",
  }),

  getters: {
    isValidApiKey: (state) => {
      return state.apiKey && state.apiKey.trim().length > 0;
    },
  },

  actions: {
    // Encodage simple de la clé
    _encodeKey(key) {
      return btoa(key);
    },

    // Décodage simple de la clé
    _decodeKey(encoded) {
      return atob(encoded);
    },

    selectApiKey(apiKey) {
      if (!apiKey) {
        console.error("Clé API invalide ou absente !");
        return;
      }

      const cleanApiKey = apiKey.trim().replace(/\s+/g, "");
      this.apiKey = cleanApiKey;

      // Encoder avant de sauvegarder
      const encodedKey = this._encodeKey(cleanApiKey);
      this.saveToLocalStorage(encodedKey);
    },

    saveToLocalStorage(encodedKey) {
      try {
        localStorage.setItem("gw2_api_key", encodedKey);
      } catch (error) {
        console.error("Erreur sauvegarde localStorage");
      }
    },

    loadFromLocalStorage() {
      try {
        const encodedKey = localStorage.getItem("gw2_api_key");
        if (encodedKey) {
          // Décoder la clé chargée
          this.apiKey = this._decodeKey(encodedKey);
          return true;
        }
      } catch (error) {
        console.error("Erreur chargement localStorage");
        this.clearApiKey();
      }
      return false;
    },

    clearApiKey() {
      this.apiKey = "";
      try {
        localStorage.removeItem("gw2_api_key");
      } catch (error) {
        console.error("Erreur suppression localStorage");
      }
    },
  },
});
