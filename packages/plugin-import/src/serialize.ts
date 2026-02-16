function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export function ensurePlainObject(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) {
    throw new Error('[plugin-import] Import data must be a plain object.')
  }
  return input
}

export function parseJSON(input: string, reviver?: (this: unknown, key: string, value: unknown) => unknown): Record<string, unknown> {
  const parsed = JSON.parse(input, reviver)
  return ensurePlainObject(parsed)
}
