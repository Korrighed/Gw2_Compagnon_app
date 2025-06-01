import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  const isProd = mode === 'production' || mode === 'gh-pages';

  return defineConfig({
    base: mode === 'gh-pages' ? '/Gw2_Compagnon_app/' : '/',
    plugins: [vue()],
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src')
      }
    },
    server: {
      proxy: isProd ? {} : {
        '/api/gw2/v2': {
          target: 'https://api.guildwars2.com/v2',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/gw2\/v2/, ''),
          configure: (proxy, options) => {
            proxy.on('proxyReq', (proxyReq, req, res) => {
              console.log('Proxying request:', req.url);
            });
          }
        }
      }
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      rollupOptions: {
        output: {
          manualChunks: undefined,
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
      },
      cssCodeSplit: true,
      sourcemap: !isProd,
      minify: isProd,
      assetsInlineLimit: 4096
    },
    optimizeDeps: {
      include: ['vue', 'pinia', 'axios']
    }
  });
};
