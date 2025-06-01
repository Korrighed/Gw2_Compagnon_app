<template>
  <div class="bank-widget glassmorphism text-white">
    <!-- Header accordéon -->
    <div
      class="chevron-header d-flex justify-content-between align-items-center"
      @click="toggleBank"
    >
      <span class="fs-3">Banque</span>
      <img
        :src="chevronIcon"
        alt="chevron"
        class="chevronIcon"
        :class="{ rotated: isBankActive }"
      />
    </div>

    <!-- Corps accordéon avec inventaire -->
    <div v-show="isBankActive" class="widget-body">
      <!-- Grille inventaire banque -->
      <div v-if="bankSlots.length > 0" class="bank-inventory-grid">
        <div
          v-for="slot in bankSlots"
          :key="slot.originalIndex"
          class="inventory-slot has-item"
          :title="getItemTooltip(slot.item)"
          :data-slot="slot.originalIndex"
        >
          <img
            :src="getItemIcon(slot.item.id)"
            :alt="getItemName(slot.item.id)"
            class="item-icon"
          />
          <div v-if="slot.item.count > 1" class="item-count">
            {{ slot.item.count }}
          </div>
        </div>
      </div>

      <!-- Message si vide -->
      <div v-else-if="!isLoading" class="empty-bank text-center py-4">
        <p class="text-muted">Aucun item dans la banque</p>
      </div>

      <!-- Loading -->
      <div v-if="isLoading" class="loading-bank">
        <p>Chargement des items...</p>
      </div>
      <div class="bank-controls text-end">
        <span
          class="btn text-white fs-5"
          @click.stop="refreshBank"
          :disabled="isLoading"
        >
          {{ isLoading ? "Chargement..." : "Rafraîchir" }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import { useApiKey } from "../stores/apiKeyStore.js";
import { itemDetailsService } from "../utils/itemDetailsService.js";
import chevronIcon from "@/assets/Icon/caret-down.svg";

const apiKeyStore = useApiKey();

// Variables réactives
const bankList = ref([]);
const itemIdList = ref([]);
const itemsDetails = ref([]);
const isBankActive = ref(false);
const isLoading = ref(false);

// Computed: transformer données banque en slots inventaire
const bankSlots = computed(() => {
  return bankList.value
    .map((bankItem, index) => ({
      originalIndex: index, // Position originale dans banque
      item: bankItem
        ? {
            id: bankItem.id,
            count: bankItem.count || 1,
            binding: bankItem.binding,
          }
        : null,
    }))
    .filter((slot) => slot.item !== null); // Garder uniquement slots avec items
});

// Watcher API key
watch(
  () => apiKeyStore.isValidApiKey,
  (newVal) => {
    if (newVal && isBankActive.value) {
      fetchBank();
    }
  }
);

// Récupérer données banque
async function fetchBank() {
  const gw2ApiBankUrl = "https://api.guildwars2.com/v2/account/bank";
  const accessToken = apiKeyStore.apiKey;

  if (!accessToken) {
    console.error("Aucune clé API disponible !");
    return;
  }

  isLoading.value = true;

  try {
    const response = await axios.get(gw2ApiBankUrl, {
      params: { access_token: accessToken },
    });

    if (!response.data || !Array.isArray(response.data)) {
      console.warn("Données banque invalides");
      return;
    }

    // Garder structure originale avec null pour slots vides
    bankList.value = response.data;
    console.log(
      "Items banque chargés :",
      bankList.value.filter((item) => item !== null).length + " items"
    );

    storeBankIds(bankList.value);
    await loadItemDetails();
  } catch (error) {
    console.error(
      "Erreur récupération banque :",
      error.response?.data || error.message
    );
  } finally {
    isLoading.value = false;
  }
}

// Extraire IDs items non-null
function storeBankIds(bankItems) {
  itemIdList.value = bankItems
    .filter((item) => item !== null)
    .map((item) => item.id)
    .filter((id, index, arr) => arr.indexOf(id) === index); // Dédoublonnage
}

// Récupérer détails items
async function loadItemDetails() {
  try {
    itemsDetails.value = await itemDetailsService.fetchItemDetails(
      itemIdList.value
    );
    console.log("Détails items récupérés :", itemsDetails.value.length);
  } catch (error) {
    console.error("Erreur chargement détails:", error);
  }
}

// Basculer affichage
function toggleBank() {
  isBankActive.value = !isBankActive.value;

  if (isBankActive.value && apiKeyStore.isValidApiKey) {
    fetchBank();
  }
}

// Rafraîchir
function refreshBank() {
  if (apiKeyStore.isValidApiKey) {
    fetchBank();
  }
}

// Helpers affichage
function getItemIcon(itemId) {
  const item = itemsDetails.value.find((detail) => detail.id === itemId);
  return item?.icon || null;
}

function getItemName(itemId) {
  const item = itemsDetails.value.find((detail) => detail.id === itemId);
  return item?.name || "Item inconnu";
}

function getItemTooltip(itemData) {
  const name = getItemName(itemData.id);
  const count = itemData.count > 1 ? ` (x${itemData.count})` : "";
  return `${name}${count}`;
}

defineExpose({ fetchBank, toggleBank });

onMounted(() => {
  console.log("BankComponent monté");
});
</script>

<style scoped>
.accordion {
  color: white !important;
}

.bank-widget {
  border-radius: 10px;
  padding: 0.5rem;
  margin: 1rem 0;
  backdrop-filter: blur(10px);
}

.chevronIcon {
  width: 10vh;
  height: 3vh;
  filter: brightness(0) invert(1);
  transition: transform 0.3s ease;
}

.chevronIcon.rotated {
  transform: rotate(180deg);
}

.widget-body {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
}

.bank-controls {
  text-align: center;
}

/* Inventory  */

.bank-inventory-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr); /* 12 colonnes comme GW2 */
  grid-auto-rows: 9.5vh;
  max-height: 40vh;
  overflow-y: auto;
}

.inventory-slot {
  width: 9vh;
  height: 9vh;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
}

.bank-item img {
  width: 8.5vh;
  height: 8.5vh;
  object-fit: fill;
}

.item-icon {
  width: 8vh;
  height: 8vh;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.5));
}

.inventory-slot:hover .item-icon {
  transform: scale(1.1);
  transition: transform 0.2s ease;
}

.item-count {
  position: absolute;
  top: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  border-radius: 3px;
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 3vh;
  text-align: center;
}

/* Tablet Portrait */
@media (max-width: 992px) {
  .bank-inventory-grid {
    grid-template-columns: repeat(6, 1fr);
    grid-auto-rows: 7.5vh;
    max-height: 35vh;
    gap: 0.4rem;
  }

  .inventory-slot {
    width: 7vh;
    height: 7vh;
  }

  .item-icon {
    width: 6vh;
    height: 6vh;
  }

  .chevronIcon {
    width: 8vh;
    height: 2.5vh;
  }
}

/* Phone Portrait */
@media (max-width: 576px) {
  .bank-inventory-grid {
    grid-template-columns: repeat(5, 1fr);
    grid-auto-rows: 6vh;
    max-height: 25vh;
    gap: 0.2rem;
    padding: 0.3rem;
  }

  .inventory-slot {
    width: 5.5vh;
    height: 5.5vh;
    border-width: 1px;
  }

  .item-icon {
    width: 5vh;
    height: 5vh;
  }

  .item-count {
    font-size: 0.9rem;
    min-width: 2vh;
    top: 1px;
    right: 1px;
    padding: 0.05rem 0.2rem;
  }

  .inventory-slot:active {
    transform: scale(0.95);
    transition: transform 0.1s ease;
  }
}
</style>
