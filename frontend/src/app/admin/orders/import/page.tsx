'use client';

import { useState, useCallback } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { getCountries, getExchangeRates, getUsernames, importOrdersJson, ImportOrderJsonItem } from '@/lib/api';
import apiClient from '@/lib/api-client';

// ---- Excel column headers (case-insensitive match) ----
const COL_USERNAME = ['username', 'tên khách', 'khách hàng'];
const COL_LOAI_TIEN = ['loại tiền', 'loai tien', 'currency', 'tiền tệ'];
const COL_QUOC_GIA = ['quốc gia', 'quoc gia', 'country', 'tên quốc gia'];
const COL_LINK_SP = ['link sản phẩm', 'link san pham', 'link web', 'linkweb', 'link'];
const COL_MAU = ['màu', 'mau', 'color', 'màu sắc'];
const COL_SIZE = ['size', 'kích thước', 'kich thuoc'];
const COL_SO_LUONG = ['số lượng', 'so luong', 'soluong', 'qty', 'quantity'];
const COL_LINK_HINH = ['link hình', 'link hinh', 'linkhinh', 'hình', 'image'];
const COL_GIA_WEB = ['giá web', 'gia web', 'dongiaweb', 'đơn giá', 'price'];
const COL_SALE_OFF = ['%sale off', 'sale off', 'saleoff', 'giảm giá', 'discount'];

function matchHeader(header: string, candidates: string[]): boolean {
  const h = header.toLowerCase().trim();
  return candidates.some((c) => h === c || h.includes(c));
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.replace('www.', '');
  } catch {
    return '';
  }
}

interface ParsedRow {
  excelRowIndex: number;
  username: string;
  loaitien: string;
  tenQuocGia: string;
  quocGiaId: number;
  linkweb: string;
  color: string;
  size: string;
  soluong: number;
  linkhinh: string;
  dongiaweb: number;
  saleoff: number;
  websiteName: string;
  tygia: number;
  errors: string[];
}

type Step = 'select-file' | 'preview' | 'result';

