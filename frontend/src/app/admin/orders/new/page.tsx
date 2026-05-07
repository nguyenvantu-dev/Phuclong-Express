'use client';

import { useState, useRef, useEffect } from 'react';
import type { CSSProperties } from 'react';
import type { KeyboardEvent } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useAuthStore } from '@/hooks/use-auth';
import {
  getUsernames,
  getCountries,
  getExchangeRatesForEdit,
  calculateTienCong,
  uploadQuickOrderImage,
  addQuickOrder,
} from '@/lib/api';
import apiClient from '@/lib/api-client';

/**
 * QLDatHang_Them Page - Converted from admin/QLDatHang_Them.aspx
 *
 * Features:
 * - Grid with footer row containing form inputs (like ASP.NET GridView with ShowFooter=true)
 * - Dropdowns: Website, Username, Currency, Country
 * - Image upload with resize to 640x480
 * - Clone button to copy last row data into form
 * - Auto-calculate: tienCongVnd, tongTienVnd
 * - Insert button adds row to grid + calls backend
 * - Uses SP_Them_DonHang_Simple_CoTamTinh
 */

interface GridRow {
  id: string;
  websiteName: string;
  username: string;
  loaiTien: string;
  quocGiaId: number | null;
  tenQuocGia: string;
  linkWeb: string;
  linkHinh: string;
  color: string;
  size: string;
  soLuong: number;
  donGiaWeb: number;
  cong: number;
  saleOff: number;
  phuThu: number;
  shipUsa: number;
  tax: number;
  tienCongVnd: number;
  tongTienVnd: number;
  ghiChu: string;
  status: 'pending' | 'success' | 'error';
}

interface FormData {
  websiteName: string;
  username: string;
  loaiTien: string;
  loaiTienValue: number;
  quocGiaId: number | null;
  linkWeb: string;
  linkHinh: string;
  imageFile: File | null;
  color: string;
  size: string;
  soLuong: string;
  donGiaWeb: string;
  cong: string;
  saleOff: string;
  phuThu: string;
  shipUsa: string;
  tax: string;
  ghiChu: string;
}

