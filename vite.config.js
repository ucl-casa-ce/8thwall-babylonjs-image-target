import { defineConfig } from 'vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { viteStaticCopy } from 'vite-plugin-static-copy'

export default defineConfig({
  build: {
    target: 'esnext'
  },

  server: {
    port: 3000,
    open: true
  },

  plugins: [
    basicSsl(), //need to test in dev on mobile
    
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@8thwall/engine-binary/dist/*',
          dest: 'external/xr'
        }
      ]
    })
  ]
})