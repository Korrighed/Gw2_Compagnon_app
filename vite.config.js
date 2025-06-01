import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isProd = mode === 'production' || mode === 'gh-pages';
  const baseUrl = isProd ? '/Gw2_Compagnon_app/' : '/';

  return defineConfig({
    base: baseUrl,
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      // Ajout de la configuration pour les assets
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html')
        },
        output: {
          chunkFileNames: 'assets/js/[name]-[hash].js',
          entryFileNames: 'assets/js/[name]-[hash].js',
          assetFileNames: ({ name }) => {
            if (/\.(gif|jpe?g|png|svg|webp)$/.test(name ?? '')) {
              return 'assets/images/[name]-[hash][extname]';
            }
            if (/\.css$/.test(name ?? '')) {
              return 'assets/css/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          }
        }
      }
    }
  });
};
