import { gw2ApiService } from '@/utils/gw2Api.js';
/**
 * Service récupération détails items GW2
 */
class ItemDetailsService {
    constructor() {
        this.defaultChunkSize = 200;
    }

    /**&
     * Récupère détails items par chunks
     * @param {Array} itemIds - Liste IDs items
     * @param {number} chunkSize - Taille chunk (défaut: 200)
     * @returns {Promise<Array>} Détails items
     */
    async fetchItemDetails(itemIds, chunkSize = this.defaultChunkSize) {
        if (!Array.isArray(itemIds) || itemIds.length === 0) {
            return [];
        }

        try {
            const itemsData = await gw2ApiService.getItemsChunked(itemIds, chunkSize);
            console.log('Items récupérés:', itemsData.length);
            return itemsData;
        } catch (error) {
            console.error('Erreur service items:', error);
            return [];
        }
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
