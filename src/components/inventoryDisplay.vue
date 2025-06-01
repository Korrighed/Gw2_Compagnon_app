<template>
  <ItemGrid
    title="Inventaire"
    :items="inventorySlots"
    :items-details="itemsDetails"
    :is-loading="isLoading"
    empty-message="Aucun item dans l'inventaire"
    @toggle="onToggle"
  >
    <template #controls>
      <div class="d-flex align-content-end">
        <div
          class="btn text-white ms-auto fs-5"
          @click.stop="refreshInventory"
          :disabled="isLoading"
        >
          {{ isLoading ? "Chargement..." : "Rafraîchir" }}
        </div>
      </div>
    </template>
  </ItemGrid>
</template>

<script setup>
import { ref, watch, computed } from "vue";
import { storeToRefs } from "pinia";
import { useCharacterStore } from "../stores/characterStore";
import { gw2ApiService } from "@/utils/gw2Api";
import { itemDetailsService } from "@/utils/itemDetailsService";
import ItemGrid from "./shared/ItemGrid.vue";

const characterStore = useCharacterStore();
const { selectedCharacter } = storeToRefs(characterStore);

// Variables réactives
const inventoryList = ref([]);
const itemsDetails = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Computed: transformer données inventaire en format compatible
const inventorySlots = computed(() => {
  if (!inventoryList.value?.bags) return [];

  // Extraire uniquement les IDs et informations essentielles
  return inventoryList.value.bags
    .flatMap((bag) => {
      if (!bag || !Array.isArray(bag.inventory)) return [];

      // Ne garder que les informations essentielles pour chaque item
      return bag.inventory
        .filter((item) => item !== null)
        .map((item) => ({
          id: item.id,
          count: item.count || 1,
          binding: item.binding || null,
        }));
    })
    .filter((item) => item !== null);
});

// Méthodes pour l'API
const fetchInventory = async () => {
  if (!selectedCharacter.value) {
    console.log("Aucun personnage sélectionné");
    return;
  }

  try {
    error.value = null;
    isLoading.value = true;

    const response = await gw2ApiService.getCharacterInventory(
      selectedCharacter.value
    );
    inventoryList.value = response.data || [];

    // Récupérer les détails des items si l'inventaire contient des items
    if (inventoryList.value?.bags?.length > 0) {
      await fetchItemsDetails();
    }
  } catch (err) {
    error.value = err.message || "Erreur chargement inventaire";
    console.error("Erreur fetch inventaire:", err);
  } finally {
    isLoading.value = false;
  }
};

const fetchItemsDetails = async () => {
  // Extraire uniquement les IDs uniques des items
  const uniqueItemIds = [
    ...new Set(
      inventoryList.value.bags
        .flatMap((bag) => bag?.inventory || [])
        .filter((item) => item !== null)
        .map((item) => item.id)
    ),
  ];

  if (uniqueItemIds.length === 0) {
    itemsDetails.value = [];
    return;
  }

  try {
    // Utiliser directement itemDetailsService sans transformation supplémentaire
    itemsDetails.value = await itemDetailsService.fetchItemDetails(
      uniqueItemIds
    );
    console.log("Items détails chargés:", itemsDetails.value.length);
  } catch (error) {
    console.error("Erreur détails items:", error.message);
    itemsDetails.value = [];
  }
};

const refreshInventory = () => {
  fetchInventory();
};

const onToggle = (isOpen) => {
  if (isOpen && selectedCharacter.value && inventoryList.value.length === 0) {
    fetchInventory();
  }
};

// Watchers
watch(selectedCharacter, async (newCharacter) => {
  if (newCharacter) {
    inventoryList.value = [];
    itemsDetails.value = [];
    await fetchInventory();
  }
});
</script>
