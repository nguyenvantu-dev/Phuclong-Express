import Excel from 'exceljs';
import type {
  ImportTrackingPreviewRow,
} from './dto/import-tracking.dto';

/**
 * Tracking Excel import helpers.
 *
 * Converted from Tracking_Import.aspx.cs DocDuLieu + ValidateExcelData logic.
 * Template: ImportTrackingTemplate.xlsx — header row marker "$START$" in column A.
 * Data columns (relative to $START$ at col 1): tracking, country, user, order,
 * date, carrier, status, note, kien, mawb, hawb, shipment-note.
 */

export const TRACKING_STATUSES = [
  'Received',
  'InTransit',
  'InVN',
  'VNTransit',
  'Completed',
  'Cancelled',
] as const;

export const EDIT_COLUMN_COUNT = 11; // indices 0..10

/** Excel column offsets relative to the "$START$" header cell. */
const COL = {
  TRACKING_NUMBER: 1,
  TEN_QUOC_GIA: 2,
  USERNAME: 3,
  ORDER_NUMBER: 4,
  NGAY_DAT_HANG: 5,
  TEN_NHA_VAN_CHUYEN: 6,
  TINH_TRANG: 7,
  GHI_CHU: 8,
  KIEN: 9,
  MAWB: 10,
  HAWB: 11,
  GHI_CHU_LO_HANG: 12,
};

export interface ParsedTrackingRow extends ImportTrackingPreviewRow {
  /** Date parsed to ISO yyyy-MM-dd or null if cell empty/invalid */
  ngayDatHangIso: string | null;
  ngayDatHangInvalid: boolean;
}

export interface RefData {
  quocGiaByName: Map<string, number>; // TenQuocGia (lower) -> QuocGiaID
  nhaVanChuyenByName: Map<string, number>;
  usernames: Set<string>; // lower-cased
}

/**
 * Extract cell value as a trimmed string (handles formula/rich text/numbers).
 */
function cellString(value: Excel.CellValue): string {
  if (value === null || value === undefined) return '';
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value).trim();
  if (typeof value === 'boolean') return value ? 'true' : 'false';
  if (value instanceof Date) return value.toISOString();
  // Formula / rich text
  const v = value as any;
  if (v.text) return String(v.text).trim();
  if (v.result !== undefined && v.result !== null) return String(v.result).trim();
  if (v.richText && Array.isArray(v.richText)) {
    return v.richText.map((rt: any) => rt.text || '').join('').trim();
  }
  return '';
}

/**
 * Parse a cell containing a date. Excel cells may be Date objects (typed dates)
 * or serial numbers/strings; we try all three before giving up.
 * Returns { iso: 'YYYY-MM-DD', display: 'dd/MM/yyyy', invalid }.
 */
function parseDateCell(value: Excel.CellValue): {
  iso: string | null;
  display: string;
  invalid: boolean;
} {
  if (value === null || value === undefined || value === '') {
    return { iso: null, display: '', invalid: false };
  }
  let d: Date | null = null;
  if (value instanceof Date) d = value;
  else if (typeof value === 'number') {
    // Excel serial date: days since 1900-01-01 (with the well-known 1900 leap-year bug)
    const ms = (value - 25569) * 86400 * 1000;
    d = new Date(ms);
  } else {
    const raw = cellString(value);
    if (!raw) return { iso: null, display: '', invalid: false };
    // Try dd/MM/yyyy first (Vietnamese format used by the legacy app)
    const m = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (m) {
      const day = Number(m[1]);
      const month = Number(m[2]);
      const year = Number(m[3]);
      d = new Date(year, month - 1, day);
    } else {
      const parsed = new Date(raw);
      if (!isNaN(parsed.getTime())) d = parsed;
    }
    if (!d || isNaN(d.getTime())) {
      return { iso: null, display: raw, invalid: true };
    }
  }
  if (!d || isNaN(d.getTime())) {
    return { iso: null, display: '', invalid: true };
  }
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return {
    iso: `${yyyy}-${mm}-${dd}`,
    display: `${dd}/${mm}/${yyyy}`,
    invalid: false,
  };
}

/**
 * Find the "$START$" header marker in the first 10 rows. Returns the row index
 * (1-based) and the column index of the marker, or null if not found.
 */
function findStartMarker(
  ws: Excel.Worksheet,
): { headerRow: number; startCol: number } | null {
  const maxRow = Math.min(ws.rowCount || 0, 10);
  for (let r = 1; r <= maxRow; r++) {
    const row = ws.getRow(r);
    const maxCol = Math.min(row.cellCount || 0, 20);
    for (let c = 1; c <= maxCol; c++) {
      const val = cellString(row.getCell(c).value);
      if (val === '$START$') return { headerRow: r, startCol: c };
    }
  }
  return null;
}

/**
 * Load and parse the sheet rows into structured tracking objects.
 */
