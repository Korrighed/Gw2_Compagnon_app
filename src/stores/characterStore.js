// src/stores/characterStore.js
import { defineStore } from "pinia";

export const useCharacterStore = defineStore("character", {
  state: () => ({
    selectedCharacter: null,
    characterList: [],
  }),
  actions: {
    setCharacterList(list) {
      this.characterList = list;
    },
    selectCharacter(character) {
      this.selectedCharacter = character;
      console.log(`Personnage sélectionné : ${this.selectedCharacter}`);
    },
    isSelected(character) {
      return this.selectedCharacter === character;
    },
  },
});
