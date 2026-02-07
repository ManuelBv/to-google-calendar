import { defineConfig } from 'vite';
import { resolve } from 'path';
import { crx, ManifestV3Export } from '@crxjs/vite-plugin';
import manifest from './src/manifest.json';

export default defineConfig({
  plugins: [
    crx({ manifest: manifest as ManifestV3Export })
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  }
});
