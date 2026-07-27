'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiArrowLeft, FiDownload, FiUploadCloud } from 'react-icons/fi';
import {
  getDebtReportUsers,
  getBankAccounts,
  getQuocGia,
  importCreateDebts,
  ImportDebtRow,
  ImportDebtResponse,
} from '@/lib/api';
import { useAuth } from '@/hooks/use-auth-context';
import { downloadDataAsExcel, readExcelSheetNames, readExcelSheetRows } from '@/lib/excel-download';

const DEBT_MANAGEMENT_ALLOWED_ROLES = ['admin', 'order', 'sale'];

/**
 * Debt Import Page — bulk "Thêm mới công nợ" from Excel
 * Converted from admin/ManageCongNo_Import.aspx (add-new mode)
 */

// Chỉ 2 lựa chọn — khớp với select "Loại phát sinh" trên form thêm thủ công (trang Quản lý công nợ)
const LOAI_PHAT_SINH_LABELS: Record<number, string> = {
  2: 'Phí mua hàng và phát sinh khác',
  8: 'Cân Kg',
};

const LOAI_PHAT_SINH_BY_LABEL: Record<string, number> = Object.fromEntries(
  Object.entries(LOAI_PHAT_SINH_LABELS).map(([code, label]) => [label.toLowerCase(), Number(code)]),
);

// Header text (normalized: trim + lowercase) -> parsed field key
const HEADER_KEY_MAP: Record<string, string> = {
  'user': 'username',
  'nội dung': 'noiDung',
  'ngày': 'ngay',
  'loại phát sinh': 'loaiPhatSinh',
  'tuyến': 'tuyen',
  'sản lượng (kg)': 'sanLuong',
  'tài khoản': 'bankAccount',
  'tiền nợ (dr)': 'dr',
  'tiền có (cr)': 'cr',
  'ghi chú': 'ghiChu',
};

const TEMPLATE_HEADERS = ['User', 'Nội dung', 'Ngày', 'Loại phát sinh', 'Tuyến', 'Sản lượng (kg)', 'Tài khoản', 'Tiền Nợ (DR)', 'Tiền Có (CR)', 'Ghi chú'];

interface ParsedDebtRow {
  rowIndex: number; // dòng thực tế trong file Excel (tính cả header)
  username: string;
  noiDung: string;
  ngay: string;
  loaiPhatSinh: number;
  tuyen: string;
  quocGiaId: number | undefined;
  sanLuong: number | undefined; // chỉ áp dụng khi loaiPhatSinh === 8 (Cân Kg)
  bankAccount: string;
  dr: number;
  cr: number;
  ghiChu: string;
  errors: string[];
}

function isValidCalendarDate(day: number, month: number, year: number): boolean {
  const d = new Date(year, month - 1, day);
  return d.getFullYear() === year && d.getMonth() === month - 1 && d.getDate() === day;
}

