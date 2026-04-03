'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-context';
import {
  FiShoppingCart,
  FiDollarSign,
  FiTruck,
  FiLogOut,
  FiBell,
  FiSearch,
  FiMenu,
  FiX,
} from 'react-icons/fi';

/**
 * Admin Layout Component
 *
 * Provides the main layout for admin pages with sidebar navigation and header.
 * Uses localStorage-based authentication (no NextAuth).
 * Color theme: #5cc6ee (primary cyan)
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  // Navigation items with submenus
  const navItems: {
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    submenu: { href: string; label: string; type?: string }[];
  }[] = [
    {
      label: 'MUA HÀNG GIÚP',
      icon: FiShoppingCart,
      submenu: [
        { href: '/admin/orders/list', label: 'Mua hàng' },
        { href: '/admin/order-management-list', label: 'Nhận đơn hàng' },
      ],
    },
    {
      label: 'FINANCE',
      icon: FiDollarSign,
      submenu: [
        { href: '/admin/debt-management', label: 'QL công nợ' },
        { href: '/admin/customer-limits', label: 'Hạn mức khách hàng' },
        { href: '', label: '────────Báo cáo────────', type: 'divider' },
        { href: '/admin/debt-reports/reconciliation', label: 'Báo cáo chi tiết công nợ' },
        { href: '/admin/debt-reports/by-period', label: 'Báo cáo công nợ theo kỳ' },
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
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-full w-64 transform bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transition-transform duration-300 ease-out lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white lg:hidden"
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="flex h-16 items-center justify-center border-b border-slate-700/50 bg-slate-900/30">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#5cc6ee] to-cyan-400">
              <FiTruck className="h-5 w-5 text-slate-900" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold text-white tracking-wide">PHUC LONG</span>
              <span className="text-[10px] font-medium text-[#5cc6ee] tracking-widest uppercase">Express</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="mt-4 px-3 pb-4 space-y-1 overflow-y-auto max-h-[calc(100vh-8rem)]">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.submenu?.[0]?.href || item.label);
            const isOpen = openSubmenu === item.label;
            const IconComponent = item.icon;
            return (
              <div key={item.label}>
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#5cc6ee]/20 to-transparent text-[#5cc6ee] border-l-2 border-[#5cc6ee]'
                      : 'text-slate-300 hover:bg-slate-700/50 hover:text-white border-l-2 border-transparent'
                  }`}
                >
                  <IconComponent className="mr-3 h-5 w-5 flex-shrink-0" />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.submenu && (
                    <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>
                {/* Submenu */}
                {item.submenu && isOpen && (
                  <div className="mt-1 ml-3 space-y-0.5 border-l border-slate-700 pl-3">
                    {item.submenu.map((subItem, idx) =>
                      subItem.type === 'divider' || !subItem.href ? (
                        <div key={idx} className="py-2 text-[10px] font-bold text-slate-500 tracking-wider uppercase">
                          {subItem.label}
                        </div>
                      ) : (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                            pathname === subItem.href
                              ? 'bg-[#5cc6ee]/15 text-[#5cc6ee] font-medium'
                              : 'text-slate-400 hover:bg-slate-700/40 hover:text-white'
                          }`}
                          onClick={() => setSidebarOpen(false)}
                        >
                          <span className="h-1.5 w-1.5 rounded-full mr-2 bg-current opacity-50" />
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

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700/50 bg-slate-900/30 p-3">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span>Hệ thống hoạt động</span>
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className="lg:ml-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 lg:px-6 shadow-sm">
          {/* Mobile menu button */}
          <button
            className="rounded-xl p-2 text-slate-600 hover:bg-slate-100 hover:text-[#5cc6ee] transition-colors lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu className="h-6 w-6" />
          </button>

          {/* Search bar */}
          <div className="hidden flex-1 md:block md:max-w-lg">
            <div className="relative group">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng, khách hàng..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm focus:border-[#5cc6ee] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#5cc6ee]/20 transition-all placeholder:text-slate-400"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#5cc6ee] transition-colors" />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-[#5cc6ee] transition-colors cursor-pointer">
              <FiBell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#5cc6ee] to-cyan-400 text-white font-bold shadow-lg shadow-cyan-500/30">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </div>
              <div className="hidden md:block">
                <p className="text-sm font-medium text-slate-700">
                  {user?.username || 'User'}
                </p>
                <p className="text-xs text-slate-500 truncate max-w-[120px]">
                  {user?.email || ''}
                </p>
              </div>
            </div>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="rounded-xl p-2.5 text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors cursor-pointer"
              title="Đăng xuất"
            >
              <FiLogOut className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
