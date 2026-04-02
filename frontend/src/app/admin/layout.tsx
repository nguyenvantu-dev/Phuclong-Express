'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-context';

/**
 * Admin Layout Component
 *
 * Provides the main layout for admin pages with sidebar navigation and header.
 * Uses localStorage-based authentication (no NextAuth).
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Navigation items with submenus
  const navItems: {
    label: string;
    icon: string;
    submenu: { href?: string; label: string; type?: string }[];
  }[] = [
    {
      label: 'MUA HÀNG GIÚP',
      icon: '🛒',
      submenu: [
        { href: '/admin/orders/list', label: 'Mua hàng' },
        { href: '/admin/order-management-list', label: 'Nhận đơn hàng' },
        // { href: '/admin/orders/deleted', label: 'Các đơn hàng đã xóa' },
      ],
    },
    {
      label: 'FINANCE',
      icon: '💰',
      submenu: [
        { href: '/admin/debt-management', label: 'QL công nợ' },
        { href: '/admin/customer-limits', label: 'Hạn mức khách hàng' },
        { href: '', label: '------------Báo cáo------------', type: 'divider' },
        { href: '/admin/debt-reports/reconciliation', label: 'Báo cáo chi tiết công nợ' },
        { href: '/admin/debt-reports/by-period', label: 'Báo cáo chi tiết công nợ theo kỳ' },
        { href: '/admin/debt-reports/total-revenue', label: 'Báo cáo tổng doanh thu' },
        { href: '/admin/debt-reports/debt-by-user', label: 'Báo cáo tổng công nợ theo user' },
        { href: '/admin/debt-reports/shipping-slip', label: 'Báo cáo kiểm tra đơn hàng mua' },
        { href: '/admin/debt-reports/customer', label: 'Báo cáo công nợ khách hàng' },
        { href: '/admin/debt-reports/by-lot', label: 'Báo cáo công nợ theo đợt hàng' },
      ],
    },
  ];

  // Track which submenu is open
  const [openSubmenu, setOpenSubmenu] = useState<string | null>(null);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenu(openSubmenu === label ? null : label);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-gradient-to-b from-slate-900 to-slate-800 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-slate-700 bg-slate-900/50">
          <h1 className="text-lg font-bold text-white tracking-wide">PHUC LONG EXPRESS</h1>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.submenu?.[0]?.href || item.label);
            const isOpen = openSubmenu === item.label;
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`flex w-full items-center rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.submenu && (
                    <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  )}
                </button>
                {/* Submenu */}
                {item.submenu && isOpen && (
                  <div className="mt-1 ml-2 space-y-1 border-l-2 border-slate-700 pl-3">
                    {item.submenu.map((subItem, idx) =>
                      subItem.type === 'divider' || !subItem.href ? (
                        <div key={idx} className="py-2 text-xs font-medium text-blue-400 tracking-wider">
                          {subItem.label}
                        </div>
                      ) : (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`block rounded-lg px-4 py-2.5 text-sm transition-all duration-150 ${
                            pathname === subItem.href
                              ? 'bg-blue-600/20 text-blue-400 font-medium'
                              : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          {subItem.label}
                        </Link>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </aside>

      {/* Main content area */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-gray-200 bg-white/80 backdrop-blur-md px-4 lg:px-8">
          {/* Mobile menu button */}
          <button
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Search bar (placeholder) */}
          <div className="hidden flex-1 md:block md:max-w-md">
            <div className="relative">
              <input
                type="text"
                placeholder="Tìm kiếm..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          {/* User menu */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 transition-colors">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
            </button>

            {/* User dropdown */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-white font-semibold shadow-lg shadow-blue-500/30">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-700">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.email || ''}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
