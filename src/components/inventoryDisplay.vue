<script setup>
import { storeToRefs } from "pinia";
import { ref, watch } from "vue";
import axios from "axios";
import { useCharacterStore } from "../stores/characterStore.js";
import { useApiKey } from "../stores/apiKeyStore.js";

const apiKeyStore = useApiKey();
const characterStore = useCharacterStore();
const { selectedCharacter } = storeToRefs(characterStore); 

// Constantes et variables réactives
const accountKeyInvent = "AB80A66C-EB05-F647-8E04-917AE8028FDE2DB0E55F-FDE0-4C57-8602-F8637CE9C5A4";
const inventoryList = ref([]); // Liste brute de l'inventaire
const itemIdList = ref([]); // Liste des IDs des items
const itemsDetails = ref([]); // Détails des items pour l'affichage


// Fonction pour récupérer l'inventaire du personnage sélectionné
async function fetchInventory() {
  if (!selectedCharacter.value) {
    console.log("Aucun personnage sélectionné.");
    return;
  }

  // Construction de l'URL pour l'appel API
  const gw2ApiInventoryUrl = `https://api.guildwars2.com/v2/characters/${encodeURIComponent(selectedCharacter.value)}/inventory`;

  try {
    const response = await axios.get(gw2ApiInventoryUrl, {
      params: {
        access_token: apiKeyStore.apiKey,
      },
    });

    inventoryList.value = response.data; // Mettre à jour l'inventaire brut
    console.log("Inventaire récupéré :", inventoryList.value);

    // Extraire les IDs et récupérer les détails des items
    storeItemIds(inventoryList.value);
    await fetchItemDetails(); // Récupérer les détails
  } catch (error) {
    console.error("Erreur lors de la récupération de l'inventaire :", error);
  }
}


// Fonction pour extraire les IDs des items
function storeItemIds(data) {
  if (!data || !data.bags) return;

  const ids = [];
  data.bags.forEach((bag) => {
    bag.inventory?.forEach((item) => {
      if (item?.id) {
        ids.push(item.id);
      }
    });
  });

  itemIdList.value = ids; 
  console.log("Liste des IDs :", itemIdList.value);
}

async function fetchItemDetails() {
  const chunkSize = 200; // Taille maximale autorisée par l'API
  const apiUrl = "https://api.guildwars2.com/v2/items";

  for (let i = 0; i < itemIdList.value.length; i += chunkSize) {
    const idsChunk = itemIdList.value.slice(i, i + chunkSize).join(",");
    try {
      const response = await axios.get(apiUrl, {
        params: {
          ids: idsChunk,
        },
      });
      // Ajouter les détails des items progressivement
      itemsDetails.value.push(...response.data);
      console.log("Détails des items reçus :", response.data);
    } catch (error) {
      console.error(`Erreur lors de la récupération des détails pour les IDs ${idsChunk}:`, error);
    }
  }
}


// Surveillance des changements de personnage via `watch`
watch(selectedCharacter, async (newValue, oldValue) => {
  if (newValue) {
    console.log(`Personnage sélectionné : ${newValue}`);
    itemsDetails.value = [];
    itemIdList.value = [];
    inventoryList.value = [];
    await fetchInventory(); // Récupérer l'inventaire du nouveau personnage
  } else {
    console.log("Aucun personnage sélectionné.");
    itemsDetails.value = [];
    inventoryList.value = [];
  }
});


</script>

<template>
  <section class="container pt-2 text-center mx-3">
    <div class="row justify-content-center">
      <div class="col-1  g-1" v-for="item in itemsDetails" :key="item.id">
        <div class="card ">
          <img :src="item.icon" class="img-thumbnail" alt="Icone de l'item" />
          <div class="card-body p-0">
            <p class="card-title fw-bold">{{ item.name }}</p>
            <p v-if="item.details?.type && item.details.type !=='Default' && item.details.type !=='Generic'" class="card-text">
              {{ item.details.type}}
            </p>
              <!-- Tableau des attributs si disponible -->
            <div class="table-responsive text-start">
              <table v-if="item.details?.infix_upgrade?.attributes?.length" class="table table-sm" >
                <tbody>
                  <tr v-for="(attribute, index) in item.details.infix_upgrade.attributes.slice(0, 6)" :key="index" >
                    <td>{{ attribute.attribute }}</td>
                    <td>{{ attribute.modifier }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p v-if="item.details?.description">{{ item.details.description }}</p>
        </div>
      </div>
      </div>
    </div>
  </section>
</template>



<style>
.img-thumbnail { 
  object-fit: contain;
  width: auto;
  max-height: 10vh;
}
.card {
  max-height: 40vh;
}
</style>