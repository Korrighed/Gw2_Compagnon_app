<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useApiKey } from "../stores/apiKeyStore.js";

const apiKeyStore = useApiKey();

// Variables réactives
const bankList = ref([]);
const itemIdList = ref([]);
const itemsDetails = ref([]);
const isBankActive = ref(false);

// Récupérer données banque
async function fetchBank() {
  const gw2ApiBankUrl = "https://api.guildwars2.com/v2/account/bank";
  const accessToken = apiKeyStore.apiKey;

  if (!accessToken) {
    console.error("Aucune clé API disponible !");
    return;
  }

  try {
    const response = await axios.get(gw2ApiBankUrl, {
      params: { access_token: accessToken },
    });

    if (!response.data || !Array.isArray(response.data)) {
      console.warn("Données banque invalides");
      return;
    }

    bankList.value = response.data.filter((item) => item !== null);
    console.log("Items banque filtrés :", bankList.value.length);

    storeBankIds(bankList.value);
    await fetchItemDetails();
  } catch (error) {
    console.error(
      "Erreur récupération banque :",
      error.response?.data || error.message
    );
  }
}

// Extraire IDs items
function storeBankIds(bankItems) {
  itemIdList.value = bankItems
    .map((item) => item.id)
    .filter((id) => id !== undefined);
}

// Récupérer détails items par chunks
async function fetchItemDetails() {
  const chunkSize = 200;
  const apiUrl = "https://api.guildwars2.com/v2/items";

  // Reset détails
  itemsDetails.value = [];

  for (let i = 0; i < itemIdList.value.length; i += chunkSize) {
    const idsChunk = itemIdList.value.slice(i, i + chunkSize).join(",");

    try {
      const response = await axios.get(apiUrl, {
        params: { ids: idsChunk },
      });
      itemsDetails.value.push(...response.data);
    } catch (error) {
      console.error(`Erreur détails items chunk ${i}-${i + chunkSize}:`, error);
    }
  }
  console.log("Détails items récupérés :", itemsDetails.value.length);
}

// Basculer affichage banque
function toggleBank() {
  isBankActive.value = !isBankActive.value;

  if (isBankActive.value) {
    fetchBank();
    console.log("Banque activée - chargement données");
  }
}

// Rafraîchir données
function refreshBank() {
  fetchBank();
  console.log("Données banque rafraîchies");
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

// Exposition pour parent (si besoin)
defineExpose({ fetchBank, toggleBank });

onMounted(() => {
  console.log("BankComponent monté");
});
</script>

<template>
  <!-- Contrôles banque -->
  <div class="bank-controls mb-3">
    <div class="btn-group" role="group">
      <button
        class="btn btn-outline-primary"
        :class="{ active: isBankActive }"
        @click="toggleBank"
      >
        {{ isBankActive ? "Masquer banque" : "Afficher banque" }}
      </button>

      <button
        v-show="isBankActive"
        class="btn btn-outline-secondary"
        @click="refreshBank"
      >
        Actualiser
      </button>
    </div>
  </div>

  <!-- Affichage items banque -->
  <section v-show="isBankActive" class="bank-display">
    <div class="container-fluid">
      <div class="row g-2">
        <div
          class="col-auto"
          v-for="item in bankList"
          :key="`bank-${item.id}-${item.slot}`"
        >
          <div class="card bank-item">
            <img
              v-if="getItemIcon(item.id)"
              :src="getItemIcon(item.id)"
              class="card-img-top"
              :alt="getItemName(item.id)"
            />

            <!-- Compteur si > 1 -->
            <div v-if="item.count > 1" class="card-img-overlay p-0">
              <span class="count-overlay">{{ item.count }}</span>
            </div>

            <!-- Nom item -->
            <div class="card-body p-1">
              <p class="card-title fs-7 mb-0 text-truncate">
                {{ getItemName(item.id) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<style></style>
