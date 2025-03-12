import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  chainWebpack: config => {
    const svgRule = config.module.rule('svg');

    svgRule.uses.clear();

    svgRule.use('vue-svg-loader').loader('vue-svg-loader');
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/agent': {
        target: 'http://127.0.0.1:2024',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/agent/, '')
      },
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});
