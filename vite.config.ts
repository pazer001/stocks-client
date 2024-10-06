import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';
import eslint from 'vite-plugin-eslint';
import mkcert from 'vite-plugin-mkcert';


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), eslint(), svgr(),
    mkcert(),
  ],
  server: { https: true },
  // server: { https: false },
});
