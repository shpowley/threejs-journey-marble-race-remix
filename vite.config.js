import react from '@vitejs/plugin-react'
import { transformWithEsbuild } from 'vite'
import restart from 'vite-plugin-restart'
import basicSsl from '@vitejs/plugin-basic-ssl'

export default {
  root: 'src/',
  publicDir: '../public/',
  base: './',

  plugins: [
    // Restart server on static/public file change
    restart({ restart: ['../public/**',] }),

    basicSsl(),

    // React support
    react(),

    // .js file support as if it was JSX
    {
      name: 'load+transform-js-files-as-jsx',
      async transform(code, id) {
        if (!id.match(/src\/.*\.js$/))
          return null

        return transformWithEsbuild(code, id, {
          loader: 'jsx',
          jsx: 'automatic',
        });
      },
    },
  ],

  server: {
    host: true, // Open to local network and display URL
    open: true
  },

  build: {
    outDir: '../dist', // Output in the dist/ folder
    emptyOutDir: true, // Empty the folder first
    sourcemap: false, // Add sourcemap
    minify: true, // Minify code
    target: 'esnext' // use ESnext
  }
}