export default function ImportOrdersPage() {
  const [step, setStep] = useState<Step>('select-file');
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [selectedSheet, setSelectedSheet] = useState('');
  const [workbook, setWorkbook] = useState<XLSX.WorkBook | null>(null);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; errors: string[] } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const { data: countries = [], isLoading: loadingCountries } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
    staleTime: 5 * 60 * 1000,
  });

  const { data: exchangeRates = [], isLoading: loadingRates } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: getExchangeRates,
    staleTime: 5 * 60 * 1000,
  });

  const { data: usernameList = [], isLoading: loadingUsers } = useQuery({
    queryKey: ['usernames'],
    queryFn: getUsernames,
    staleTime: 5 * 60 * 1000,
  });

  const refDataLoading = loadingCountries || loadingRates || loadingUsers;

  const importMutation = useMutation({
    mutationFn: (items: ImportOrderJsonItem[]) => importOrdersJson(items, '0'),
    onSuccess: (data) => {
      setImportResult(data);
      setStep('result');
    },
    onError: (err) => {
      alert(`Lỗi import: ${(err as Error).message}`);
    },
  });

  // ---- Parse Excel file ----
  const parseFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target?.result as ArrayBuffer);
      const wb = XLSX.read(data, { type: 'array' });
      setWorkbook(wb);
      setSheetNames(wb.SheetNames);
      setSelectedSheet(wb.SheetNames[0] || '');
    };
    reader.readAsArrayBuffer(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      alert('Vui lòng chọn file Excel (.xlsx hoặc .xls)');
      return;
    }
    parseFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    parseFile(file);
  };

  // ---- Parse sheet into rows ----
  const handleParseSheet = () => {
    if (!workbook || !selectedSheet) return;
    const ws = workbook.Sheets[selectedSheet];
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { defval: '' });
    if (rawRows.length === 0) {
      alert('Sheet không có dữ liệu');
      return;
    }

    const headers = Object.keys(rawRows[0]);
    const findCol = (candidates: string[]) =>
      headers.find((h) => matchHeader(h, candidates)) ?? '';

    const colUsername = findCol(COL_USERNAME);
    const colLoaiTien = findCol(COL_LOAI_TIEN);
    const colQuocGia = findCol(COL_QUOC_GIA);
    const colLinkSp = findCol(COL_LINK_SP);
    const colMau = findCol(COL_MAU);
    const colSize = findCol(COL_SIZE);
    const colSoLuong = findCol(COL_SO_LUONG);
    const colLinkHinh = findCol(COL_LINK_HINH);
    const colGiaWeb = findCol(COL_GIA_WEB);
    const colSaleOff = findCol(COL_SALE_OFF);

    // Lookup maps
    const countryMap = new Map<string, number>(
      countries.map((c) => [c.TenQuocGia.toLowerCase().trim(), c.QuocGiaID]),
    );
    const rateMap = new Map<string, number>(
      exchangeRates.map((r) => [r.Name.toUpperCase(), r.TyGiaVND]),
    );
    const validCurrencies = new Set(exchangeRates.map((r) => r.Name.toUpperCase()));
    const validUsernames = new Set(usernameList.map((u) => u.username.toLowerCase().trim()));

    const parsed: ParsedRow[] = rawRows.map((raw, idx) => {
      const rowErrors: string[] = [];

      // --- Đọc từng field ---
      const username = String(raw[colUsername] ?? '').trim();
      const loaitien = String(raw[colLoaiTien] ?? '').trim().toUpperCase();
      const tenQuocGia = String(raw[colQuocGia] ?? '').trim();
      const linkweb = String(raw[colLinkSp] ?? '').trim();
      const color = String(raw[colMau] ?? '').trim();
      const size = String(raw[colSize] ?? '').trim();
      const rawSoLuong = raw[colSoLuong];
      const rawGiaWeb = raw[colGiaWeb];
      const rawSaleOff = raw[colSaleOff];
      const linkhinh = String(raw[colLinkHinh] ?? '').trim();

      const soluong = Number(rawSoLuong);
      const dongiaweb = Number(rawGiaWeb);
      const saleoff = Number(rawSaleOff ?? 0);

      // --- Validate username ---
      if (!username) {
        rowErrors.push('Username: trống');
      } else if (!validUsernames.has(username.toLowerCase())) {
        rowErrors.push(`Username "${username}" không tồn tại trong hệ thống`);
      }

      // --- Validate loại tiền ---
      if (!loaitien) {
        rowErrors.push('Loại tiền: trống');
      } else if (!validCurrencies.has(loaitien)) {
        rowErrors.push(`Loại tiền "${loaitien}" không hợp lệ (hợp lệ: ${Array.from(validCurrencies).join(', ')})`);
      }

      // --- Validate quốc gia ---
      const quocGiaId = tenQuocGia ? (countryMap.get(tenQuocGia.toLowerCase()) ?? 0) : 0;
      if (!tenQuocGia) {
        rowErrors.push('Quốc gia: trống');
      } else if (!quocGiaId) {
        rowErrors.push(`Quốc gia "${tenQuocGia}" không tồn tại trong hệ thống`);
      }

      // --- Validate link sản phẩm ---
      if (!linkweb) {
        rowErrors.push('Link sản phẩm: trống');
      } else {
        try { new URL(linkweb); } catch {
          rowErrors.push(`Link sản phẩm không hợp lệ: "${linkweb}"`);
        }
      }

      // --- Validate số lượng ---
      if (rawSoLuong === '' || rawSoLuong === null || rawSoLuong === undefined) {
        rowErrors.push('Số lượng: trống');
      } else if (isNaN(soluong) || !Number.isInteger(soluong) || soluong <= 0) {
        rowErrors.push(`Số lượng "${rawSoLuong}" phải là số nguyên dương`);
      }

      // --- Validate giá web ---
      if (rawGiaWeb === '' || rawGiaWeb === null || rawGiaWeb === undefined) {
        rowErrors.push('Giá web: trống');
      } else if (isNaN(dongiaweb) || dongiaweb <= 0) {
        rowErrors.push(`Giá web "${rawGiaWeb}" phải là số dương`);
      }

      // --- Validate %Sale Off ---
      if (rawSaleOff !== '' && rawSaleOff !== null && rawSaleOff !== undefined) {
        if (isNaN(saleoff) || saleoff < 0 || saleoff > 100) {
          rowErrors.push(`%Sale Off "${rawSaleOff}" phải từ 0 đến 100`);
        }
      }

      const websiteName = extractHostname(linkweb);
      const tygia = rateMap.get(loaitien) ?? 1;

      return {
        excelRowIndex: idx + 2,
        username,
        loaitien: loaitien || 'USD',
        tenQuocGia,
        quocGiaId,
        linkweb,
        color,
        size,
        soluong: soluong || 0,
        linkhinh,
        dongiaweb: dongiaweb || 0,
        saleoff: saleoff || 0,
        websiteName,
        tygia,
        errors: rowErrors,
      };
    });

    setRows(parsed);
    setStep('preview');
  };

  const validRows = rows.filter((r) => r.errors.length === 0);
  const errorRows = rows.filter((r) => r.errors.length > 0);

  const handleImport = () => {
    if (validRows.length === 0) {
      alert('Không có dòng hợp lệ để import');
      return;
    }
    const items: ImportOrderJsonItem[] = validRows.map((r) => ({
      excelRowIndex: r.excelRowIndex,
      websiteName: r.websiteName,
      username: r.username,
      loaitien: r.loaitien,
      quocGiaId: r.quocGiaId,
      tenQuocGia: r.tenQuocGia,
      linkweb: r.linkweb,
      linkhinh: r.linkhinh,
      color: r.color,
      size: r.size,
      soluong: r.soluong,
      dongiaweb: r.dongiaweb,
      saleoff: r.saleoff,
      tygia: r.tygia,
    }));
    importMutation.mutate(items);
  };

  const handleReset = () => {
    setStep('select-file');
    setWorkbook(null);
    setSheetNames([]);
    setSelectedSheet('');
    setRows([]);
    setImportResult(null);
  };

  // ---- Download template ----
  const handleDownloadTemplate = async () => {
    // Backend generates the Excel with dropdowns using exceljs (Node.js)
    const response = await apiClient.get('/orders/import-template', {
      responseType: 'blob',
    });
    const url = URL.createObjectURL(new Blob([response.data]));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_import_donhang.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/order-management-list"
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-xl font-bold text-gray-900">Import đơn hàng từ Excel</h1>
        </div>
        <button
          onClick={handleDownloadTemplate}
          className="flex items-center gap-2 rounded-lg border border-green-600 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-50"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Tải file mẫu
        </button>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 text-sm">
        {(['select-file', 'preview', 'result'] as Step[]).map((s, i) => {
          const labels: Record<Step, string> = {
            'select-file': '1. Chọn file',
            'preview': '2. Xem trước',
            'result': '3. Kết quả',
          };
          const isActive = step === s;
          const isDone =
            (s === 'select-file' && (step === 'preview' || step === 'result')) ||
            (s === 'preview' && step === 'result');
          return (
            <div key={s} className="flex items-center gap-2">
              {i > 0 && <div className="h-px w-8 bg-gray-300" />}
              <span
                className={`rounded-full px-3 py-1 font-medium ${
                  isActive
                    ? 'bg-[#14264b] text-white'
                    : isDone
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 text-gray-400'
                }`}
              >
                {labels[s]}
              </span>
            </div>
          );
        })}
      </div>

      {/* STEP 1 — Chọn file */}
      {step === 'select-file' && (
        <div className="rounded-lg bg-white p-6 shadow">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 transition-colors ${
              isDragging ? 'border-[#14264b] bg-blue-50' : 'border-gray-300 bg-gray-50'
            }`}
          >
            <svg className="mb-3 h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mb-1 text-sm font-medium text-gray-700">Kéo thả file vào đây, hoặc</p>
            <label className="cursor-pointer rounded-lg bg-[#14264b] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a6e]">
              Chọn file Excel
              <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleFileChange} />
            </label>
            <p className="mt-2 text-xs text-gray-400">Hỗ trợ định dạng .xlsx, .xls</p>
          </div>

          {/* Sheet selector (appears after file parsed) */}
          {sheetNames.length > 0 && (
            <div className="mt-5 space-y-4 border-t pt-5">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Chọn Sheet</label>
                <select
                  value={selectedSheet}
                  onChange={(e) => setSelectedSheet(e.target.value)}
                  className="w-full max-w-xs rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none"
                >
                  {sheetNames.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={handleParseSheet}
                disabled={refDataLoading}
                title={refDataLoading ? 'Đang tải dữ liệu hệ thống...' : ''}
                className="rounded-lg bg-[#14264b] px-5 py-2 text-sm font-medium text-white hover:bg-[#1e3a6e] disabled:cursor-wait disabled:opacity-60"
              >
                {refDataLoading ? 'Đang tải dữ liệu...' : 'Xem trước dữ liệu →'}
              </button>
            </div>
          )}

          {/* Column guide */}
          <div className="mt-6 rounded-lg bg-blue-50 p-4">
            <p className="mb-2 text-sm font-semibold text-blue-800">Các cột cần có trong file Excel:</p>
            <div className="flex flex-wrap gap-2">
              {['Username', 'Loại tiền', 'Tên quốc gia', 'Link sản phẩm', 'Màu', 'Size', 'Số lượng', 'Link hình', 'Giá web', '%Sale Off'].map((c) => (
                <span key={c} className="rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
                  {c}
                </span>
              ))}
            </div>
            <p className="mt-2 text-xs text-blue-600">Tên cột không phân biệt hoa thường. Tải file mẫu để xem ví dụ.</p>
          </div>
        </div>
      )}

      {/* STEP 2 — Preview */}
      {step === 'preview' && (
        <div className="space-y-4">
          {/* Summary */}
          <div className="flex gap-3">
            <div className="flex-1 rounded-lg bg-white p-4 shadow">
              <p className="text-2xl font-bold text-gray-900">{rows.length}</p>
              <p className="text-sm text-gray-500">Tổng dòng</p>
            </div>
            <div className="flex-1 rounded-lg bg-white p-4 shadow">
              <p className="text-2xl font-bold text-green-600">{validRows.length}</p>
              <p className="text-sm text-gray-500">Hợp lệ</p>
            </div>
            <div className="flex-1 rounded-lg bg-white p-4 shadow">
              <p className="text-2xl font-bold text-red-500">{errorRows.length}</p>
              <p className="text-sm text-gray-500">Có lỗi</p>
            </div>
          </div>

          {/* Error rows */}
          {errorRows.length > 0 && (
            <div className="rounded-lg bg-red-50 p-4 shadow">
              <p className="mb-2 text-sm font-semibold text-red-700">Dòng có lỗi (sẽ bị bỏ qua khi import):</p>
              <ul className="space-y-1 text-xs text-red-600">
                {errorRows.map((r) => (
                  <li key={r.excelRowIndex}>
                    <span className="font-medium">Dòng {r.excelRowIndex}:</span> {r.errors.join(', ')}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Preview table */}
          <div className="rounded-lg bg-white shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-xs font-semibold uppercase text-gray-500">
                  <tr>
                    <th className="px-3 py-2">#</th>
                    <th className="px-3 py-2">Username</th>
                    <th className="px-3 py-2">Loại tiền</th>
                    <th className="px-3 py-2">Quốc gia</th>
                    <th className="px-3 py-2">Link sản phẩm</th>
                    <th className="px-3 py-2">Màu</th>
                    <th className="px-3 py-2">Size</th>
                    <th className="px-3 py-2 text-right">SL</th>
                    <th className="px-3 py-2 text-right">Giá web</th>
                    <th className="px-3 py-2 text-right">Sale Off</th>
                    <th className="px-3 py-2">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {rows.map((r) => (
                    <tr key={r.excelRowIndex} className={r.errors.length > 0 ? 'bg-red-50' : ''}>
                      <td className="px-3 py-2 text-gray-400">{r.excelRowIndex}</td>
                      <td className="px-3 py-2 font-medium text-gray-800">{r.username || <span className="text-red-400 italic">trống</span>}</td>
                      <td className="px-3 py-2">
                        <span className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-mono">{r.loaitien}</span>
                      </td>
                      <td className="px-3 py-2">{r.tenQuocGia}</td>
                      <td className="max-w-[200px] truncate px-3 py-2">
                        {r.linkweb ? (
                          <a href={r.linkweb} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
                            {r.websiteName || r.linkweb}
                          </a>
                        ) : (
                          <span className="text-red-400 italic">trống</span>
                        )}
                      </td>
                      <td className="px-3 py-2">{r.color}</td>
                      <td className="px-3 py-2">{r.size}</td>
                      <td className="px-3 py-2 text-right">{r.soluong}</td>
                      <td className="px-3 py-2 text-right">{r.dongiaweb.toLocaleString()}</td>
                      <td className="px-3 py-2 text-right">{r.saleoff > 0 ? `${r.saleoff}%` : '—'}</td>
                      <td className="px-3 py-2">
                        {r.errors.length === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700">
                            ✓ OK
                          </span>
                        ) : (
                          <span
                            title={r.errors.join('\n')}
                            className="inline-flex cursor-help items-center gap-1 rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600"
                          >
                            ✕ {r.errors.length} lỗi
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between">
            <button
              onClick={handleReset}
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Chọn file khác
            </button>
            <button
              onClick={handleImport}
              disabled={importMutation.isPending || validRows.length === 0}
              className="rounded-lg bg-green-600 px-6 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {importMutation.isPending
                ? 'Đang import...'
                : `Import ${validRows.length} đơn hàng`}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3 — Result */}
      {step === 'result' && importResult && (
        <div className="rounded-lg bg-white p-6 shadow space-y-4">
          <div className="rounded-lg bg-green-50 p-4">
            <p className="text-lg font-semibold text-green-800">
              Import thành công {importResult.imported} đơn hàng
            </p>
          </div>

          {importResult.errors.length > 0 && (
            <div className="rounded-lg bg-yellow-50 p-4">
              <p className="mb-2 text-sm font-semibold text-yellow-800">
                {importResult.errors.length} dòng bị lỗi khi lưu:
              </p>
              <ul className="list-inside list-disc space-y-1 text-xs text-yellow-700">
                {importResult.errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg bg-[#14264b] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e3a6e]"
            >
              Import tiếp
            </button>
            <Link
              href="/admin/order-management-list"
              className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Về danh sách đơn hàng
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
