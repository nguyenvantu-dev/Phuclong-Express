'use client';

import { useState } from 'react';
import Link from 'next/link';

/**
 * Debt Import Page
 *
 * Converted from admin/ManageCongNo_Import.aspx
 * Features:
 * - Upload Excel file
 * - Select sheet
 * - Validate data
 * - Import data
 */
export default function DebtImportPage() {
  const [step, setStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [sheetName, setSheetName] = useState('');
  const [mode, setMode] = useState<'0' | '1'>('0');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.xlsx')) {
        setMessage('File không hợp lệ (vui lòng chọn một file .xlsx)!');
        return;
      }
      setFile(selectedFile);
      setMessage('');
    }
  };

  const handleNextStep1 = () => {
    if (!file) {
      setMessage('Chọn file dữ liệu!');
      return;
    }
    setStep(2);
  };

  const handleNextStep2 = () => {
    if (!sheetName) {
      setMessage('Phải chọn sheet cần Import');
      return;
    }
    setStep(3);
  };

  const handleNextStep3 = () => {
    setIsLoading(true);
    // Simulate import
    setTimeout(() => {
      setIsLoading(false);
      setStep(4);
      setMessage(`Đã import thành công 0 dòng dữ liệu`);
    }, 2000);
  };

  const handleFinish = () => {
    setStep(0);
    setFile(null);
    setSheetName('');
    setMessage('');
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href="/admin/debt-management"
          className="text-blue-600 hover:underline"
        >
          ← Quay lại
        </Link>
        <h1 className="text-2xl font-bold">Import công nợ từ Excel</h1>
      </div>

      {/* Mode Selection */}
      <div className="bg-white p-4 rounded-lg shadow mb-4">
        <h2 className="text-lg font-semibold mb-4">Chọn chế độ import</h2>
        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              value="0"
              checked={mode === '0'}
              onChange={(e) => setMode(e.target.value as '0' | '1')}
            />
            Thêm mới công nợ
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              name="mode"
              value="1"
              checked={mode === '1'}
              onChange={(e) => setMode(e.target.value as '0' | '1')}
            />
            Chỉnh sửa công nợ
          </label>
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded mb-4 ${message.includes('thành công') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {message}
        </div>
      )}

      {/* Step 1: Select File */}
      <div className={`bg-white p-6 rounded-lg shadow mb-4 ${step !== 1 && step !== 0 ? 'hidden' : ''}`}>
        <h2 className="text-lg font-semibold mb-4">Bước 1: Chọn file Excel</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">File Excel (.xlsx)</label>
            <input
              type="file"
              accept=".xlsx"
              onChange={handleFileChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleNextStep1}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Choose Sheet */}
      <div className={`bg-white p-6 rounded-lg shadow mb-4 ${step !== 2 ? 'hidden' : ''}`}>
        <h2 className="text-lg font-semibold mb-4">Bước 2: Chọn Sheet</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Tên Sheet</label>
            <select
              value={sheetName}
              onChange={(e) => setSheetName(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">--Chọn sheet--</option>
              <option value="Sheet1">Sheet1</option>
              <option value="Sheet2">Sheet2</option>
              <option value="Sheet3">Sheet3</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 border rounded hover:bg-gray-100"
            >
              Quay lại
            </button>
            <button
              onClick={handleNextStep2}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </div>

      {/* Step 3: Validate Data */}
      <div className={`bg-white p-6 rounded-lg shadow mb-4 ${step !== 3 ? 'hidden' : ''}`}>
        <h2 className="text-lg font-semibold mb-4">Bước 3: Xác nhận dữ liệu</h2>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              File: {file?.name}
            </p>
            <p className="text-sm text-gray-600">
              Sheet: {sheetName}
            </p>
          </div>
          {isLoading ? (
            <div className="text-center py-4">Đang xử lý...</div>
          ) : (
            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Quay lại
              </button>
              <button
                onClick={handleNextStep3}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Import dữ liệu
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Step 4: Finish */}
      <div className={`bg-white p-6 rounded-lg shadow mb-4 ${step !== 4 ? 'hidden' : ''}`}>
        <h2 className="text-lg font-semibold mb-4">Hoàn thành</h2>
        <div className="space-y-4">
          <div className="p-4 bg-green-100 text-green-800 rounded">
            {message}
          </div>
          <button
            onClick={handleFinish}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Import tiếp
          </button>
        </div>
      </div>
    </div>
  );
}
