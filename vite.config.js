import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());

  return {
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
      port: 3000,
      open: true,
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
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor': ['vue', 'vue-router', 'pinia'],
            'amap': ['@amap/amap-jsapi-loader']
          }
        }
      }
    },
    define: {
      'process.env': env
    },
    html: {
      inject: {
        data: {
          VITE_AMAP_KEY: env.VITE_AMAP_KEY,
          VITE_AMAP_SECURITY_CODE: env.VITE_AMAP_SECURITY_CODE
        }
      }
    }
  };
});
