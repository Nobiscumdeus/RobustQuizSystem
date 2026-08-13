/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve:{
    alias:{
      '@': path.resolve(__dirname,'src'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/components/ChasfatAcademy/pages'),
      '@shared': path.resolve(__dirname, './src/components/ChasfatAcademy/shared'),
      '@utilities': path.resolve(__dirname, './src/components/ChasfatAcademy/utility'),
      '@features': path.resolve(__dirname, './src/features'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@redux': path.resolve(__dirname, './src/redux'),
      '@assets': path.resolve(__dirname, './src/assets'),
     // '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@context': path.resolve(__dirname, './src/context'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@styles': path.resolve(__dirname, './src/styles'),
      '@api': path.resolve(__dirname, './src/api'),
      '@selectors': path.resolve(__dirname, './src/selectors'),
      '@config':path.resolve(__dirname,'./src/config'),
      
    }
  },
  server:{
    host:'0.0.0.0', //listen on all network interfaces
    port:5173,
    strictPort:true, //exit if port is already in use
     //Display the actual network address
     open:false,

  },
  test: {
    globals: true,
    setupFiles: ['./vitest.setup.js'], // or './vitest.setup.js'
    environment: 'jsdom',
  }
})