import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path'

let mypath = `/${path.basename(__dirname)}/dist/`

export default defineConfig({
    // base : "/Gw2_Compagnon_app"
    base: `/${path.basename(__dirname)}/dist/`, 
    plugins: [vue()],
    build :{
        watch : {
            exclude : [
                'dist/**',
            ]
        }
    }
});