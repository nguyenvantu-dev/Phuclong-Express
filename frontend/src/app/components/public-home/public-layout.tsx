'use client';

import Link from 'next/link';
import { useState } from 'react';

/**
 * Public Layout Component
 *
 * Provides header and footer for public pages (home page).
 * This is used instead of the admin layout for public-facing pages.
 * Menu structure matches the original Site.Master
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  const navItems = [
    { label: 'TRANG CHỦ', href: '/' },
    {
      label: 'ĐẶT HÀNG',
      dropdown: [
        { label: 'ĐẶT HÀNG', href: '/UF/DatHangM.aspx' },
        { label: 'THÔNG TIN ĐẶT HÀNG', href: '/UF/DanhSachDonHang.aspx' },
      ],
    },
    {
      label: 'TRACKING',
      dropdown: [
        { label: 'QUẢN LÝ TRACKING', href: '/UF/DanhSachTracking.aspx' },
        { label: 'THÊM TRACKING', href: '/UF/SuaTracking.aspx' },
      ],
    },
    { label: 'LÔ HÀNG', href: '/UF/ThongTinLoHang.aspx' },
    {
      label: 'CÔNG NỢ',
      dropdown: [
        { label: 'BÁO CHUYỂN KHOẢN', href: '/UF/ChuyenKhoan.aspx' },
        { label: 'BẢNG CÂN ĐỐI CÔNG NỢ', href: '/UF/BaoCao_CanDoiCongNo_User.aspx' },
      ],
    },
    { label: 'HỎI ĐÁP', href: '/UF/HoiDap.aspx' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header with Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#5cc6ee] shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-bold text-white">Phúc Long Express</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              <ul className="flex items-center">
                {navItems.map((item) => (
                  <li key={item.label} className="relative">
                    {item.dropdown ? (
                      <div
                        className="relative"
                        onMouseEnter={() => setDropdownOpen(item.label)}
                        onMouseLeave={() => setDropdownOpen(null)}
                      >
                        <button className="flex items-center gap-1 px-4 py-6 text-sm font-bold text-white hover:text-gray-100 transition-colors">
                          {item.label}
                          <span className="text-xs">▼</span>
                        </button>
                        {dropdownOpen === item.label && (
                          <ul className="absolute left-0 top-full bg-white shadow-lg min-w-[200px] py-2">
                            {item.dropdown.map((sub) => (
                              <li key={sub.label}>
                                <Link
                                  href={sub.href}
                                  className="block px-4 py-2 text-sm text-[#5cc6ee] hover:bg-gray-100"
                                >
                                  {sub.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    ) : (
                      <Link
                        href={item.href}
                        className="block px-4 py-6 text-sm font-bold text-white hover:text-gray-100 transition-colors"
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </nav>

            {/* Admin Link */}
            <Link
              href="/admin"
              className="hidden lg:block px-4 py-2 bg-white text-[#5cc6ee] text-sm font-bold rounded hover:bg-gray-100 transition-colors"
            >
              Quản trị
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-white/20">
              <ul>
                {navItems.map((item) => (
                  <li key={item.label} className="border-b border-white/10">
                    {item.dropdown ? (
                      <>
                        <div className="px-4 py-3 text-sm font-bold text-white">{item.label}</div>
                        <ul className="bg-white/10">
                          {item.dropdown.map((sub) => (
                            <li key={sub.label}>
                              <Link
                                href={sub.href}
                                className="block px-8 py-2 text-sm text-white hover:bg-white/10"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                {sub.label}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </>
                    ) : (
                      <Link
                        href={item.href}
                        className="block px-4 py-3 text-sm font-bold text-white hover:bg-white/10"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <div className="mt-4 px-4">
                <Link
                  href="/admin"
                  className="block text-center px-4 py-2 bg-white text-[#5cc6ee] text-sm font-bold rounded"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Quản trị
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 pt-16">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <img src="/image1/logo3.png" alt="Phuc Long Express" className="h-16" />
            <address className="text-center md:text-left not-italic">
              <p>
                Gọi cho chúng tôi: <a href="tel:+840962904490" className="text-[#5cc6ee] hover:underline">(+84) 962.904.490</a>
                {' '}hoặc qua E-mail: <a href="mailto:cskh.plelogistics@gmail.com" className="text-[#5cc6ee] hover:underline">cskh.plelogistics@gmail.com</a>
              </p>
            </address>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Phúc Long Express. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}