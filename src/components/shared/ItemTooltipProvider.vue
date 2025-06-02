<!-- src/components/shared/ItemTooltipProvider.vue -->
<template>
  <div>
    <!-- Slot pour contenu wrapper -->
    <slot :show-tooltip="showTooltip" :hide-tooltip="hideTooltip"></slot>

    <!-- Overlay tooltip -->
    <Teleport to="body">
      <div
        v-if="tooltip.visible && tooltip.data"
        ref="tooltipRef"
        class="item-tooltip"
        :style="tooltipStyle"
      >
        <div class="card shadow-lg" :class="rarityClass">
          <img :src="tooltip.data.icon" class="card-img-top" />
          <div class="card-body p-2">
            <h1 class="card-title mb-1 fs-5" :class="rarityClass">
              {{ tooltip.data.name }}
            </h1>
            <div class="d-flex justify-content-center gap-2 small">
              <span v-if="tooltip.data?.rarity" class="card-text rarity">
                {{ tooltip.data.rarity }}
              </span>
              <span
                v-if="
                  tooltip.data.details?.type &&
                  tooltip.data.details.type !== 'Default'
                "
                class="card-text"
              >
                {{ tooltip.data.details.type }}
              </span>
            </div>

            <!-- Table attributs si disponible -->
            <table
              v-if="hasAttributes"
              class="table table-sm table-borderless mb-1"
            >
              <tbody>
                <tr v-for="attr in attributes" :key="attr.attribute">
                  <td class="px-1 py-0">{{ attr.attribute }}</td>
                  <td class="px-1 py-0 text-end">+{{ attr.modifier }}</td>
                </tr>
              </tbody>
            </table>

            <p
              v-if="tooltip.data.details?.description"
              class="card-text text-white mb-0"
            >
              {{ tooltip.data.details.description }}
            </p>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, nextTick, onUnmounted } from "vue";
import { itemDetailsService } from "@/utils/itemDetailsService.js";
import { useItemCache } from "@/stores/itemCache";
import "../../assets/styles/rarity.css";

const itemCacheStore = useItemCache();

// État tooltip
const tooltip = reactive({
  visible: false,
  data: null,
  position: { x: 0, y: 0 },
});

const tooltipRef = ref(null);

// Computed pour attributs
const hasAttributes = computed(
  () => tooltip.data?.details?.infix_upgrade?.attributes?.length > 0
);

const attributes = computed(() =>
  hasAttributes.value
    ? tooltip.data.details.infix_upgrade.attributes.slice(0, 6)
    : []
);

// Position dynamique
const tooltipStyle = computed(() => ({
  position: "fixed",
  left: `${tooltip.position.x + 15}px`,
  top: `${tooltip.position.y - 10}px`,
  zIndex: 9999,
  maxWidth: "300px",
}));

// Cache items
const itemCache = new Map();

// Gestionnaire global des tooltips actifs (singleton)
const activeTooltips = ref(new Set());

// Computed pour la rareté
const rarityClass = computed(() => {
  if (!tooltip.data?.rarity) return "";
  return `rarity-${tooltip.data.rarity.toLowerCase()}`;
});

// Modifier les constantes de temps
const TOOLTIP_DELAY = 300; // Augmenté à 300ms pour éviter les déclenchements accidentels
const TOOLTIP_HIDE_DELAY = 100; // Augmenté à 100ms pour une meilleure transition

// Ajouter une variable globale pour tracker le tooltip actif
const activeTooltipId = ref(null);

