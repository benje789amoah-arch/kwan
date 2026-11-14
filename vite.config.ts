import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

function listFiles(dir: string, prefix = ''): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? listFiles(join(dir, entry.name), `${prefix}${entry.name}/`) : [`${prefix}${entry.name}`],
  )
}

/**
 * After each build, writes the list of built files into sw.js so the service worker can
 * save all of them on the phone. The version changes whenever any file does, which is
 * what makes phones fetch the new build.
 */
function offline(): Plugin {
  let outDir = 'dist'
  return {
    name: 'kwan-offline',
    apply: 'build',
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir)
    },
    closeBundle() {
      const files = listFiles(outDir).filter((f) => f !== 'sw.js')
      const swPath = join(outDir, 'sw.js')
      const template = readFileSync(swPath, 'utf8')
      // The worker's own code counts towards the version, so a fix to it reaches phones too.
      const hash = createHash('sha256').update(template)
      for (const f of files) hash.update(f).update(readFileSync(join(outDir, f)))
      const urls = ['./', ...files.filter((f) => f !== 'index.html').map((f) => `./${f}`)]
      const sw = template
        .replace('__VERSION__', hash.digest('hex').slice(0, 10))
        .replace("/* __FILES__ */ ['./']", JSON.stringify(urls))
      writeFileSync(swPath, sw)
    },
  }
}

export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss(), offline()],
  server: { port: 5173, strictPort: true },
  preview: { port: 4173, strictPort: true },
})
