import { readdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

const packageRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const distRoot = resolve(packageRoot, 'dist')
const distSrcRoot = resolve(distRoot, 'src')

/**
 * 收集构建产物目录下的声明文件。
 *
 * 只返回 `.d.ts` 文件路径；目录读取失败会让构建脚本直接失败，避免产物被错误发布。
 */
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

/**
 * 将源码别名路径转换为声明文件中的相对导入路径。
 *
 * 输入路径必须来自 dist/src 下的 `@/` 别名，输出始终使用 POSIX 分隔符以匹配 ESM 声明。
 */
function toImportPath(fromFile, aliasTarget) {
  const absoluteTarget = resolve(distSrcRoot, aliasTarget)
  let next = relative(dirname(fromFile), absoluteTarget).split(sep).join('/')

  if (!next.startsWith('.'))
    next = `./${next}`

  return next
}

/**
 * 重写单个声明文件中的 `@/` 导入。
 *
 * 只在内容发生变化时写回文件，读写错误保持原始异常语义并中断构建。
 */
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
