<template>
  <!-- Accordéon banque -->
  <div class="accordion" id="bankAccordion">
    <div class="accordion-item glassmorphism">
      <h1 class="accordion-header" id="bankHeader">
        <button
          class="accordion-button glassmorphism text-white"
          :class="{ collapsed: !isBankActive }"
          type="button"
          @click="toggleBank"
          aria-expanded="false"
          aria-controls="bankCollapse"
        >
          <span class="me-auto">Banque</span>
          <span v-if="bankList.length > 0" class="badge bg-secondary me-2">
            {{ bankList.length }} items
          </span>
          <button
            v-if="isBankActive"
            class="btn btn-sm btn-outline-light ms-2"
            @click.stop="refreshBank"
            title="Actualiser"
          >
            ↻
          </button>
        </button>
      </h1>

      <div
        id="bankCollapse"
        class="accordion-collapse collapse"
        :class="{ show: isBankActive }"
        aria-labelledby="bankHeader"
        data-bs-parent="#bankAccordion"
      >
        <div class="accordion-body glassmorphism">
          <!-- Affichage items banque -->
          <div v-if="bankList.length > 0" class="container-fluid">
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

          <!-- Message si vide -->
          <div v-else class="text-center text-muted py-3">
            <p>Aucun item en banque ou chargement en cours...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import axios from "axios";
import { useApiKey } from "../stores/apiKeyStore.js";

const apiKeyStore = useApiKey();

// Variables réactives
const bankList = ref([]);
const itemIdList = ref([]);
const itemsDetails = ref([]);
const isBankActive = ref(false);
const isLoading = ref(false);

// Watcher pour charger automatiquement si clé API disponible
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

    bankList.value = response.data.filter((item) => item !== null);
    console.log("Items banque filtrés :", bankList.value.length);

    storeBankIds(bankList.value);
    await fetchItemDetails();
  } catch (error) {
    console.error(
      "Erreur récupération banque :",
      error.response?.data || error.message
    );
  } finally {
    isLoading.value = false;
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

  if (isBankActive.value && apiKeyStore.isValidApiKey) {
    fetchBank();
    console.log("Banque activée - chargement données");
  }
}

// Rafraîchir données
function refreshBank() {
  if (apiKeyStore.isValidApiKey) {
    fetchBank();
    console.log("Données banque rafraîchies");
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

defineExpose({ fetchBank, toggleBank });

onMounted(() => {
  console.log("BankComponent monté");
});
</script>
<style scoped>
.accordion-button.glassmorphism {
  background: rgba(255, 255, 255, 0.1) !important;
  backdrop-filter: blur(25px);
  border: 1px solid rgba(138, 133, 133, 0.3) !important;
  color: white !important;
}

.accordion-button.glassmorphism:hover {
  background: rgba(255, 255, 255, 0.2) !important;
}

.accordion-body.glassmorphism {
  background: rgba(255, 255, 255, 0.05) !important;
  backdrop-filter: blur(15px);
  border-top: 1px solid rgba(138, 133, 133, 0.2);
}

.accordion-item.glassmorphism {
  background: transparent;
  border: 1px solid rgba(138, 133, 133, 0.3);
  border-radius: 10px;
}

.count-overlay {
  position: absolute;
  bottom: 2px;
  right: 2px;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 1px 4px;
  border-radius: 3px;
  font-size: 10px;
}

.bank-item {
  width: 64px;
  height: 64px;
  background: rgba(255, 255, 255, 0.1);
}

.bank-item img {
  width: 48px;
  height: 48px;
  object-fit: cover;
}
</style>