export default function QLDatHangThemPage() {
  const { user } = useAuthStore();
  const currentUsername = user?.username || '';

  // Grid data state
  const [rows, setRows] = useState<GridRow[]>([]);

  // Form state
  const [form, setForm] = useState<FormData>({
    websiteName: '',
    username: '',
    loaiTien: 'USD',
    loaiTienValue: 1,
    quocGiaId: null,
    linkWeb: '',
    linkHinh: '',
    imageFile: null,
    color: '',
    size: '',
    soLuong: '1',
    donGiaWeb: '',
    cong: '',
    saleOff: '',
    phuThu: '',
    shipUsa: '',
    tax: '',
    ghiChu: '',
  });
  const [usernameInput, setUsernameInput] = useState('');
  const [showUsernameDropdown, setShowUsernameDropdown] = useState(false);
  const [activeUsernameIndex, setActiveUsernameIndex] = useState(0);
  const [usernameDropdownStyle, setUsernameDropdownStyle] = useState<CSSProperties>({});

  // Calculated values (shown in footer row)
  const [calculated, setCalculated] = useState({ tienCongVnd: 0, tongTienVnd: 0 });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const usernameDropdownRef = useRef<HTMLDivElement>(null);
  const usernameDropdownPortalRef = useRef<HTMLDivElement>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // Fetch usernames
  const { data: usernames = [] } = useQuery({
    queryKey: ['usernames'],
    queryFn: getUsernames,
  });

  // Fetch websites
  const { data: websites = [] } = useQuery({
    queryKey: ['websites'],
    queryFn: async () => {
      const response = await apiClient.get<{ data: { WebsiteName: string }[] }>('/websites');
      return response.data?.data?.map((w: any) => w.WebsiteName) || [];
    },
  });

  // Fetch countries
  const { data: countries = [] } = useQuery({
    queryKey: ['countries'],
    queryFn: getCountries,
  });

  // Fetch exchange rates
  const { data: exchangeRates = [] } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: getExchangeRatesForEdit,
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const insideInput = usernameDropdownRef.current?.contains(event.target as Node);
      const insidePortal = usernameDropdownPortalRef.current?.contains(event.target as Node);
      if (!insideInput && !insidePortal) {
        setShowUsernameDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Calculate fee mutation
  const calculateMutation = useMutation({
    mutationFn: calculateTienCong,
    onSuccess: (data) => {
      setCalculated({
        tienCongVnd: data.tienCongVnd,
        tongTienVnd: data.tongTienVnd,
      });
    },
  });

  // Insert mutation
  const insertMutation = useMutation({
    mutationFn: async (row: GridRow) => {
      const tyGia = form.loaiTienValue;
      return addQuickOrder({
        linkWeb: row.linkWeb,
        linkHinh: row.linkHinh,
        color: row.color,
        size: row.size,
        soLuong: row.soLuong,
        donGiaWeb: row.donGiaWeb,
        loaiTien: row.loaiTien,
        ghiChu: row.ghiChu,
        tyGia,
        saleOff: row.saleOff,
        websiteName: row.websiteName,
        username: row.username,
        nguoiTao: currentUsername,
        usernameSave: currentUsername,
        quocGiaId: row.quocGiaId || undefined,
        shipUsa: row.shipUsa,
        tax: row.tax,
        phuThu: row.phuThu,
        cong: row.cong,
      });
    },
    onSuccess: (_data, row) => {
      setFormError(null);
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: 'success' } : r));
      // Reset item-specific fields after insert to prevent double-submit
      // Keep website/username/currency/country for convenience (same as old web)
      setForm(prev => ({
        ...prev,
        linkWeb: '',
        linkHinh: '',
        imageFile: null,
        color: '',
        size: '',
        soLuong: '1',
        donGiaWeb: '',
        saleOff: '',
        phuThu: '',
        shipUsa: '',
        tax: '',
        ghiChu: '',
      }));
      setCalculated({ tienCongVnd: 0, tongTienVnd: 0 });
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    },
    onError: (err: any, row) => {
      setRows(prev => prev.map(r => r.id === row.id ? { ...r, status: 'error' } : r));
      setFormError(err?.message || 'Thêm đơn hàng thất bại');
    },
  });

  // Handle form field changes
  const handleChange = (field: keyof FormData, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };

      // When currency changes, update tyGia value and auto-select matching country
      if (field === 'loaiTien') {
        const rate = exchangeRates.find((r: any) => r.Name === value);
        updated.loaiTienValue = rate?.TyGiaVND || 1;

        const currencyCountryMap: Record<string, string[]> = {
          USD: ['mỹ', 'hoa kỳ', 'usa'],
          EUR: ['đức', 'pháp', 'châu âu', 'eu'],
          GBP: ['anh', 'uk', 'britain'],
          JPY: ['nhật', 'japan'],
          CNY: ['trung', 'china'],
          KRW: ['hàn', 'korea'],
          AUD: ['úc', 'australia'],
          CAD: ['canada'],
          SGD: ['singapore'],
          THB: ['thái', 'thailand'],
          HKD: ['hồng kông', 'hong kong'],
        };
        const keywords = currencyCountryMap[String(value).toUpperCase()] || [];
        const matched = keywords.length > 0
          ? (countries as { QuocGiaID: number; TenQuocGia: string }[]).find(c =>
              keywords.some(kw => c.TenQuocGia.toLowerCase().includes(kw))
            )
          : undefined;
        updated.quocGiaId = matched ? matched.QuocGiaID : null;
      }

      // When form values change, recalculate
      if (['donGiaWeb', 'soLuong', 'saleOff', 'cong', 'phuThu', 'shipUsa', 'tax'].includes(field)) {
        const donGiaWeb = parseFloat(field === 'donGiaWeb' ? value : prev.donGiaWeb) || 0;
        const soLuong = parseInt(field === 'soLuong' ? value : prev.soLuong) || 1;
        const saleOff = parseFloat(field === 'saleOff' ? value : prev.saleOff) || 0;
        const cong = parseFloat(field === 'cong' ? value : prev.cong) || 0;
        const phuThu = parseFloat(field === 'phuThu' ? value : prev.phuThu) || 0;
        const shipUsa = parseFloat(field === 'shipUsa' ? value : prev.shipUsa) || 0;
        const tax = parseFloat(field === 'tax' ? value : prev.tax) || 0;
        const tyGia = field === 'loaiTienValue' ? value : updated.loaiTienValue || 1;

        if (donGiaWeb > 0 && currentUsername) {
          calculateMutation.mutate({
            loaiTien: updated.loaiTien || 'USD',
            donGiaWeb,
            soLuong,
            saleOff,
            cong,
            tyGia,
            username: currentUsername,
            phuThu,
            shipUsa,
            tax,
          });
        }
      }

      return updated;
    });
  };

  const handleUsernameInputChange = (value: string) => {
    setUsernameInput(value);
    updateUsernameDropdownPosition();
    setShowUsernameDropdown(true);
    setActiveUsernameIndex(0);

    setForm(prev => ({
      ...prev,
      username: '',
    }));
  };

  const handleUsernameSelect = (value: string) => {
    setUsernameInput(value);
    setForm(prev => ({ ...prev, username: value }));
    setShowUsernameDropdown(false);
    setActiveUsernameIndex(0);
  };

  const handleUsernameKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Enter'].includes(event.key)) return;

    event.preventDefault();
    if (event.key === 'ArrowDown') {
      updateUsernameDropdownPosition();
      setShowUsernameDropdown(true);
      if (filteredUsernames.length > 0) {
        setActiveUsernameIndex((prev) => (prev + 1) % filteredUsernames.length);
      }
      return;
    }

    if (event.key === 'ArrowUp') {
      updateUsernameDropdownPosition();
      setShowUsernameDropdown(true);
      if (filteredUsernames.length > 0) {
        setActiveUsernameIndex((prev) => (prev - 1 + filteredUsernames.length) % filteredUsernames.length);
      }
      return;
    }

    const activeUsername = filteredUsernames[activeUsernameIndex]?.username;
    if (activeUsername) {
      handleUsernameSelect(activeUsername);
    } else if (!usernameInput.trim()) {
      handleUsernameSelect('');
    } else {
      // No dropdown selection — treat Enter as form submit
      setShowUsernameDropdown(false);
      handleInsert();
    }
  };

  const updateUsernameDropdownPosition = () => {
    const rect = usernameInputRef.current?.getBoundingClientRect();
    if (!rect) return;

    setUsernameDropdownStyle({
      top: rect.bottom + 4,
      left: rect.left,
      width: Math.max(rect.width, 180),
    });
  };

  // Handle image file select
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm(prev => ({ ...prev, imageFile: file }));
      // Preview
      const reader = new FileReader();
      reader.onload = (ev) => setImagePreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  // Handle upload image button
  const handleUploadImage = async () => {
    if (!form.imageFile) return;

    setIsUploading(true);
    try {
      const result = await uploadQuickOrderImage(form.imageFile);
      setForm(prev => ({ ...prev, linkHinh: result.linkHinh, imageFile: null }));
      setImagePreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      setFormError('Upload ảnh thất bại');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle clone button
  const handleClone = () => {
    if (rows.length === 0) return;
    const last = rows[rows.length - 1];
    setUsernameInput(last.username);
    setForm(prev => ({
      ...prev,
      websiteName: last.websiteName,
      username: last.username,
      loaiTien: last.loaiTien,
      quocGiaId: last.quocGiaId,
      linkWeb: last.linkWeb,
      linkHinh: last.linkHinh,
      color: last.color,
      size: last.size,
      soLuong: String(last.soLuong),
      donGiaWeb: String(last.donGiaWeb),
      cong: String(last.cong),
      saleOff: String(last.saleOff),
      phuThu: String(last.phuThu),
      shipUsa: String(last.shipUsa),
      tax: String(last.tax),
      ghiChu: last.ghiChu,
    }));
  };

  // Handle Enter key on form inputs to trigger insert
  const handleFormKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleInsert();
    }
  };

  // Handle insert button
  const handleInsert = () => {
    // Validate required fields
    if (!form.linkWeb.trim()) {
      setFormError('Phải nhập Link SP');
      return;
    }
    if (!form.soLuong || parseInt(form.soLuong) < 1) {
      setFormError('Số lượng phải >= 1');
      return;
    }
    if (!form.username) {
      setFormError('Phải chọn Username');
      return;
    }
    setFormError(null);

    const soLuong = parseInt(form.soLuong) || 1;
    const donGiaWeb = parseFloat(form.donGiaWeb) || 0;
    const saleOff = parseFloat(form.saleOff) || 0;
    const cong = parseFloat(form.cong) || 0;
    const phuThu = parseFloat(form.phuThu) || 0;
    const shipUsa = parseFloat(form.shipUsa) || 0;
    const tax = parseFloat(form.tax) || 0;

    // Calculate locally if API not yet called
    const giaSauOffUsd = ((100 - saleOff) / 100) * donGiaWeb * soLuong;
    let tienCongVnd = calculated.tienCongVnd;
    let tongTienVnd = calculated.tongTienVnd;

    if (tongTienVnd === 0 && donGiaWeb > 0) {
      // Fallback calculation
      const tongTienUsd = giaSauOffUsd + (shipUsa + phuThu) * soLuong + giaSauOffUsd * 0.01 * tax;
      tongTienVnd = Math.ceil(tongTienUsd * form.loaiTienValue) + tienCongVnd;
    }

    const newRow: GridRow = {
      id: Date.now().toString(),
      websiteName: form.websiteName,
      username: form.username,
      loaiTien: form.loaiTien,
      quocGiaId: form.quocGiaId,
      tenQuocGia: countries.find((c: any) => c.QuocGiaID === form.quocGiaId)?.TenQuocGia || '',
      linkWeb: form.linkWeb,
      linkHinh: form.linkHinh,
      color: form.color,
      size: form.size,
      soLuong,
      donGiaWeb,
      cong,
      saleOff,
      phuThu,
      shipUsa,
      tax,
      tienCongVnd,
      tongTienVnd,
      ghiChu: form.ghiChu,
      status: 'pending',
    };

    setRows(prev => [...prev, newRow]);
    insertMutation.mutate(newRow);
  };

  const filteredUsernames = (usernames as { username: string }[])
    .filter((u) => u.username.toLowerCase().includes(usernameInput.trim().toLowerCase()))
    .slice(0, 50);

  return (
    <div className="space-y-4">
      {/* Username dropdown portal */}
      {showUsernameDropdown && (
        <div
          ref={usernameDropdownPortalRef}
          className="fixed z-50 max-h-64 overflow-auto rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-xl"
          style={usernameDropdownStyle}
        >
          <button
            type="button"
            onClick={() => handleUsernameSelect('')}
            className="block w-full px-3 py-2 text-left text-gray-400 hover:bg-[#14264b]/5"
          >
            -- Temporary user --
          </button>
          {filteredUsernames.map((u, index) => (
            <button
              key={u.username}
              type="button"
              onClick={() => handleUsernameSelect(u.username)}
              onMouseEnter={() => setActiveUsernameIndex(index)}
              className={`block w-full px-3 py-2 text-left font-medium hover:bg-[#14264b]/5 hover:text-[#14264b] ${
                index === activeUsernameIndex ? 'bg-[#14264b]/5 text-[#14264b]' : 'text-gray-900'
              }`}
            >
              {u.username}
            </button>
          ))}
          {filteredUsernames.length === 0 && (
            <div className="px-3 py-2 text-gray-400">Không có username phù hợp</div>
          )}
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <Link href="/admin/order-management-list" className="rounded px-3 py-1 text-sm text-[#14264b] hover:bg-[#14264b]/5">
          Quản lý Item
        </Link>
        <span className="rounded bg-gray-600 px-3 py-1 text-sm text-white">Tạo mới item</span>
        <Link href="/admin/orders/import" className="rounded px-3 py-1 text-sm text-[#14264b] hover:bg-[#14264b]/5">
          Thêm mới item bằng excel
        </Link>
      </div>

      {/* Form Card */}
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-base font-bold text-gray-900">TẠO MỚI ITEM</h3>
          {rows.length > 0 && (
            <button
              type="button"
              onClick={handleClone}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-[#14264b]"
            >
              Clone từ item cuối
            </button>
          )}
        </div>

        <div className="space-y-5 p-6">
          {/* Thông tin cơ bản */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Thông tin cơ bản</p>
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Website</label>
                <select
                  value={form.websiteName}
                  onChange={e => handleChange('websiteName', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
                >
                  <option value="">-- Web khác --</option>
                  {(websites as string[]).map((w, idx) => (
                    <option key={`${w}-${idx}`} value={w}>{w}</option>
                  ))}
                </select>
              </div>

              <div ref={usernameDropdownRef}>
                <label className="mb-1 block text-xs font-medium text-gray-600">
                  Username <span className="text-red-500">*</span>
                </label>
                <input
                  ref={usernameInputRef}
                  type="text"
                  value={usernameInput}
                  onChange={e => handleUsernameInputChange(e.target.value)}
                  onKeyDown={handleUsernameKeyDown}
                  onFocus={() => {
                    updateUsernameDropdownPosition();
                    setActiveUsernameIndex(0);
                    setShowUsernameDropdown(true);
                  }}
                  placeholder="Tìm username..."
                  autoComplete="off"
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Loại tiền</label>
                <select
                  value={form.loaiTien}
                  onChange={e => handleChange('loaiTien', e.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
                >
                  {(exchangeRates as { Name: string; TyGiaVND: number }[]).map(r => (
                    <option key={r.Name} value={r.Name}>{r.Name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Quốc gia</label>
                <select
                  value={form.quocGiaId ?? ''}
                  onChange={e => handleChange('quocGiaId', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
                >
                  <option value="">-- Chọn --</option>
                  {(countries as { QuocGiaID: number; TenQuocGia: string }[]).map(c => (
                    <option key={c.QuocGiaID} value={c.QuocGiaID}>{c.TenQuocGia}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Link sản phẩm */}
          <div>
            <label className="mb-1 block text-xs font-medium text-gray-600">
              Link sản phẩm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.linkWeb}
              onChange={e => handleChange('linkWeb', e.target.value)}
              onKeyDown={handleFormKeyDown}
              placeholder="https://..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
            />
          </div>

          {/* Thuộc tính + Hình ảnh */}
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Thuộc tính</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Màu</label>
                  <input
                    type="text"
                    value={form.color}
                    onChange={e => handleChange('color', e.target.value)}
                    onKeyDown={handleFormKeyDown}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">Size</label>
                  <input
                    type="text"
                    value={form.size}
                    onChange={e => handleChange('size', e.target.value)}
                    onKeyDown={handleFormKeyDown}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-600">
                    Số lượng <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.soLuong}
                    onChange={e => handleChange('soLuong', e.target.value)}
                    onKeyDown={handleFormKeyDown}
                    min="1"
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
                  />
                </div>
              </div>
            </div>

            <div>
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Hình ảnh</p>
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-gray-600">Link hình</label>
                  <input
                    type="text"
                    value={form.linkHinh}
                    onChange={e => handleChange('linkHinh', e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
                  />
                </div>
                <div className="flex-shrink-0">
                  <label className="mb-1 block text-xs font-medium text-gray-600">Hoặc upload</label>
                  <label className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-dashed border-gray-300 px-3 py-2 text-xs text-gray-500 hover:border-[#14264b] hover:text-[#14264b]">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                    Chọn file
                  </label>
                </div>
                {imagePreview && (
                  <div className="flex flex-col items-center gap-1">
                    <img src={imagePreview} alt="preview" className="h-9 w-auto rounded border border-gray-200" />
                    <button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={isUploading}
                      className="rounded bg-[#14264b] px-2 py-0.5 text-xs text-white hover:bg-[#1e3a6e] disabled:opacity-50"
                    >
                      {isUploading ? '...' : 'Upload'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Thông tin giá */}
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Thông tin giá</p>
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-6">
              {[
                { label: 'Giá web', field: 'donGiaWeb' as const, placeholder: '0.00' },
                { label: '% Công', field: 'cong' as const, placeholder: '0' },
                { label: '% Sale off', field: 'saleOff' as const, placeholder: '0' },
                { label: '$Phụ thu', field: 'phuThu' as const, placeholder: '0.00' },
                { label: '$Ship US', field: 'shipUsa' as const, placeholder: '0.00' },
                { label: 'Tax', field: 'tax' as const, placeholder: '0' },
              ].map(({ label, field, placeholder }) => (
                <div key={field}>
                  <label className="mb-1 block text-xs font-medium text-gray-600">{label}</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form[field]}
                    onChange={e => handleChange(field, e.target.value)}
                    onKeyDown={handleFormKeyDown}
                    placeholder={placeholder}
                    className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Error banner */}
          {formError && (
            <div className="flex items-center justify-between rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
              <span>{formError}</span>
              <button type="button" onClick={() => setFormError(null)} className="ml-4 text-red-400 hover:text-red-600">✕</button>
            </div>
          )}

          {/* Ghi chú + Calculated + Submit */}
          <div className="flex flex-col gap-4 border-t border-gray-100 pt-4 lg:flex-row lg:items-end">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-gray-600">Ghi chú</label>
              <input
                type="text"
                value={form.ghiChu}
                onChange={e => handleChange('ghiChu', e.target.value)}
                onKeyDown={handleFormKeyDown}
                placeholder="Ghi chú thêm..."
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#14264b] focus:outline-none focus:ring-2 focus:ring-[#14264b]/10"
              />
            </div>

            <div className="flex gap-3">
              <div className="rounded-lg bg-gray-50 px-4 py-2.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-gray-400">Công VNĐ</p>
                <p className="text-sm font-bold text-gray-700">{calculated.tienCongVnd.toLocaleString('vi-VN')}</p>
              </div>
              <div className="rounded-lg bg-[#14264b]/5 px-4 py-2.5 text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-[#14264b]/60">Tổng VNĐ</p>
                <p className="text-sm font-bold text-[#14264b]">{calculated.tongTienVnd.toLocaleString('vi-VN')}</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleInsert}
              disabled={insertMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-[#14264b] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1e3a6e] disabled:opacity-50"
            >
              {insertMutation.isPending ? (
                <>
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                  Đang thêm...
                </>
              ) : 'Thêm item'}
            </button>
          </div>
        </div>
      </div>

      {/* Items table */}
      {rows.length > 0 && (
        <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
          <div className="border-b border-gray-100 px-6 py-3">
            <h4 className="text-sm font-semibold text-gray-700">Danh sách item đã thêm ({rows.length})</h4>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100 text-xs">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Website</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Username</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Tiền</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Quốc gia</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Link SP</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Hình</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Màu</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Size</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-500">SL</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Giá web</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Công%</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Sale%</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Phụ thu</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Ship US</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Tax</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Công VNĐ</th>
                  <th className="px-3 py-2.5 text-right font-semibold text-gray-500">Tổng VNĐ</th>
                  <th className="px-3 py-2.5 text-left font-semibold text-gray-500">Ghi chú</th>
                  <th className="px-3 py-2.5 text-center font-semibold text-gray-500">TT</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {rows.map(row => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">{row.websiteName || '-'}</td>
                    <td className="px-3 py-2 font-medium">{row.username}</td>
                    <td className="px-3 py-2">{row.loaiTien}</td>
                    <td className="px-3 py-2">{row.tenQuocGia || '-'}</td>
                    <td className="max-w-[120px] truncate px-3 py-2">
                      {row.linkWeb ? (
                        <a href={row.linkWeb} target="_blank" rel="noopener noreferrer" className="text-[#14264b] hover:underline">
                          {row.linkWeb}
                        </a>
                      ) : '-'}
                    </td>
                    <td className="px-3 py-2">
                      {row.linkHinh ? <img src={row.linkHinh} alt="product" className="h-7 w-auto rounded" /> : '-'}
                    </td>
                    <td className="px-3 py-2">{row.color || '-'}</td>
                    <td className="px-3 py-2">{row.size || '-'}</td>
                    <td className="px-3 py-2 text-right">{row.soLuong}</td>
                    <td className="px-3 py-2 text-right">{row.donGiaWeb.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{row.cong}</td>
                    <td className="px-3 py-2 text-right">{row.saleOff}</td>
                    <td className="px-3 py-2 text-right">{row.phuThu.toFixed(2)}</td>
                    <td className="px-3 py-2 text-right">{row.shipUsa}</td>
                    <td className="px-3 py-2 text-right">{row.tax}</td>
                    <td className="px-3 py-2 text-right">{row.tienCongVnd.toLocaleString('vi-VN')}</td>
                    <td className="px-3 py-2 text-right font-semibold text-[#14264b]">{row.tongTienVnd.toLocaleString('vi-VN')}</td>
                    <td className="max-w-[100px] truncate px-3 py-2">{row.ghiChu || '-'}</td>
                    <td className="px-3 py-2 text-center">
                      {row.status === 'pending' && (
                        <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-gray-200 border-t-[#14264b]" />
                      )}
                      {row.status === 'success' && <span className="font-bold text-green-600">✓</span>}
                      {row.status === 'error' && <span className="font-bold text-red-500">✗</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
