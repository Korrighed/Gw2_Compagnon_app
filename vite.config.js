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
        server: {
            proxy: {
                '/api/gw2': {
                    target: 'https://api.guildwars2.com',
                    changeOrigin: true,
                    rewrite: (path) => path.replace(/^\/api\/gw2/, ''),
                    secure: true
                }
            }
        },
        build: {
            watch: {
                exclude: ["dist/**"],
            },
        },
    });
};
