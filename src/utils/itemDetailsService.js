import axios from "axios";

/**
 * Service récupération détails items GW2
 */
class ItemDetailsService {
    constructor() {
        this.baseUrl = "https://api.guildwars2.com/v2/items";
        this.defaultChunkSize = 200;
    }

    /**
     * Récupère détails items par chunks
     * @param {Array} itemIds - Liste IDs items
     * @param {number} chunkSize - Taille chunk (défaut: 200)
     * @returns {Promise<Array>} Détails items
     */
    async fetchItemDetails(itemIds, chunkSize = this.defaultChunkSize) {
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return [];
        }

        const itemsDetails = [];
        const uniqueIds = [...new Set(itemIds)]; // Dédoublonnage

        for (let i = 0; i < uniqueIds.length; i += chunkSize) {
            const idsChunk = uniqueIds.slice(i, i + chunkSize).join(",");

            try {
                const response = await axios.get(this.baseUrl, {
                    params: { ids: idsChunk },
                });

                if (response.data && Array.isArray(response.data)) {
                    itemsDetails.push(...response.data);
                }
            } catch (error) {
                console.error(`Erreur chunk ${i}-${i + chunkSize}:`, error.message);
                // Continue traitement autres chunks
            }
        }

        return itemsDetails;
    }

    /**
     * Helpers extraction données
     */
    static getItemIcon(itemsDetails, itemId) {
        const item = itemsDetails.find(detail => detail.id === itemId);
        return item?.icon || null;
    }

    static getItemName(itemsDetails, itemId) {
        const item = itemsDetails.find(detail => detail.id === itemId);
        return item?.name || "Item inconnu";
    }
}

// Export singleton
export const itemDetailsService = new ItemDetailsService();
export { ItemDetailsService };
