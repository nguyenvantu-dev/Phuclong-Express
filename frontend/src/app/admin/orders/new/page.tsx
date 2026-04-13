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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const usernameDropdownRef = useRef<HTMLTableCellElement>(null);
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
      if (usernameDropdownRef.current && !usernameDropdownRef.current.contains(event.target as Node)) {
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
    mutationFn: async (row: Omit<GridRow, 'id'>) => {
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
        quocGiaId: row.quocGiaId || undefined,
        shipUsa: row.shipUsa,
        tax: row.tax,
        phuThu: row.phuThu,
        cong: row.cong,
      });
    },
    onSuccess: () => {
      alert('Thêm đơn hàng thành công');
      setRows([]);
    },
    onError: (err: any) => {
      alert(`Lỗi: ${err?.message || 'Thêm đơn hàng thất bại'}`);
    },
  });

  // Handle form field changes
  const handleChange = (field: keyof FormData, value: any) => {
    setForm(prev => {
      const updated = { ...prev, [field]: value };

      // When currency changes, update tyGia value
      if (field === 'loaiTien') {
        const rate = exchangeRates.find((r: any) => r.Name === value);
        updated.loaiTienValue = rate?.TyGiaVND || 1;
      }

      // When form values change, recalculate
      if (['donGiaWeb', 'soLuong', 'saleOff', 'cong', 'tyGia'].includes(field)) {
        const donGiaWeb = parseFloat(field === 'donGiaWeb' ? value : prev.donGiaWeb) || 0;
        const soLuong = parseInt(field === 'soLuong' ? value : prev.soLuong) || 1;
        const saleOff = parseFloat(field === 'saleOff' ? value : prev.saleOff) || 0;
        const cong = parseFloat(field === 'cong' ? value : prev.cong) || 0;
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
      alert('Upload ảnh thất bại');
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

  // Handle insert button
  const handleInsert = () => {
    // Validate required fields
    if (!form.linkWeb.trim()) {
      alert('Phải nhập Link SP');
      return;
    }
    if (!form.soLuong || parseInt(form.soLuong) < 1) {
      alert('Số lượng phải >= 1');
      return;
    }
    if (!form.username) {
      alert('Phải chọn Username');
      return;
    }

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
    };

    setRows(prev => [...prev, newRow]);
    insertMutation.mutate(newRow);
  };

  const filteredUsernames = (usernames as { username: string }[])
    .filter((u) => u.username.toLowerCase().includes(usernameInput.trim().toLowerCase()))
    .slice(0, 50);

  return (
    <div className="space-y-4 p-4">
      {/* Tab navigation */}
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <Link
          href="/admin/order-management-list"
          className="rounded px-3 py-1 text-sm text-[#14264b] hover:bg-[#14264b]/5"
        >
          Quản lý Item
        </Link>
        <span className="rounded bg-gray-600 px-3 py-1 text-sm text-white">
          Tạo mới item
        </span>
        <Link
          href="/admin/orders/import"
          className="rounded px-3 py-1 text-sm text-[#14264b] hover:bg-[#14264b]/5"
        >
          Thêm mới item bằng excel
        </Link>
      </div>

      <h3 className="text-lg font-bold text-gray-900">TẠO MỚI ITEM</h3>

      {/* Grid table with footer form */}
      <div className="overflow-x-auto rounded-lg bg-white shadow">
        <table className="min-w-full divide-y divide-gray-200 text-xs">
          <thead className="bg-gray-100">
            <tr>
              <th className="px-2 py-2 text-left"></th>
              <th className="px-2 py-2 text-left">Website</th>
              <th className="px-2 py-2 text-left">Username</th>
              <th className="px-2 py-2 text-left">Loại tiền</th>
              <th className="px-2 py-2 text-left">Quốc gia</th>
              <th className="px-2 py-2 text-left">Link SP</th>
              <th className="px-2 py-2 text-left">Hình</th>
              <th className="px-2 py-2 text-left">Màu</th>
              <th className="px-2 py-2 text-left">Size</th>
              <th className="px-2 py-2 text-right">Số lượng</th>
              <th className="px-2 py-2 text-right">Giá web</th>
              <th className="px-2 py-2 text-right">% Công</th>
              <th className="px-2 py-2 text-right">% sale off</th>
              <th className="px-2 py-2 text-right">$Phụ thu</th>
              <th className="px-2 py-2 text-right">$ShipUS</th>
              <th className="px-2 py-2 text-right">Tax</th>
              <th className="px-2 py-2 text-right">Công VNĐ</th>
              <th className="px-2 py-2 text-right">Tổng VNĐ</th>
              <th className="px-2 py-2 text-left">Ghi chú</th>
              <th className="px-2 py-2 text-left"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {rows.map(row => (
              <tr key={row.id} className="hover:bg-gray-50">
                <td className="px-2 py-1"></td>
                <td className="px-2 py-1">{row.websiteName || '-'}</td>
                <td className="px-2 py-1">{row.username}</td>
                <td className="px-2 py-1">{row.loaiTien}</td>
                <td className="px-2 py-1">{row.tenQuocGia || '-'}</td>
                <td className="px-2 py-1 max-w-[120px] truncate">
                  {row.linkWeb ? (
                    <a href={row.linkWeb} target="_blank" rel="noopener noreferrer" className="text-[#14264b] hover:text-[#14264b]">
                      {row.linkWeb}
                    </a>
                  ) : '-'}
                </td>
                <td className="px-2 py-1">
                  {row.linkHinh ? (
                    <img src={row.linkHinh} alt="product" className="h-[30px] w-auto" />
                  ) : '-'}
                </td>
                <td className="px-2 py-1">{row.color || '-'}</td>
                <td className="px-2 py-1">{row.size || '-'}</td>
                <td className="px-2 py-1 text-right">{row.soLuong}</td>
                <td className="px-2 py-1 text-right">{row.donGiaWeb.toFixed(2)}</td>
                <td className="px-2 py-1 text-right">{row.cong}</td>
                <td className="px-2 py-1 text-right">{row.saleOff}</td>
                <td className="px-2 py-1 text-right">{row.phuThu.toFixed(2)}</td>
                <td className="px-2 py-1 text-right">{row.shipUsa}</td>
                <td className="px-2 py-1 text-right">{row.tax}</td>
                <td className="px-2 py-1 text-right">{row.tienCongVnd.toLocaleString('vi-VN')}</td>
                <td className="px-2 py-1 text-right font-medium">{row.tongTienVnd.toLocaleString('vi-VN')}</td>
                <td className="px-2 py-1 max-w-[100px] truncate">{row.ghiChu || '-'}</td>
                <td className="px-2 py-1"></td>
              </tr>
            ))}

            {/* Footer row with form inputs */}
            <tr className="bg-gray-50">
              {/* Clone button */}
              <td className="px-2 py-1">
                {rows.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClone}
                    className="text-xs text-[#14264b] hover:text-[#14264b] hover:underline"
                  >
                    clone
                  </button>
                )}
              </td>

              {/* Website dropdown */}
              <td className="px-2 py-1">
                <select
                  value={form.websiteName}
                  onChange={e => handleChange('websiteName', e.target.value)}
                  className="w-full min-w-[80px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                >
                  <option value="">--Web khac--</option>
                  {(websites as string[]).map((w, idx) => (
                    <option key={`${w}-${idx}`} value={w}>{w}</option>
                  ))}
                </select>
              </td>

              {/* Username searchable select */}
              <td ref={usernameDropdownRef} className="relative px-2 py-1">
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
                  placeholder="Nhập Username"
                  autoComplete="off"
                  className="w-full min-w-[100px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
                {showUsernameDropdown && (
                  <div
                    className="fixed z-50 max-h-64 overflow-auto rounded-lg border border-gray-300 bg-white py-1 text-xs shadow-lg"
                    style={usernameDropdownStyle}
                  >
                    <button
                      type="button"
                      onClick={() => handleUsernameSelect('')}
                      className="block w-full px-3 py-2 text-left text-gray-700 hover:bg-[#14264b]/5 hover:text-[#14264b]"
                    >
                      --Temporary user--
                    </button>
                    {filteredUsernames.map((u, index) => (
                      <button
                        key={u.username}
                        type="button"
                        onClick={() => handleUsernameSelect(u.username)}
                        onMouseEnter={() => setActiveUsernameIndex(index)}
                        className={`block w-full px-3 py-2 text-left font-medium hover:bg-[#14264b]/5 hover:text-[#14264b] ${
                          index === activeUsernameIndex
                            ? 'bg-[#14264b]/5 text-[#14264b]'
                            : 'text-gray-900'
                        }`}
                      >
                        {u.username}
                      </button>
                    ))}
                    {filteredUsernames.length === 0 && (
                      <div className="px-3 py-2 text-gray-500">Không có username phù hợp</div>
                    )}
                  </div>
                )}
              </td>

              {/* Currency dropdown */}
              <td className="px-2 py-1">
                <select
                  value={form.loaiTien}
                  onChange={e => handleChange('loaiTien', e.target.value)}
                  className="w-full rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                >
                  {(exchangeRates as { Name: string; TyGiaVND: number }[]).map(r => (
                    <option key={r.Name} value={r.Name}>{r.Name}</option>
                  ))}
                </select>
              </td>

              {/* Country dropdown */}
              <td className="px-2 py-1">
                <select
                  value={form.quocGiaId ?? ''}
                  onChange={e => handleChange('quocGiaId', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                >
                  <option value="">--Chọn--</option>
                  {(countries as { QuocGiaID: number; TenQuocGia: string }[]).map(c => (
                    <option key={c.QuocGiaID} value={c.QuocGiaID}>{c.TenQuocGia}</option>
                  ))}
                </select>
              </td>

              {/* Link Web */}
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={form.linkWeb}
                  onChange={e => handleChange('linkWeb', e.target.value)}
                  className="w-full min-w-[120px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
              </td>

              {/* Hình + Upload */}
              <td className="px-2 py-1 text-center">
                <input
                  type="text"
                  value={form.linkHinh}
                  onChange={e => handleChange('linkHinh', e.target.value)}
                  placeholder="link hình"
                  className="mb-1 w-full rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
                <span className="text-xs text-gray-500">Hoặc: </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="text-xs"
                />
                {imagePreview && (
                  <div className="mt-1">
                    <img src={imagePreview} alt="preview" className="h-[30px] w-auto" />
                    <button
                      type="button"
                      onClick={handleUploadImage}
                      disabled={isUploading}
                      className="mt-1 rounded bg-[#14264b] px-2 py-0.5 text-xs text-white hover:bg-[#1e3a6e] disabled:opacity-50"
                    >
                      {isUploading ? 'Đang upload...' : 'Upload'}
                    </button>
                  </div>
                )}
              </td>

              {/* Color */}
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={form.color}
                  onChange={e => handleChange('color', e.target.value)}
                  className="w-[50px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
              </td>

              {/* Size */}
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={form.size}
                  onChange={e => handleChange('size', e.target.value)}
                  className="w-[50px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
              </td>

              {/* Số lượng */}
              <td className="px-2 py-1">
                <input
                  type="number"
                  value={form.soLuong}
                  onChange={e => handleChange('soLuong', e.target.value)}
                  className="w-[50px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                  min="1"
                />
              </td>

              {/* Giá web */}
              <td className="px-2 py-1">
                <input
                  type="number"
                  step="0.01"
                  value={form.donGiaWeb}
                  onChange={e => handleChange('donGiaWeb', e.target.value)}
                  className="w-[60px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
              </td>

              {/* % Công */}
              <td className="px-2 py-1">
                <input
                  type="number"
                  step="0.01"
                  value={form.cong}
                  onChange={e => handleChange('cong', e.target.value)}
                  className="w-[50px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
              </td>

              {/* % sale off */}
              <td className="px-2 py-1">
                <input
                  type="number"
                  step="0.01"
                  value={form.saleOff}
                  onChange={e => handleChange('saleOff', e.target.value)}
                  className="w-[50px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
              </td>

              {/* $Phụ thu */}
              <td className="px-2 py-1">
                <input
                  type="number"
                  step="0.01"
                  value={form.phuThu}
                  onChange={e => handleChange('phuThu', e.target.value)}
                  className="w-[50px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
              </td>

              {/* $ShipUS */}
              <td className="px-2 py-1">
                <input
                  type="number"
                  step="0.01"
                  value={form.shipUsa}
                  onChange={e => handleChange('shipUsa', e.target.value)}
                  className="w-[50px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
              </td>

              {/* Tax */}
              <td className="px-2 py-1">
                <input
                  type="number"
                  step="0.01"
                  value={form.tax}
                  onChange={e => handleChange('tax', e.target.value)}
                  className="w-[50px] rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
              </td>

              {/* Công VNĐ (calculated) */}
              <td className="px-2 py-1 text-right text-xs">
                {calculated.tienCongVnd.toLocaleString('vi-VN')}
              </td>

              {/* Tổng VNĐ (calculated) */}
              <td className="px-2 py-1 text-right text-xs font-medium">
                {calculated.tongTienVnd.toLocaleString('vi-VN')}
              </td>

              {/* Ghi chú */}
              <td className="px-2 py-1">
                <input
                  type="text"
                  value={form.ghiChu}
                  onChange={e => handleChange('ghiChu', e.target.value)}
                  className="w-full rounded border border-gray-300 px-1 py-1 text-xs focus:border-[#14264b] focus:outline-none"
                />
              </td>

              {/* Insert button */}
              <td className="px-2 py-1">
                <button
                  type="button"
                  onClick={handleInsert}
                  disabled={insertMutation.isPending}
                  className="rounded bg-[#14264b] px-3 py-1 text-xs font-medium text-white hover:bg-[#1e3a6e] disabled:opacity-50"
                >
                  {insertMutation.isPending ? '...' : 'Thêm'}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {rows.length === 0 && (
        <p className="text-center text-sm text-gray-500">Chưa có item nào. Nhập thông tin bên dưới và bấm "Thêm".</p>
      )}
    </div>
  );
}
