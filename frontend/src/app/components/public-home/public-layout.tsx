'use client';

import Link from 'next/link';
import { useState } from 'react';
import { FiChevronDown, FiMenu, FiX, FiTruck } from 'react-icons/fi';

/**
 * Public Layout Component
 *
 * Provides header and footer for public pages (home page).
 * Modern glass navbar design with #5cc6ee primary color.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  // Custom colors based on #5cc6ee
  const colors = {
    primary: '#5cc6ee',
    primaryHover: '#4ab3dc',
    primaryLight: '#e0f7ff',
    primaryDark: '#2a8fb3',
    text: '#1e293b',
    textMuted: '#64748b',
    bg: '#f8fafc',
  };

  const navItems = [
    { label: 'TRANG CHỦ', href: '/' },
    {
      label: 'ĐẶT HÀNG',
      dropdown: [
        { label: 'ĐẶT HÀNG', href: '/dat-hang' },
        { label: 'THÔNG TIN ĐẶT HÀNG', href: '/danh-sach-don-hang' },
      ],
    },
    {
      label: 'TRACKING',
      dropdown: [
        { label: 'QUẢN LÝ TRACKING', href: '/danh-sach-tracking' },
        { label: 'THÊM TRACKING', href: '/sua-tracking' },
      ],
    },
    { label: 'LÔ HÀNG', href: '/thong-tin-lo-hang' },
    {
      label: 'CÔNG NỢ',
      dropdown: [
        { label: 'BÁO CHUYỂN KHOẢN', href: '/chuyen-khoan' },
        { label: 'BẢNG CÂN ĐỐI CÔNG NỢ', href: '/bao-cao-cong-no' },
      ],
    },
    { label: 'HỎI ĐÁP', href: '/hoi-dap' },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.bg }}>
      {/* Header - Glass Navbar */}
      <header
        className="fixed top-4 left-4 right-4 z-50 rounded-2xl backdrop-blur-md shadow-lg overflow-visible"
        style={{ backgroundColor: 'rgba(255,255,255,0.85)', border: `1px solid ${colors.primaryLight}` }}
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 cursor-pointer group">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                style={{ backgroundColor: colors.primary }}
              >
                <FiTruck className="w-5 h-5 text-white" />
              </div>
              <span className="text-lg font-bold hidden sm:block" style={{ color: colors.text }}>
                Phúc Long Express
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              <ul className="flex items-center gap-1">
                {navItems.map((item) => (
                  <li key={item.label} className="relative">
                    {item.dropdown ? (
                      <div
                        className="relative h-full flex items-center"
                        onMouseEnter={() => setDropdownOpen(item.label)}
                        onMouseLeave={() => setDropdownOpen(null)}
                      >
                        <button
                          type="button"
                          className="flex items-center gap-1 px-4 py-2 text-sm font-bold transition-colors cursor-pointer rounded-lg hover:bg-gray-50 h-full"
                          style={{ color: colors.text }}
                          onClick={() => setDropdownOpen(dropdownOpen === item.label ? null : item.label)}
                        >
                          {item.label}
                          <FiChevronDown className={`w-3 h-3 transition-transform ${dropdownOpen === item.label ? 'rotate-180' : ''}`} />
                        </button>
                        {dropdownOpen === item.label && (
                          <ul
                            className="absolute left-0 top-full shadow-xl rounded-xl min-w-[200px] py-2 z-[9999]"
                            style={{ backgroundColor: 'white', border: `1px solid ${colors.primaryLight}` }}
                          >
                            {item.dropdown.map((sub) => (
                              <li key={sub.label}>
                                <Link
                                  href={sub.href}
                                  className="block px-4 py-2.5 text-sm transition-colors"
                                  style={{ color: colors.textMuted }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = colors.primaryLight;
                                    e.currentTarget.style.color = colors.primaryDark;
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                    e.currentTarget.style.color = colors.textMuted;
                                  }}
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
                        className="block px-4 py-2 text-sm font-bold transition-colors cursor-pointer rounded-lg hover:bg-gray-50"
                        style={{ color: colors.text }}
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
              className="hidden lg:flex items-center gap-2 px-4 py-2 text-white text-sm font-bold rounded-xl transition-all cursor-pointer hover:shadow-lg hover:shadow-cyan-500/30 hover:-translate-y-0.5"
              style={{ backgroundColor: colors.primary }}
            >
              Quản trị
            </Link>

            {/* Mobile menu button */}
            <button
              className="lg:hidden p-2 cursor-pointer rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: colors.text }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <FiX className="w-6 h-6" />
              ) : (
                <FiMenu className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t" style={{ borderColor: colors.primaryLight }}>
              <ul className="space-y-1">
                {navItems.map((item) => (
                  <li key={item.label}>
                    {item.dropdown ? (
                      <>
                        <div className="px-4 py-2 text-sm font-bold" style={{ color: colors.text }}>
                          {item.label}
                        </div>
                        <ul className="pl-4 space-y-1">
                          {item.dropdown.map((sub) => (
                            <li key={sub.label}>
                              <Link
                                href={sub.href}
                                className="block px-4 py-2 text-sm rounded-lg transition-colors"
                                style={{ color: colors.textMuted }}
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
                        className="block px-4 py-2 text-sm font-bold rounded-lg transition-colors"
                        style={{ color: colors.text }}
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
                  className="flex items-center justify-center px-4 py-2.5 text-white text-sm font-bold rounded-xl"
                  style={{ backgroundColor: colors.primary }}
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
      <main className="flex-1 pt-20">{children}</main>

      {/* Footer - Modern */}
      <footer
        className="text-white py-12"
        style={{ background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 100%)` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-center gap-8">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}
            >
              <FiTruck className="w-8 h-8 text-white" />
            </div>
            <address className="text-center md:text-left not-italic">
              <p className="opacity-90">
                <span className="opacity-70">Hotline:</span>{' '}
                <a href="tel:+840962904490" className="text-white hover:opacity-80 transition-opacity">
                  (+84) 962.904.490
                </a>
              </p>
              <p className="mt-1 opacity-90">
                <span className="opacity-70">Email:</span>{' '}
                <a href="mailto:cskh.plelogistics@gmail.com" className="text-white hover:opacity-80 transition-opacity">
                  cskh.plelogistics@gmail.com
                </a>
              </p>
            </address>
          </div>
          <div className="mt-8 pt-8 border-t border-white/20 text-center text-sm opacity-60">
            © {new Date().getFullYear()} Phúc Long Express. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}