// Modifier la fonction showTooltip
const showTooltip = async (itemId, event) => {
  if (!itemId) return;

  // Si un autre tooltip est déjà actif, on le ferme immédiatement
  if (activeTooltipId.value && activeTooltipId.value !== itemId) {
    tooltip.visible = false;
    tooltip.data = null;
  }

  // Mettre à jour l'ID actif
  activeTooltipId.value = itemId;

  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
  }
  if (hideTooltipTimer) {
    clearTimeout(hideTooltipTimer);
  }

  tooltip.position = { x: event.clientX, y: event.clientY };

  // Si c'est le même item déjà affiché, juste mettre à jour la position
  if (tooltip.visible && tooltip.data?.id === itemId) {
    adjustTooltipPosition();
    return;
  }

  tooltipTimer = setTimeout(async () => {
    if (activeTooltipId.value === itemId) {
      // Vérifier si c'est toujours le même item
      if (itemCacheStore.hasItem(itemId)) {
        tooltip.data = itemCacheStore.getItem(itemId);
        tooltip.visible = true;
      } else {
        try {
          const items = await itemDetailsService.fetchItemDetails([itemId]);
          const itemDetails = items[0];
          if (itemDetails && activeTooltipId.value === itemId) {
            itemCacheStore.setItem(itemId, itemDetails);
            tooltip.data = itemDetails;
            tooltip.visible = true;
          }
        } catch (error) {
          console.error("Erreur chargement item tooltip:", error);
          tooltip.visible = false;
        }
      }
      await nextTick(() => adjustTooltipPosition());
    }
  }, TOOLTIP_DELAY);
};

// Modifier la fonction hideTooltip
const hideTooltip = () => {
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
  }

  hideTooltipTimer = setTimeout(() => {
    tooltip.visible = false;
    tooltip.data = null;
    activeTooltipId.value = null;
  }, TOOLTIP_HIDE_DELAY);
};

const hideAllTooltipsExcept = (itemId) => {
  if (tooltip.visible && tooltip.data?.id !== itemId) {
    hideTooltip();
  }
};

// Ajouter un cleanup au unmount
onUnmounted(() => {
  if (tooltipTimer) {
    clearTimeout(tooltipTimer);
  }
  hideTooltip();
});

// Améliorer adjustTooltipPosition
const adjustTooltipPosition = () => {
  if (!tooltipRef.value) return;

  const rect = tooltipRef.value.getBoundingClientRect();
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  const padding = 10;

  // Ajuster horizontalement
  if (rect.right > viewportWidth) {
    tooltip.position.x = Math.max(
      padding,
      viewportWidth - rect.width - padding
    );
  }

  // Ajuster verticalement
  if (rect.bottom > viewportHeight) {
    tooltip.position.y = Math.max(
      padding,
      viewportHeight - rect.height - padding
    );
  }

  // Empêcher le tooltip de sortir à gauche ou en haut
  tooltip.position.x = Math.max(padding, tooltip.position.x);
  tooltip.position.y = Math.max(padding, tooltip.position.y);
};

let tooltipTimer = null;
let hideTooltipTimer = null;
</script>

<style scoped>
.item-tooltip {
  pointer-events: none;
  animation: fadeIn 0.08s ease-in;
  position: fixed;
  z-index: 9999;
  max-width: 300px;
  min-width: 200px;
}

.rarity-junk {
  --rarity-color: var(--rarity-junk);
}
.rarity-basic {
  --rarity-color: var(--rarity-basic);
}
.rarity-fine {
  --rarity-color: var(--rarity-fine);
}
.rarity-masterwork {
  --rarity-color: var(--rarity-masterwork);
}
.rarity-rare {
  --rarity-color: var(--rarity-rare);
}
.rarity-exotic {
  --rarity-color: var(--rarity-exotic);
}
.rarity-ascended {
  --rarity-color: var(--rarity-ascended);
}
.rarity-legendary {
  --rarity-color: var(--rarity-legendary);
}

.card {
  border: 2px solid var(--rarity-color, #444);
  transition: border-color 0.2s ease;
  background: rgba(0, 0, 0, 0.781);
  color: white;
  backdrop-filter: blur(5px);
}

.card-img-top {
  width: 64px;
  height: 64px;
  object-fit: contain;
  padding: 4px;
  background: rgba(0, 0, 0, 0.3);
}

.card-title {
  color: var(--rarity-color, white);
  transition: color 0.2s ease;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  font-weight: 500;
}

.rarity {
  color: var(--rarity-color, grey);
  font-weight: bold;
}

.table {
  margin-bottom: 0.5rem;
  width: 100%;
  table-layout: fixed;
}

.table td {
  padding: 0.25rem;
  border-color: rgba(255, 255, 255, 0.1);
  border: 1px solid #444;
  background: rgba(253, 244, 244, 0.1);
  color: white;
  backdrop-filter: blur(5px);
}

/* Application des couleurs */

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