function formatDateCell(value: unknown): string {
  if (value instanceof Date) {
    const day = String(value.getDate()).padStart(2, '0');
    const month = String(value.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${value.getFullYear()}`;
  }
  return String(value ?? '').trim();
}

function parseImportRows(
  rawRows: (string | number | Date | null)[][],
  users: { UserName: string }[],
  bankAccounts: { TenTaiKhoanNganHang: string }[],
  countries: { QuocGiaID: number; TenQuocGia: string }[],
): ParsedDebtRow[] {
  if (rawRows.length === 0) return [];

  const headerCells = rawRows[0].map((h) => String(h ?? '').trim().toLowerCase());
  const colIndex: Record<string, number> = {};
  headerCells.forEach((h, i) => {
    const key = HEADER_KEY_MAP[h];
    if (key) colIndex[key] = i;
  });

  const userSet = new Set(users.map((u) => u.UserName.toLowerCase()));
  const bankSet = new Set(bankAccounts.map((b) => b.TenTaiKhoanNganHang.toLowerCase()));
  const countryMap = new Map(countries.map((c) => [c.TenQuocGia.toLowerCase(), c.QuocGiaID]));

  const dataRows = rawRows
    .slice(1)
    .map((row, idx) => ({ row, excelRow: idx + 2 }))
    .filter(({ row }) => row.some((c) => c !== null && c !== undefined && String(c).trim() !== ''));

  return dataRows.map(({ row, excelRow }) => {
    const errors: string[] = [];
    const get = (key: string) => (colIndex[key] !== undefined ? row[colIndex[key]] : null);

    const username = String(get('username') ?? '').trim();
    if (!username) errors.push('Thiếu User');
    else if (!userSet.has(username.toLowerCase())) errors.push(`User "${username}" không tồn tại`);

    const noiDung = String(get('noiDung') ?? '').trim();
    if (!noiDung) errors.push('Thiếu Nội dung');

    const ngay = formatDateCell(get('ngay'));
    const dateMatch = ngay.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (!ngay) errors.push('Thiếu Ngày');
    else if (!dateMatch) errors.push(`Ngày "${ngay}" không đúng định dạng dd/mm/yyyy`);
    else if (!isValidCalendarDate(Number(dateMatch[1]), Number(dateMatch[2]), Number(dateMatch[3]))) {
      errors.push(`Ngày "${ngay}" không tồn tại`);
    }

    let loaiPhatSinh = 2;
    const loaiRaw = get('loaiPhatSinh');
    if (loaiRaw !== null && loaiRaw !== undefined && String(loaiRaw).trim() !== '') {
      const asNumber = Number(loaiRaw);
      if (!isNaN(asNumber) && LOAI_PHAT_SINH_LABELS[asNumber]) {
        loaiPhatSinh = asNumber;
      } else {
        const byLabel = LOAI_PHAT_SINH_BY_LABEL[String(loaiRaw).trim().toLowerCase()];
        if (byLabel) loaiPhatSinh = byLabel;
        else errors.push(`Loại phát sinh "${loaiRaw}" không hợp lệ`);
      }
    }

    const tuyen = String(get('tuyen') ?? '').trim();
    let quocGiaId: number | undefined;
    if (!tuyen) {
      errors.push('Thiếu Tuyến');
    } else {
      const matched = countryMap.get(tuyen.toLowerCase());
      if (matched === undefined) errors.push(`Tuyến "${tuyen}" không tồn tại`);
      else quocGiaId = matched;
    }

    let sanLuong: number | undefined;
    const sanLuongRaw = get('sanLuong');
    const sanLuongStr = sanLuongRaw === null || sanLuongRaw === undefined ? '' : String(sanLuongRaw).trim();
    if (loaiPhatSinh === 8) {
      if (sanLuongStr === '') {
        errors.push('Thiếu Sản lượng (kg) cho loại phát sinh Cân Kg');
      } else {
        const parsed = Number(sanLuongStr);
        if (isNaN(parsed) || parsed <= 0) errors.push(`Sản lượng (kg) "${sanLuongStr}" phải là số lớn hơn 0`);
        else sanLuong = parsed;
      }
    }

    const bankAccount = String(get('bankAccount') ?? '').trim();
    if (bankAccount && !bankSet.has(bankAccount.toLowerCase())) {
      errors.push(`Tài khoản "${bankAccount}" không tồn tại`);
    }

    const drRaw = get('dr');
    const crRaw = get('cr');
    const drStr = drRaw === null || drRaw === undefined ? '' : String(drRaw).trim();
    const crStr = crRaw === null || crRaw === undefined ? '' : String(crRaw).trim();
    const dr = drStr === '' ? 0 : Number(drStr);
    const cr = crStr === '' ? 0 : Number(crStr);
    if (isNaN(dr) || isNaN(cr)) {
      errors.push('Tiền Nợ/Tiền Có phải là số');
    } else if (dr === 0 && cr === 0) {
      errors.push('Phải nhập ít nhất Tiền Nợ hoặc Tiền Có');
    }

    const ghiChu = String(get('ghiChu') ?? '').trim();

    return {
      rowIndex: excelRow,
      username,
      noiDung,
      ngay,
      loaiPhatSinh,
      tuyen,
      quocGiaId,
      sanLuong,
      bankAccount,
      dr: isNaN(dr) ? 0 : dr,
      cr: isNaN(cr) ? 0 : cr,
      ghiChu,
      errors,
    };
  });
}

function getErrorMessage(error: unknown, fallback: string): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }
  return fallback;
}

export default function DebtImportPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user: authUser, isLoading: authLoading } = useAuth();
  const hasDebtAccess = (authUser?.roles ?? []).some((role) =>
    DEBT_MANAGEMENT_ALLOWED_ROLES.includes(role.toLowerCase())
  );

  // Chỉ role admin/order/sale được import công nợ; role khác bị đá về trang chủ admin.
  useEffect(() => {
    if (!authLoading && !hasDebtAccess) {
      router.replace('/admin');
    }
  }, [authLoading, hasDebtAccess, router]);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [file, setFile] = useState<File | null>(null);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [sheetName, setSheetName] = useState('');
  const [parsedRows, setParsedRows] = useState<ParsedDebtRow[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ImportDebtResponse | null>(null);

  const { data: users, isLoading: usersLoading } = useQuery({ queryKey: ['debt-report-users'], queryFn: getDebtReportUsers, enabled: hasDebtAccess });
  const { data: bankAccounts, isLoading: bankAccountsLoading } = useQuery({ queryKey: ['bank-accounts'], queryFn: getBankAccounts, enabled: hasDebtAccess });
  const { data: countries, isLoading: countriesLoading } = useQuery({ queryKey: ['quoc-gia'], queryFn: getQuocGia, enabled: hasDebtAccess });
  // Chờ 3 danh sách này load xong trước khi cho tải file mẫu, tránh file mẫu bị thiếu dropdown
  // User/Tài khoản/Tuyến nếu người dùng bấm quá sớm lúc mạng chậm.
  const templateDataReady = !usersLoading && !bankAccountsLoading && !countriesLoading;

  const validRows = useMemo(() => parsedRows.filter((r) => r.errors.length === 0), [parsedRows]);
  const invalidCount = parsedRows.length - validRows.length;

  const importMutation = useMutation({
    mutationFn: importCreateDebts,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['debt-management'] });
      setImportResult(result);
      setStep(4);
    },
    onError: (error: unknown) => {
      setErrorMessage(getErrorMessage(error, 'Import thất bại'));
    },
  });

  const handleDownloadTemplate = () => {
    const usernames = (users || []).map((u) => u.UserName);
    const bankAccountNames = (bankAccounts || [])
      .map((b) => b.TenTaiKhoanNganHang)
      .filter((name): name is string => !!name);
    const countryNames = (countries || []).map((c) => c.TenQuocGia);
    const dropdowns: Record<string, string[]> = {};
    if (usernames.length > 0) dropdowns['User'] = usernames;
    if (bankAccountNames.length > 0) dropdowns['Tài khoản'] = bankAccountNames;
    if (countryNames.length > 0) dropdowns['Tuyến'] = countryNames;
    dropdowns['Loại phát sinh'] = Object.values(LOAI_PHAT_SINH_LABELS);

    // Cột "Ngày" luôn ở định dạng Text (@) — xem applyTextColumnFormat trong excel-download.ts.
    // Nếu để Excel tự nhận là kiểu Date, việc gõ tay sẽ bị Excel diễn giải theo locale máy
    // (có máy hiểu MM/DD, có máy hiểu DD/MM) rồi hiển thị lại gây ra hiện tượng "đảo ngày/tháng".
    // Dùng text thì đúng y như những gì gõ vào, không phụ thuộc locale.
    const todayStr = formatDateCell(new Date());

    downloadDataAsExcel(
      [
        TEMPLATE_HEADERS,
        [
          usernames[0] ?? 'user01',
          'CK CONG NO',
          todayStr,
          LOAI_PHAT_SINH_LABELS[2],
          countryNames[0] ?? '',
          '',
          bankAccountNames[0] ?? '',
          0,
          500000,
          'Ví dụ dòng mẫu',
        ],
      ],
      'Mau_Import_CongNo.xlsx',
      undefined,
      Object.keys(dropdowns).length > 0 ? dropdowns : undefined,
      ['Ngày'],
      'Import Công Nợ',
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    if (!selectedFile.name.endsWith('.xlsx')) {
      setErrorMessage('File không hợp lệ (vui lòng chọn một file .xlsx)!');
      return;
    }
    setFile(selectedFile);
    setErrorMessage(null);
  };

  const handleNextStep1 = async () => {
    if (!file) {
      setErrorMessage('Chọn file dữ liệu!');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const names = await readExcelSheetNames(file);
      if (names.length === 0) {
        setErrorMessage('File Excel không có sheet nào');
        return;
      }
      setSheetNames(names);
      setSheetName(names[0]);
      setStep(2);
    } catch {
      setErrorMessage('Không đọc được file Excel. Vui lòng kiểm tra lại file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleNextStep2 = async () => {
    if (!file || !sheetName) {
      setErrorMessage('Phải chọn sheet cần Import');
      return;
    }
    setIsProcessing(true);
    setErrorMessage(null);
    try {
      const rawRows = await readExcelSheetRows(file, sheetName);
      const parsed = parseImportRows(rawRows, users || [], bankAccounts || [], countries || []);
      if (parsed.length === 0) {
        setErrorMessage('Sheet không có dữ liệu để import');
        return;
      }
      setParsedRows(parsed);
      setStep(3);
    } catch {
      setErrorMessage('Không đọc được dữ liệu từ sheet đã chọn.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleImport = () => {
    const payload: ImportDebtRow[] = validRows.map((r) => ({
      username: r.username,
      noiDung: r.noiDung,
      ngay: r.ngay,
      dr: r.dr,
      cr: r.cr,
      ghiChu: r.ghiChu || undefined,
      loaiPhatSinh: r.loaiPhatSinh,
      quocGiaId: r.quocGiaId,
      sanLuong: r.sanLuong,
      bankAccount: r.bankAccount || undefined,
    }));
    setErrorMessage(null);
    importMutation.mutate(payload);
  };

  const handleReset = () => {
    setStep(1);
    setFile(null);
    setSheetNames([]);
    setSheetName('');
    setParsedRows([]);
    setImportResult(null);
    setErrorMessage(null);
  };

  return (
    <div className="container mx-auto p-4 max-w-6xl space-y-4">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/debt-management"
          className="inline-flex items-center gap-1.5 text-sm text-[#14264b] hover:underline"
        >
          <FiArrowLeft className="w-4 h-4" /> Quay lại
        </Link>
        <h1 className="text-xl font-bold text-slate-800">Import công nợ mới từ Excel</h1>
      </div>

      {errorMessage && (
        <div className="p-2 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-red-600">{errorMessage}</p>
        </div>
      )}

      {/* Step 1: Select file */}
      {step === 1 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-800">Bước 1: Chọn file Excel</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              File phải có các cột: {TEMPLATE_HEADERS.join(', ')}. Chỉ hỗ trợ thêm mới công nợ.
              Trong file mẫu, cột &quot;User&quot;, &quot;Loại phát sinh&quot;, &quot;Tuyến&quot; và &quot;Tài khoản&quot; có sẵn danh sách để chọn cho đúng, tránh gõ sai. Dòng ví dụ chỉ để minh họa định dạng, hãy xóa hoặc thay bằng dữ liệu thật trước khi import.
            </p>
          </div>

          <button
            type="button"
            onClick={handleDownloadTemplate}
            disabled={!templateDataReady}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 rounded-lg text-xs font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <FiDownload className="w-3.5 h-3.5" /> {templateDataReady ? 'Tải file mẫu' : 'Đang tải danh sách...'}
          </button>

          <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-600 space-y-1">
            <p className="font-medium text-slate-700">Giá trị hợp lệ cho &quot;Loại phát sinh&quot;:</p>
            <p>{Object.values(LOAI_PHAT_SINH_LABELS).join(', ')} (để trống = {LOAI_PHAT_SINH_LABELS[2]})</p>
            <p className="font-medium text-slate-700 pt-1">Cột &quot;Sản lượng (kg)&quot; là bắt buộc khi Loại phát sinh = Cân Kg, ngược lại để trống.</p>
            <p className="font-medium text-slate-700 pt-1">Cột &quot;Tài khoản&quot; (nếu điền) phải khớp đúng tên tài khoản ngân hàng đang hoạt động trong hệ thống.</p>
            <p className="font-medium text-slate-700 pt-1">Cột &quot;Tuyến&quot; là bắt buộc; phải khớp đúng tên quốc gia đang có trong hệ thống.</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">File Excel (.xlsx)</label>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
            />
          </div>

          <button
            onClick={handleNextStep1}
            disabled={!file || isProcessing}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14264b] text-white rounded-xl hover:bg-cyan-400 transition-colors duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? 'Đang đọc file...' : 'Tiếp theo'}
          </button>
        </div>
      )}

      {/* Step 2: Choose sheet */}
      {step === 2 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
          <h2 className="text-base font-bold text-slate-800">Bước 2: Chọn Sheet</h2>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-2">Tên Sheet</label>
            <select
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs"
            >
              {sheetNames.map((name) => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Quay lại
            </button>
            <button
              onClick={handleNextStep2}
              disabled={isProcessing}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#14264b] text-white rounded-xl hover:bg-cyan-400 transition-colors duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? 'Đang xử lý...' : 'Tiếp theo'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Preview & validate */}
      {step === 3 && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">Bước 3: Xác nhận dữ liệu</h2>
            <p className="text-xs">
              <span className="text-emerald-600 font-medium">{validRows.length} dòng hợp lệ</span>
              {invalidCount > 0 && (
                <span className="text-red-600 font-medium ml-2">{invalidCount} dòng lỗi</span>
              )}
              <span className="text-slate-400 ml-2">/ {parsedRows.length} dòng</span>
            </p>
          </div>

          <div className="overflow-x-auto border border-slate-100 rounded-lg max-h-[28rem] overflow-y-auto">
            <table className="min-w-full text-xs">
              <thead className="bg-slate-50 sticky top-0">
                <tr>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Dòng</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">User</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Nội dung</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Ngày</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Loại phát sinh</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Tuyến</th>
                  <th className="px-2 py-2 text-right font-medium text-slate-600">SL (kg)</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Tài khoản</th>
                  <th className="px-2 py-2 text-right font-medium text-slate-600">DR</th>
                  <th className="px-2 py-2 text-right font-medium text-slate-600">CR</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Ghi chú</th>
                  <th className="px-2 py-2 text-left font-medium text-slate-600">Lỗi</th>
                </tr>
              </thead>
              <tbody>
                {parsedRows.map((r) => (
                  <tr key={r.rowIndex} className={r.errors.length > 0 ? 'bg-red-50' : 'border-t border-slate-50'}>
                    <td className="px-2 py-1.5 text-slate-500">{r.rowIndex}</td>
                    <td className="px-2 py-1.5">{r.username}</td>
                    <td className="px-2 py-1.5">{r.noiDung}</td>
                    <td className="px-2 py-1.5">{r.ngay}</td>
                    <td className="px-2 py-1.5">{LOAI_PHAT_SINH_LABELS[r.loaiPhatSinh]}</td>
                    <td className="px-2 py-1.5">{r.tuyen}</td>
                    <td className="px-2 py-1.5 text-right">{r.sanLuong != null ? r.sanLuong.toLocaleString('vi-VN', { maximumFractionDigits: 4 }) : ''}</td>
                    <td className="px-2 py-1.5">{r.bankAccount}</td>
                    <td className="px-2 py-1.5 text-right">{r.dr ? r.dr.toLocaleString('vi-VN') : ''}</td>
                    <td className="px-2 py-1.5 text-right">{r.cr ? r.cr.toLocaleString('vi-VN') : ''}</td>
                    <td className="px-2 py-1.5">{r.ghiChu}</td>
                    <td className="px-2 py-1.5 text-red-600">{r.errors.join('; ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Quay lại
            </button>
            <button
              onClick={handleImport}
              disabled={validRows.length === 0 || importMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-500 transition-colors duration-200 font-medium shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FiUploadCloud className="w-4 h-4" />
              {importMutation.isPending ? 'Đang import...' : `Import ${validRows.length} dòng hợp lệ`}
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Result */}
      {step === 4 && importResult && (
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-4 space-y-4">
          <h2 className="text-base font-bold text-slate-800">Kết quả Import</h2>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-sm text-emerald-700">
            Thành công: {importResult.successCount} / Lỗi: {importResult.failCount} / Tổng: {importResult.results.length} dòng
          </div>

          {importResult.failCount > 0 && (
            <div className="overflow-x-auto border border-slate-100 rounded-lg max-h-80 overflow-y-auto">
              <table className="min-w-full text-xs">
                <thead className="bg-slate-50 sticky top-0">
                  <tr>
                    <th className="px-2 py-2 text-left font-medium text-slate-600">Dòng Excel</th>
                    <th className="px-2 py-2 text-left font-medium text-slate-600">User</th>
                    <th className="px-2 py-2 text-left font-medium text-slate-600">Lý do lỗi</th>
                  </tr>
                </thead>
                <tbody>
                  {importResult.results
                    .filter((r) => !r.success)
                    .map((r) => (
                      <tr key={r.row} className="bg-red-50 border-t border-slate-50">
                        <td className="px-2 py-1.5">{validRows[r.row - 1]?.rowIndex ?? '-'}</td>
                        <td className="px-2 py-1.5">{validRows[r.row - 1]?.username ?? '-'}</td>
                        <td className="px-2 py-1.5 text-red-600">{r.message}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}

          <button
            onClick={handleReset}
            className="px-4 py-2.5 bg-[#14264b] text-white rounded-xl hover:bg-cyan-400 transition-colors duration-200 font-medium shadow-sm"
          >
            Import tiếp
          </button>
        </div>
      )}
    </div>
  );
}
