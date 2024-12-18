<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useApiKey } from "../stores/apiKeyStore.js";

const apiKeyStore = useApiKey();

// Constantes et variables réactives
const bankList = ref([]); 
const itemIdList = ref([]); 
const itemsDetails = ref([]);


// Fonction pour récupérer l'inventaire du personnage sélectionné
async function fetchBank() {
    const gw2ApiBankUrl = `https://api.guildwars2.com/v2/account/bank`;
    const accessToken = apiKeyStore.apiKey; 
    if (!accessToken) {
    console.error("Aucune clé API !");
    return;
    }
    try {
        const response = await axios.get(gw2ApiBankUrl, {
            params: {
                access_token: accessToken,
            },
        });
        console.log("Réponse complète de l'API GW2 :", response);

        if (!response.data || !Array.isArray(response.data)) {
        return;
    }

        bankList.value = response.data.filter(item => item !== null);
        console.log("Liste des items après filtrage :", bankList.value); // Filtrer les items null
        storeBankIds(bankList.value);
        await fetchItemDetails(); // Récupérer les détails
    } catch (error) {
        console.error(error.response?.data || error.message);
    }
}

function storeBankIds(bankItems) {
    itemIdList.value = bankItems.map(item => item.id).filter(id => id !== undefined);
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
        } catch (error) {
            console.error(`Erreur lors de la récupération des détails pour les IDs ${idsChunk}:`, error);
        }
    }
}


function getItemIcon(itemId) {
    const item = itemsDetails.value.find(detail => detail.id === itemId);
    return item ? item.icon : null;
}

function getItemName(itemId) {
  const item = itemsDetails.value.find(detail => detail.id === itemId);
  return item ? item.name : null;
}


defineExpose({ fetchBank });
onMounted(() => {
    console.log("Fectch BankComponent up");
});
</script>
<template>
    <section class="container pt-2 text-center px-3">
        <div class="row row-cols-auto">
            <div class="col-1 g-1 " v-for="item in bankList" :key="item.id">
                <div class="card">
                    <img v-if="getItemIcon(item.id)" :src="getItemIcon(item.id)" class="card-img" alt="Icone de l'item" />
                    <div class="card-img-overlay">
                        <p v-if = "Number(item.count)>1" class="card-text count-overlay">
                            {{ item.count }}
                        </p>
                    </div>
                    <div class="card-body p-0">
                        <p v-if="getItemIcon(item.id)" class="card-title fs-7 mb-0">
                            {{ getItemName(item.id) }}
                        </p>
                        <p v-if="item.binding" class="text-muted small">Binding: {{ item.binding }}</p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>



<style>
.card-img {
    object-fit: contain;
    width: auto;
    max-height: 5vh;
}

.card {
    max-height: 40vh;
}

.count-overlay {
    position: absolute;
    top:15%;
    right: 20%;
    font-size: 1rem;
    font-weight: bold;
    color: rgb(19, 19, 19);
    background: rgba(237, 231, 231, 0.6);
    backdrop-filter: blur(8px);
    width: 1.5rem;
    height: 1.5rem;
    border-radius: 50%; /* Cercle parfait */
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 2px rgba(0, 0, 0, 0.5);
}

</style>