import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // important pour Docker
    port: 5173,
    strictPort: true,
    watch: {
      usePolling: true, // utile si hot reload ne marche pas
    },
  },
})
