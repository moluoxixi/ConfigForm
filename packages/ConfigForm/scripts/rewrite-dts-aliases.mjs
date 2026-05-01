import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = resolve(packageRoot, 'dist')
const distSrcRoot = resolve(distRoot, 'src')

async function listDtsFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true })
  const nested = await Promise.all(entries.map(async (entry) => {
    const path = resolve(dir, entry.name)
    if (entry.isDirectory())
      return listDtsFiles(path)

    return entry.isFile() && entry.name.endsWith('.d.ts') ? [path] : []
  }))

  return nested.flat()
}

function toImportPath(fromFile, aliasTarget) {
  const absoluteTarget = resolve(distSrcRoot, aliasTarget)
  let next = relative(dirname(fromFile), absoluteTarget).split(sep).join('/')

  if (!next.startsWith('.'))
    next = `./${next}`

  return next
}

async function rewriteFile(file) {
  const source = await readFile(file, 'utf8')
  const rewritten = source.replace(/(["'])@\/([^"']+)\1/g, (_match, quote, aliasTarget) => {
    return `${quote}${toImportPath(file, aliasTarget)}${quote}`
  })

  if (rewritten !== source)
    await writeFile(file, rewritten)
}

const files = await listDtsFiles(distRoot)

await Promise.all(files.map(rewriteFile))
