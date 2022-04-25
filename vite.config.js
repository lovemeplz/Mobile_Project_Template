import vue from '@vitejs/plugin-vue';
import styleImport, { VantResolve } from 'vite-plugin-style-import';
export default {
  build: {
    rollupOptions: {

    },
    watch: {

    }
  },
  plugins: [
    vue(),
    styleImport({
      resolves: [VantResolve()],
    }),
  ],
  resolve: {
    alias: {
      '@': '/src'
    }
  },
  server: {
    host: '0.0.0.0',
    proxy: { // 代理配置
    '/v1': 'http://10.162.12.170:8010'
    }
  }
};
