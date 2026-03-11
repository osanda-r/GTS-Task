import * as XLSX from 'xlsx'

export type ExcelRow = Record<string, unknown>

const normalizeHeader = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

export const getCellValue = (row: ExcelRow, aliases: string[]): string => {
  const entries = Object.entries(row)
  const targetAliases = aliases.map((alias) => normalizeHeader(alias))

  for (const [key, value] of entries) {
    if (targetAliases.includes(normalizeHeader(key))) {
      return String(value ?? '').trim()
    }
  }

  return ''
}

export const pickExcelFile = async (): Promise<File | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.xlsx,.xls'
    input.onchange = () => {
      const file = input.files?.[0] ?? null
      resolve(file)
    }
    input.click()
  })
}

export const readExcelFile = async (file: File): Promise<ExcelRow[]> => {
  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheetName = workbook.SheetNames[0]

  if (!firstSheetName) {
    return []
  }

  const sheet = workbook.Sheets[firstSheetName]
  return XLSX.utils.sheet_to_json<ExcelRow>(sheet, {
    defval: '',
    raw: false,
  })
}

export const exportExcelFile = (rows: ExcelRow[], sheetName: string, fileName: string) => {
  const worksheet = XLSX.utils.json_to_sheet(rows)
  const workbook = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName)
  XLSX.writeFile(workbook, fileName)
}