export async function parseTrackingExcel(
  buffer: Buffer,
  sheetName: string,
): Promise<ParsedTrackingRow[]> {
  const workbook = new Excel.Workbook();
  await workbook.xlsx.load(buffer as any);
  const ws = workbook.getWorksheet(sheetName);
  if (!ws) throw new Error(`Sheet "${sheetName}" not found in workbook`);

  const marker = findStartMarker(ws);
  if (!marker) {
    throw new Error('Header marker "$START$" not found in first 10 rows');
  }

  const dataStart = marker.headerRow + 1;
  const c0 = marker.startCol;
  const rows: ParsedTrackingRow[] = [];

  for (let r = dataStart; r <= ws.rowCount; r++) {
    const excelRow = ws.getRow(r);
    const get = (offset: number) =>
      cellString(excelRow.getCell(c0 + offset).value);

    const trackingNumber = get(COL.TRACKING_NUMBER);
    const tenQuocGia = get(COL.TEN_QUOC_GIA);
    const username = get(COL.USERNAME);
    const orderNumber = get(COL.ORDER_NUMBER);
    const dateRaw = excelRow.getCell(c0 + COL.NGAY_DAT_HANG).value;
    const date = parseDateCell(dateRaw);
    const tenNhaVanChuyen = get(COL.TEN_NHA_VAN_CHUYEN);
    const tinhTrang = get(COL.TINH_TRANG);
    const ghiChu = get(COL.GHI_CHU);
    const kien = get(COL.KIEN);
    const mawb = get(COL.MAWB);
    const hawb = get(COL.HAWB);
    const ghiChuLoHang = get(COL.GHI_CHU_LO_HANG);

    // Skip completely empty rows
    const allEmpty =
      !trackingNumber &&
      !tenQuocGia &&
      !username &&
      !orderNumber &&
      !date.display &&
      !tenNhaVanChuyen &&
      !tinhTrang &&
      !ghiChu &&
      !kien &&
      !mawb &&
      !hawb &&
      !ghiChuLoHang;
    if (allEmpty) continue;

    rows.push({
      excelRowIndex: r,
      trackingNumber,
      tenQuocGia,
      username,
      orderNumber,
      ngayDatHang: date.display,
      ngayDatHangIso: date.iso,
      ngayDatHangInvalid: date.invalid,
      tenNhaVanChuyen,
      tinhTrang,
      ghiChu,
      kien,
      mawb,
      hawb,
      ghiChuLoHang,
      errors: [],
    });
  }

  return rows;
}

/** Parse the editColumns CSV ("0,3,5") into a Set of indices. */
export function parseEditColumns(csv: string | undefined): Set<number> {
  const out = new Set<number>();
  if (!csv) return out;
  for (const part of csv.split(',')) {
    const n = Number(part.trim());
    if (Number.isInteger(n) && n >= 0 && n < EDIT_COLUMN_COUNT) out.add(n);
  }
  return out;
}

/**
 * Validate each parsed row against reference data, populating `row.errors`.
 * Mutates rows in-place. Returns total error count.
 *
 * @param editMode true when m=1 (edit existing tracking)
 * @param editColumns indices the user opted to update (only used in editMode)
 */
export function validateRows(
  rows: ParsedTrackingRow[],
  ref: RefData,
  editMode: boolean,
  editColumns: Set<number>,
  existingTrackingNumbers: Set<string>,
): number {
  const shouldCheck = (idx: number) => !editMode || editColumns.has(idx);
  let total = 0;

  for (const row of rows) {
    row.errors = [];

    // Tracking number: always required.
    if (!row.trackingNumber) {
      row.errors.push('Thiếu Số Tracking');
    } else if (editMode && !existingTrackingNumbers.has(row.trackingNumber)) {
      row.errors.push(`Số Tracking "${row.trackingNumber}" không tồn tại`);
    }

    // QuocGia (index 0) — required when in scope (mirrors C# ValidateExcelData
    // `if (!editMode || (editMode && Items[0].Selected))` block).
    if (shouldCheck(0)) {
      if (!row.tenQuocGia) {
        row.errors.push('Thiếu Quốc gia');
      } else if (!ref.quocGiaByName.has(row.tenQuocGia.toLowerCase())) {
        row.errors.push(`Quốc gia "${row.tenQuocGia}" không có trong danh mục`);
      }
    }

    // UserName (index 1) — optional but must exist if provided
    if (shouldCheck(1) && row.username) {
      if (!ref.usernames.has(row.username.toLowerCase())) {
        row.errors.push(`Khách hàng "${row.username}" không có trong danh mục`);
      }
    }

    // NgayDatHang (index 3)
    if (shouldCheck(3) && row.ngayDatHangInvalid) {
      row.errors.push('Ngày đặt hàng không đúng định dạng ngày tháng');
    }

    // NhaVanChuyen (index 4) — optional but must exist
    if (shouldCheck(4) && row.tenNhaVanChuyen) {
      if (!ref.nhaVanChuyenByName.has(row.tenNhaVanChuyen.toLowerCase())) {
        row.errors.push(
          `Nhà vận chuyển "${row.tenNhaVanChuyen}" không có trong danh mục`,
        );
      }
    }

    // TinhTrang (index 5) — optional but must be one of allowed values
    if (shouldCheck(5) && row.tinhTrang) {
      if (!TRACKING_STATUSES.includes(row.tinhTrang as any)) {
        row.errors.push(`Tình trạng "${row.tinhTrang}" không có trong danh mục`);
      }
    }

    if (row.errors.length > 0) total++;
  }

  return total;
}
