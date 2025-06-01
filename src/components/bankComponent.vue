<template>
  <ItemGrid
    title="Banque"
    :items="bankSlots"
    :items-details="itemsDetails"
    :is-loading="isLoading"
    empty-message="Aucun item dans la banque"
    @toggle="onToggle"
  >
    <template #controls>
      <div class="d-flex align-content-end">
        <div
          class="btn text-white ms-auto fs-5"
          @click.stop="refreshBank"
          :disabled="isLoading"
        >
          {{ isLoading ? "Chargement..." : "Rafraîchir" }}
        </div>
      </div>
    </template>
  </ItemGrid>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import { useApiKey } from "../stores/apiKeyStore.js";
import { itemDetailsService } from "@/utils/itemDetailsService.js";
import { gw2ApiService } from "@/utils/gw2Api.js";
import ItemGrid from "./shared/ItemGrid.vue";

const apiKeyStore = useApiKey();

// Variables réactives - API uniquement
const bankList = ref([]);
const itemsDetails = ref([]);
const isLoading = ref(false);
const error = ref(null);

// Computed: transformer données banque en items propres
const bankSlots = computed(() => {
  return bankList.value
    .filter((bankItem) => bankItem !== null) // Filtrage slots vides
    .map((bankItem) => ({
      id: bankItem.id,
      count: bankItem.count || 1,
      binding: bankItem.binding || null,
    }));
});

// Méthodes API
const fetchBank = async () => {
  try {
    error.value = null;
    isLoading.value = true;

    const response = await gw2ApiService.getBank();
    bankList.value = response.data || [];

    // Récupération détails items
    if (bankList.value.length > 0) {
      await fetchItemsDetails();
    }
  } catch (err) {
    error.value = err.message || "Erreur chargement banque";
    console.error("Erreur fetch banque:", err);
  } finally {
    isLoading.value = false;
  }
};

const fetchItemsDetails = async () => {
  const uniqueItemIds = [
    ...new Set(
      bankList.value.filter((item) => item !== null).map((item) => item.id)
    ),
  ];

  if (uniqueItemIds.length === 0) {
    itemsDetails.value = [];
    return;
  }

  try {
    itemsDetails.value = await itemDetailsService.fetchItemDetails(
      uniqueItemIds
    );
    console.log("Items détails chargés:", itemsDetails.value.length); // Debug
  } catch (error) {
    console.error("Erreur détails items:", error.message);
    itemsDetails.value = [];
  }
};

const refreshBank = () => {
  fetchBank();
};

const onToggle = (isOpen) => {
  if (isOpen && bankList.value.length === 0) {
    fetchBank();
  }
};

// Watchers
watch(
  () => apiKeyStore.apiKey,
  (newKey) => {
    if (newKey) {
      bankList.value = [];
      itemsDetails.value = [];
    }
  }
);

// Lifecycle
onMounted(() => {
  if (apiKeyStore.apiKey) {
    fetchBank();
  }
});
</script>
