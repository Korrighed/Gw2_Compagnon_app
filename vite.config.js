import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from '@tailwindcss/vite'

export default ({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return defineConfig({
        base: env.VITE_BASE || "/",
        plugins: [vue(),
        tailwindcss(),

        ],
        build: {
            watch: {
                exclude: ["dist/**"],
            },
        },
    });
};
