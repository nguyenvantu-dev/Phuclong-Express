import ExcelJS from 'exceljs';

const HEADER_BG = '14264B';
const HEADER_FG = 'FFFFFF';
const BORDER_COLOR = 'CCCCCC';

const THIN_BORDER: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: `FF${BORDER_COLOR}` } };
const CELL_BORDER: Partial<ExcelJS.Borders> = {
  top: THIN_BORDER, bottom: THIN_BORDER, left: THIN_BORDER, right: THIN_BORDER,
};

/** Apply formatting to a worksheet: header style, borders, wrap text, auto column width, freeze row 1. */
function applySheetStyles(ws: ExcelJS.Worksheet): void {
  ws.views = [{ state: 'frozen', ySplit: 1 }];

  ws.eachRow((row, rowIndex) => {
    const isHeader = rowIndex === 1;

    row.eachCell({ includeEmpty: true }, (cell) => {
      cell.border = CELL_BORDER;
      cell.alignment = { vertical: 'top', wrapText: true, ...(isHeader ? { horizontal: 'center' } : {}) };

      if (isHeader) {
        cell.font = { bold: true, color: { argb: `FF${HEADER_FG}` } };
        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${HEADER_BG}` } };
      } else if (cell.value instanceof Date) {
        cell.numFmt = 'DD/MM/YYYY';
        cell.alignment = { ...cell.alignment, horizontal: 'left' };
      } else if (typeof cell.value === 'number') {
        cell.numFmt = '#,##0';
        cell.alignment = { ...cell.alignment, horizontal: 'right' };
      } else if (typeof cell.value === 'string' && /^-?\d{1,3}([.,]\d{3})+$/.test(cell.value.trim())) {
        // Formatted number string with thousands separators (e.g. "1.000.000" or "1,000,000") — right-align only
        cell.alignment = { ...cell.alignment, horizontal: 'right' };
      }
    });
  });

  // Auto column widths based on max cell content length
  ws.columns.forEach((col) => {
    let maxLen = 10;
    col.eachCell?.({ includeEmpty: false }, (cell) => {
      const len = String(cell.value ?? '').length;
      if (len > maxLen) maxLen = len;
    });
    col.width = Math.min(maxLen + 2, 60);
  });
}

async function buildWorkbook(rows: (string | number | null | undefined)[][]): Promise<ExcelJS.Workbook> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('Sheet1');
  ws.addRows(rows);
  applySheetStyles(ws);
  return wb;
}

async function triggerDownload(wb: ExcelJS.Workbook, filename: string): Promise<void> {
  const xlsxFilename = filename.replace(/\.(csv|xls|xlsx)$/i, '') + '.xlsx';
  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = xlsxFilename;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Download a 2D array of rows as a formatted .xlsx file.
 * First row is treated as the header — bold, dark background, white text.
 */
export function downloadDataAsExcel(
  rows: (string | number | null | undefined)[][],
  filename: string,
): void {
  buildWorkbook(rows).then((wb) => triggerDownload(wb, filename)).catch(console.error);
}

function splitCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (char === ',' && !inQuotes) {
      result.push(current); current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

// Columns whose headers match this pattern should stay as strings, never converted to numbers
const STRING_COLUMN_RE = /number|id|code|name|address|phone|tracking|username|diachi/i;

function parseCsvRows(csv: string): (string | number | null)[][] {
  const lines = csv.split(/\r?\n/).filter(line => line.trim());
  if (!lines.length) return [];

  const rows = lines.map(line => splitCsvLine(line));

  // Derive string-only column indices from the header row
  const headers = rows[0] ?? [];
  const stringCols = new Set(
    headers.reduce<number[]>((acc, h, i) => {
      if (STRING_COLUMN_RE.test(String(h))) acc.push(i);
      return acc;
    }, []),
  );

  return rows.map((row, rowIdx) =>
    row.map((cell, colIdx) => {
      if (!cell) return null;
      if (rowIdx === 0 || stringCols.has(colIdx)) return cell;
      if (/^0\d+$/.test(cell)) return cell;
      if (/^-?\d+(\.\d+)?$/.test(cell)) return Number(cell);
      return cell;
    }),
  );
}

/**
 * Download a CSV string as a formatted .xlsx file.
 * Parses CSV, applies header/border/wrap styling.
 */
export function downloadCsvAsExcel(csvString: string, filename: string): void {
  const clean = csvString.replace(/^﻿/, '');
  const rows = parseCsvRows(clean);
  buildWorkbook(rows).then((wb) => triggerDownload(wb, filename)).catch(console.error);
}
