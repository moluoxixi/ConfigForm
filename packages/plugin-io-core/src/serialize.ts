import type { FormIOExportCSVOptions, FormIOImportCSVOptions } from './types'

const DEFAULT_DELIMITER = ','
const DEFAULT_LINE_BREAK = '\n'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return ''
  }
  if (typeof value === 'string') {
    return value
  }
  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }
  return JSON.stringify(value)
}

function escapeCell(raw: string, delimiter: string): string {
  const escaped = raw.replaceAll('"', '""')
  const shouldQuote = escaped.includes(delimiter) || escaped.includes('"') || escaped.includes('\n') || escaped.includes('\r')
  return shouldQuote ? `"${escaped}"` : escaped
}

export function toCSV(data: Record<string, unknown>, options: FormIOExportCSVOptions = {}): string {
  const delimiter = options.delimiter ?? DEFAULT_DELIMITER
  const lineBreak = options.lineBreak ?? DEFAULT_LINE_BREAK
  const headers = Object.keys(data)
  if (headers.length === 0) {
    return ''
  }

  const headerRow = headers.map(header => escapeCell(header, delimiter)).join(delimiter)
  const valueRow = headers
    .map(header => escapeCell(normalizeCellValue(data[header]), delimiter))
    .join(delimiter)

  return `${headerRow}${lineBreak}${valueRow}`
}

function inferPrimitive(raw: string): unknown {
  const trimmed = raw.trim()
  if (trimmed === '') {
    return ''
  }
  if (/^(true|false)$/i.test(trimmed)) {
    return trimmed.toLowerCase() === 'true'
  }
  if (/^null$/i.test(trimmed)) {
    return null
  }
  if (/^-?(0|[1-9]\d*)(\.\d+)?$/.test(trimmed)) {
    return Number(trimmed)
  }
  return raw
}

export function parseCSVRows(input: string, delimiter: string = DEFAULT_DELIMITER): string[][] {
  const rows: string[][] = []
  let currentRow: string[] = []
  let currentCell = ''
  let inQuotes = false

  for (let i = 0; i < input.length; i++) {
    const char = input[i]
    const next = input[i + 1]

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"'
        i++
      }
      else {
        inQuotes = !inQuotes
      }
      continue
    }

    if (!inQuotes && char === delimiter) {
      currentRow.push(currentCell)
      currentCell = ''
      continue
    }

    if (!inQuotes && (char === '\n' || char === '\r')) {
      if (char === '\r' && next === '\n') {
        i++
      }
      currentRow.push(currentCell)
      rows.push(currentRow)
      currentRow = []
      currentCell = ''
      continue
    }

    currentCell += char
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell)
    rows.push(currentRow)
  }

  return rows
}

export function parseCSV(input: string, options: FormIOImportCSVOptions = {}): Record<string, unknown> {
  const delimiter = options.delimiter ?? DEFAULT_DELIMITER
  const rows = parseCSVRows(input, delimiter)
  if (rows.length === 0) {
    return {}
  }

  const headers = rows[0]
  const dataRowIndex = Math.max(0, options.rowIndex ?? 0) + 1
  const row = rows[dataRowIndex]
  if (!row) {
    return {}
  }

  const parseValue = options.parseValue ?? ((raw: string) => inferPrimitive(raw))
  const record: Record<string, unknown> = {}

  for (let i = 0; i < headers.length; i++) {
    const header = headers[i]
    if (!header) {
      continue
    }
    const raw = row[i] ?? ''
    record[header] = parseValue(raw, header)
  }

  return record
}

export function ensurePlainObject(input: unknown): Record<string, unknown> {
  if (!isRecord(input)) {
    throw new Error('[plugin-io-core] Import data must be a plain object.')
  }
  return input
}

export function parseJSON(input: string, reviver?: (this: unknown, key: string, value: unknown) => unknown): Record<string, unknown> {
  const parsed = JSON.parse(input, reviver)
  return ensurePlainObject(parsed)
}
