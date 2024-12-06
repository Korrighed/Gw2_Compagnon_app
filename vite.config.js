import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';

export default ({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return defineConfig({
    base: env.VITE_BASE ||'/',
    plugins: [vue()],
    build: {
      watch: {
        exclude: [
          'dist/**',
        ]
      }
    }
  });
};
