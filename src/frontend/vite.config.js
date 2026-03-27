import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  base: '/app/',
  build: {
    outDir: '../backend/main/resources/META-INF/resources/app',
    emptyOutDir: true,
    assetsDir: 'assets'
  }
});
