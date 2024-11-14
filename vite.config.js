import { defineConfig } from 'vite';
import vue from '../stores/plugin-vue';
import path from 'path'

let mypath = `/${path.basename(__dirname)}/dist/`

export default defineConfig({
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