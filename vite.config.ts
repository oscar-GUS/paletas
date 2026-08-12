import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'

// `base` relativa: la app se sirve bajo /tools/paletas/ dentro de MineLite.
//
// El alias `@` reproduce el de MineLite a propósito: los archivos que llegan por
// npm run tools:paletas (catálogo de bloques, colores, componentes de dibujo)
// vienen tal cual de allí, con sus imports '@/lib/...'. Manteniendo el alias no
// hay que tocar ni una línea al sincronizarlos.
export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // En desarrollo suelto, las llamadas de guardado van contra MineLite.
    proxy: { '/api': 'http://localhost:3010' },
  },
})
