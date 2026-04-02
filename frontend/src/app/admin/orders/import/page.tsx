'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation } from '@tanstack/react-query';
import Link from 'next/link';
import { importOrders } from '@/lib/api';

/**
 * Import Orders Page
 *
 * Converted from QLDatHang_Import.aspx
 * Features:
 * - Upload Excel file to import orders
 * - Support edit mode (m=1) for updating existing orders
 * - Multi-step import process: Select File -> Choose Sheet -> Validate -> Import
 */

type ImportStep = 'select-file' | 'choose-sheet' | 'validate' | 'finished';

/**
 * Import Orders Page Component
 */
export default function ImportOrdersPage() {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>('select-file');
  const [mode, setMode] = useState<string>('0'); // '0' = new, '1' = edit
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState<string>('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [importResult, setImportResult] = useState<{ imported: number; errors?: string[] } | null>(null);

  // Import mutation
  const importMutation = useMutation({
    mutationFn: async (file: File) => {
      const result = await importOrders(file, {
        sheetName,
        mode,
      });
      return result;
    },
    onSuccess: (data) => {
      setImportResult(data);
      setStep('finished');
    },
    onError: (err) => {
      alert(`Lỗi import: ${(err as Error).message}`);
    },
  });

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith('.xlsx')) {
        alert('Vui lòng chọn file .xlsx');
        return;
      }
      setSelectedFile(file);
      setStep('choose-sheet');
    }
  };

  // Handle sheet selection and proceed to validation
  const handleSheetSelect = () => {
    if (!sheetName) {
      alert('Vui lòng chọn sheet');
      return;
    }
    // In a full implementation, we would validate the Excel file here
    // For now, simulate validation
    setValidationErrors([]);
    setStep('validate');
  };

  // Handle import
  const handleImport = () => {
    if (selectedFile) {
      importMutation.mutate(selectedFile);
    }
  };

  // Handle finish/back to start
  const handleFinish = () => {
    setStep('select-file');
    setSelectedFile(null);
    setSheetName('');
    setImportResult(null);
    setValidationErrors([]);
  };

  // Mock sheet names - in real implementation, would be fetched from Excel
  const mockSheets = ['Sheet1', 'Sheet2', 'Orders'];

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/orders"
            className="rounded-lg p-2 text-gray-600 hover:bg-gray-100"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Import Đơn hàng từ Excel</h1>
        </div>
      </div>

      {/* Mode selector */}
      <div className="rounded-lg bg-white p-4 shadow">
        <div className="flex gap-4">
          <button
            onClick={() => setMode('0')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === '0'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Thêm mới item
          </button>
          <button
            onClick={() => setMode('1')}
            className={`rounded-lg px-4 py-2 text-sm font-medium ${
              mode === '1'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Chỉnh sửa item
          </button>
        </div>
        <p className="mt-2 text-sm text-gray-600">
          {mode === '0' ? 'Chế độ thêm mới: Tạo các đơn hàng mới từ file Excel' : 'Chế độ chỉnh sửa: Cập nhật các đơn hàng đã có từ file Excel'}
        </p>
      </div>

      {/* Step 1: Select File */}
      {step === 'select-file' && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Bước 1: Chọn file Excel</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                File Excel (.xlsx)
              </label>
              <input
                type="file"
                accept=".xlsx"
                onChange={handleFileChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
            <p className="text-sm text-gray-500">
              Vui lòng chọn file Excel có định dạng .xlsx
            </p>
          </div>
        </div>
      )}

      {/* Step 2: Choose Sheet */}
      {step === 'choose-sheet' && selectedFile && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Bước 2: Chọn Sheet</h2>
          <div className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Chọn Sheet cần import
              </label>
              <select
                value={sheetName}
                onChange={(e) => setSheetName(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              >
                <option value="">-- Chọn Sheet --</option>
                {mockSheets.map((sheet) => (
                  <option key={sheet} value={sheet}>
                    {sheet}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setStep('select-file')}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleSheetSelect}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Tiếp theo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3: Validate Data */}
      {step === 'validate' && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Bước 3: Xác nhận dữ liệu</h2>
          <div className="space-y-4">
            {validationErrors.length > 0 ? (
              <div className="rounded-lg bg-red-50 p-4">
                <h3 className="font-medium text-red-800">Lỗi dữ liệu:</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-red-700">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="rounded-lg bg-green-50 p-4">
                <p className="text-sm text-green-800">Dữ liệu hợp lệ. Sẵn sàng để import.</p>
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={() => setStep('choose-sheet')}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Quay lại
              </button>
              <button
                onClick={handleImport}
                disabled={importMutation.isPending}
                className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
              >
                {importMutation.isPending ? 'Đang import...' : 'Import dữ liệu'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Step 4: Finished */}
      {step === 'finished' && importResult && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Hoàn thành</h2>
          <div className="space-y-4">
            <div className="rounded-lg bg-green-50 p-4">
              <p className="font-medium text-green-800">
                Đã import thành công {importResult.imported} dòng dữ liệu
              </p>
            </div>
            {importResult.errors && importResult.errors.length > 0 && (
              <div className="rounded-lg bg-yellow-50 p-4">
                <h3 className="font-medium text-yellow-800">Cảnh báo:</h3>
                <ul className="mt-2 list-inside list-disc text-sm text-yellow-700">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="flex gap-4">
              <button
                onClick={handleFinish}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Import tiếp
              </button>
              <Link
                href="/admin/orders"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Về danh sách đơn hàng
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
