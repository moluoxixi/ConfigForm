import type { FormExportCSVOptions } from './types'

const DEFAULT_DELIMITER = ','
const DEFAULT_LINE_BREAK = '\n'

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

export function toCSV(data: Record<string, unknown>, options: FormExportCSVOptions = {}): string {
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
