import { defineStore } from 'pinia';

export const useItemCache = defineStore('itemCache', {
    state: () => ({
        cache: new Map(),
        activeTooltips: new Set()
    }),
    actions: {
        setItem(id, data) {
            this.cache.set(id, data);
        },
        getItem(id) {
            return this.cache.get(id);
        },
        hasItem(id) {
            return this.cache.has(id);
        }
    }
});