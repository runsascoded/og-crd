import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const allowedHosts = process.env.VITE_ALLOWED_HOSTS?.split(',') ?? []

export default defineConfig(({ command }) => {
  if (command === 'serve') {
    return {
      root: 'demo',
      plugins: [react()],
      server: {
        port: 3847,
        host: true,
        allowedHosts,
      },
    }
  }
  return {
    plugins: [
      react(),
      dts({ insertTypesEntry: true }),
    ],
    build: {
      lib: {
        entry: resolve(__dirname, 'src/index.ts'),
        name: 'OgCard',
        formats: ['es', 'cjs'],
        fileName: 'index',
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: {
          globals: {
            react: 'React',
            'react-dom': 'ReactDOM',
            'react/jsx-runtime': 'jsxRuntime',
          },
        },
      },
      cssCodeSplit: false,
    },
  }
})
