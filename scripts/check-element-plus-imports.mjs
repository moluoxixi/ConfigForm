import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import process from 'node:process'

const SCAN_ROOTS = ['packages', 'playgrounds', 'docs']
const SOURCE_EXTENSIONS = new Set(['.cjs', '.js', '.jsx', '.mjs', '.ts', '.tsx', '.vue'])
const IGNORED_DIRS = new Set([
  '.git',
  '.nuxt',
  '.output',
  '.vite',
  'coverage',
  'dist',
  'node_modules',
])
const FORBIDDEN_PREFIX = 'element-plus/' + 'es'

function shouldScanFile(path) {
  return [...SOURCE_EXTENSIONS].some(extension => path.endsWith(extension))
}

function collectFiles(dir, files = []) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!IGNORED_DIRS.has(entry.name))
        collectFiles(join(dir, entry.name), files)
      continue
    }

    const path = join(dir, entry.name)
    if (entry.isFile() && shouldScanFile(path))
      files.push(path)
  }

  return files
}

const matches = []
for (const root of SCAN_ROOTS) {
  if (!statSync(root, { throwIfNoEntry: false })?.isDirectory())
    continue

  for (const file of collectFiles(root)) {
    const lines = readFileSync(file, 'utf8').split(/\r?\n/)
    lines.forEach((line, index) => {
      if (line.includes(FORBIDDEN_PREFIX)) {
        matches.push({
          file: relative(process.cwd(), file).replace(/\\/g, '/'),
          line: index + 1,
          text: line.trim(),
        })
      }
    })
  }
}

if (matches.length > 0) {
  const details = matches
    .map(match => `${match.file}:${match.line}: ${match.text}`)
    .join('\n')

  throw new Error(`Element Plus 组件必须从 element-plus 直接导入，不允许使用深层 element-plus/es 路径：\n${details}`)
}
