import { rm } from 'node:fs/promises'
import { resolve } from 'node:path'
import process from 'node:process'

const target = process.argv[2]

if (!target) {
  throw new Error('Missing .tsbuildinfo path to remove')
}

if (!target.endsWith('.tsbuildinfo')) {
  throw new Error(`Refusing to remove non-.tsbuildinfo path: ${target}`)
}

const targetPath = resolve(process.cwd(), target)

try {
  await rm(targetPath, { force: true })
}
catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  throw new Error(`Failed to remove TypeScript build info "${targetPath}": ${message}`, { cause: error })
}
