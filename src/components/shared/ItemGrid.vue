<template>
  <div class="bank-widget glassmorphism text-white">
    <!-- Header accordéon -->
    <div
      class="chevron-header d-flex justify-content-between align-items-center"
      @click="toggleAccordion"
    >
      <span class="fs-3">{{ title }}</span>
      <img
        :src="chevronIcon"
        alt="chevron"
        class="chevronIcon"
        :class="{ rotated: isActive }"
      />
    </div>

    <!-- Corps accordéon avec inventaire -->
    <div v-show="isActive" class="widget-body">
      <!-- Loading state -->
      <div v-if="isLoading" class="loading-inventory text-center py-4">
        <p>Chargement des objets...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!items.length" class="empty-inventory text-center py-4">
        <p class="text-muted">{{ emptyMessage }}</p>
      </div>

      <!-- Items grid -->
      <div v-else class="bank-inventory-grid">
        <ItemTooltipProvider v-for="(item, index) in items" :key="index">
          <template #default="{ showTooltip, hideTooltip }">
            <div
              class="inventory-slot has-item"
              :data-slot="index"
              @mouseenter="(e) => showTooltip(item.id, e)"
              @mouseleave="hideTooltip"
            >
              <img
                :src="getItemIcon(item.id)"
                :alt="getItemName(item.id)"
                class="item-icon"
              />
              <div v-if="item.count > 1" class="item-count">
                {{ item.count }}
              </div>
            </div>
          </template>
        </ItemTooltipProvider>
      </div>

      <!-- Slot pour contrôles spécifiques -->
      <div class="bank-controls">
        <slot name="controls"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { itemDetailsService } from "../../utils/itemDetailsService.js";
import chevronIcon from "@/assets/Icon/caret-down.svg";
import ItemTooltipProvider from "./ItemTooltipProvider.vue";

// Props
const props = defineProps({
  title: {
    title: String,
    items: Array,
    itemsDetails: Array,
    isLoading: Boolean,
    emptyMessage: String,
  },
  items: {
    type: Array,
    default: () => [],
  },
  itemsDetails: {
    type: Array,
    default: () => [],
  },
  isLoading: {
    type: Boolean,
    default: false,
  },
  emptyMessage: {
    type: String,
    default: "Aucun item disponible",
  },
});

// Émissions
const emit = defineEmits(["toggle"]);

// État accordion
const isActive = ref(false);

// Méthodes
const toggleAccordion = () => {
  isActive.value = !isActive.value;
  emit("toggle", isActive.value);
};

// Helpers affichage items
const getItemIcon = (itemId) => {
  const item = props.itemsDetails.find((detail) => detail.id === itemId);
  return item?.icon || "";
};

const getItemName = (itemId) => {
  const item = props.itemsDetails.find((detail) => detail.id === itemId);
  return item?.name || "Item inconnu";
};

const getItemTooltip = (item) => {
  const details = props.itemsDetails.find((detail) => detail.id === item.id);
  if (!details) return "Item inconnu";

  let tooltip = details.name;
  if (item.count > 1) tooltip += ` (${item.count})`;
  if (item.binding) tooltip += ` - ${item.binding}`;

  return tooltip;
};
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
