import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  
  return {
    plugins: [react(), tailwindcss()],
    define: {
      // Gemini API anahtarını client-side'da kullanılabilir hale getirir
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // Geliştirme aşaması için ayarlar
      port: 3000,
      host: '0.0.0.0',
      hmr: process.env.DISABLE_HMR !== 'true',
    },
    preview: {
      // Hyperlift prodüksiyon (preview) aşaması için kritik ayarlar
      port: 8080,
      host: '0.0.0.0',
      allowedHosts: true // Bazı platformlarda host kontrolünü aşmak için gerekir
    },
    build: {
      outDir: 'dist',
      sourcemap: mode === 'development',
    }
  };
});
