import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default ({ mode }) => {
    const env = loadEnv(mode, process.cwd());

    return defineConfig({
        base: env.VITE_BASE || "/",
        plugins: [vue()],
        resolve: {
            alias: {
                '@': resolve(__dirname, 'src')
            }
        },
        build: {
            watch: {
                exclude: ["dist/**"],
            },
        },
    });
};
