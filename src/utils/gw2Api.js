import axios from 'axios';
import { useApiKey } from '@/stores/apiKeyStore.js';

// Instance Axios configurée
const gw2Api = axios.create({
    baseURL: '/api/gw2',
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json'
    }
});

// Intercepteur requête - token automatique
gw2Api.interceptors.request.use(
    (config) => {
        const apiKeyStore = useApiKey();

        if (apiKeyStore.isValidApiKey) {
            config.headers.Authorization = `Bearer ${apiKeyStore.apiKey}`;
        } else {
            console.warn('Aucune clé API valide trouvée');
        }

        return config;
    },
    (error) => {
        console.error('Erreur configuration requête:', error);
        return Promise.reject(error);
    }
);

// Intercepteur réponse - gestion erreurs
gw2Api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            console.error('Clé API invalide ou expirée');
            // Optionnel: redirection vers page login
        } else if (error.response?.status === 403) {
            console.error('Permissions insuffisantes pour cette ressource');
        }
        return Promise.reject(error);
    }
);

export const gw2ApiService = {
    // Account - Banque
    getBank: () => gw2Api.get('/v2/account/bank'),

    // Characters - Liste
    getCharacters: () => gw2Api.get('/v2/characters'),

    // Character - Inventaire spécifique
    getCharacterInventory: (characterName) => {
        if (!characterName || !characterName.trim()) {
            throw new Error('Nom personnage requis');
        }
        return gw2Api.get(`/v2/characters/${encodeURIComponent(characterName)}/inventory`);
    },

    // Items - Details multiples avec chunks
    getItemsChunked: async (ids, chunkSize = 200) => {
        if (!Array.isArray(ids) || ids.length === 0) {
            return [];
        }

        const itemsDetails = [];
        const uniqueIds = [...new Set(ids)];

        for (let i = 0; i < uniqueIds.length; i += chunkSize) {
            const idsChunk = uniqueIds.slice(i, i + chunkSize);
            try {
                const response = await gw2Api.get(`/v2/items?ids=${idsChunk.join(',')}`);
                if (response.data && Array.isArray(response.data)) {
                    itemsDetails.push(...response.data);
                }
            } catch (error) {
                console.error(`Erreur chunk ${i}-${i + chunkSize}:`, error.message);
            }
        }
        return itemsDetails;
    },

    // Items - Details multiples
    getItems: (ids) => {
        if (!Array.isArray(ids) || ids.length === 0) {
            throw new Error('Liste IDs requise');
        }
        const idsString = ids.join(',');
        return gw2Api.get(`/v2/items?ids=${idsString}`);
    },
};
