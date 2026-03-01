import react from '@vitejs/plugin-react'
import { readFileSync, writeFileSync, chmodSync } from 'fs'
import { resolve } from 'path'
import { defineConfig, Plugin } from 'vite'
import dts from 'vite-plugin-dts'

const allowedHosts = process.env.VITE_ALLOWED_HOSTS?.split(',') ?? []

function cliBanner(): Plugin {
  return {
    name: 'cli-banner',
    closeBundle() {
      const cliPath = resolve(__dirname, 'dist/cli.js')
      try {
        const content = readFileSync(cliPath, 'utf-8')
        writeFileSync(cliPath, `#!/usr/bin/env node\n${content}`)
        chmodSync(cliPath, 0o755)
      } catch {}
    },
  }
}

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
      cliBanner(),
    ],
    build: {
      lib: {
        entry: {
          index: resolve(__dirname, 'src/index.ts'),
          core: resolve(__dirname, 'src/core.ts'),
          cli: resolve(__dirname, 'src/cli.ts'),
        },
        formats: ['es', 'cjs'],
      },
      rollupOptions: {
        external: [
          'react', 'react-dom', 'react/jsx-runtime',
          /^node:/,
        ],
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
