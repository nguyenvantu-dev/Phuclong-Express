'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-context';
import {
  FiShoppingCart,
  FiDollarSign,
  FiLogOut,
  FiBell,
  FiSearch,
  FiMenu,
  FiX,
  FiInfo,
  FiTruck,
  FiUsers,
  FiSettings,
} from 'react-icons/fi';

/**
 * Admin Layout Component
 *
 * Provides the main layout for admin pages with sidebar navigation and header.
 * Uses localStorage-based authentication (no NextAuth).
 * Color theme: #14264b (primary cyan)
 */
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    setSidebarCollapsed(window.localStorage.getItem('admin-sidebar-collapsed') === 'true');
  }, []);
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
        { href: '/admin/orders/deleted', label: 'Các đơn hàng đã xóa' },
      ],
    },
    {
      label: 'VẬN CHUYỂN',
      icon: FiTruck,
      submenu: [
        { href: '/admin/tracking', label: 'Quản lý tracking' },
        { href: '/admin/batches', label: 'Quản lý lô hàng' },
        { href: '/admin/debt-reports/profit-loss-by-lot', label: 'BC phân tích lãi lỗ theo lô hàng' },
        { href: '/admin/debt-reports/by-lot', label: 'BC công nợ khách hàng theo lô' },
      ],
    },
    {
      label: 'FINANCE',
      icon: FiDollarSign,
      submenu: [
        { href: '/admin/debt-management', label: 'QL công nợ' },
        { href: '/admin/customer-limits', label: 'Hạn mức khách hàng' },
        { href: '', label: '────────Báo cáo────────', type: 'divider' },
        { href: '/admin/debt-reports', label: 'Báo cáo chi tiết công nợ' },
        { href: '/admin/debt-reports/by-period', label: 'Báo cáo chi tiết công nợ theo kỳ' },
        { href: '/admin/debt-reports/total-revenue', label: 'Báo cáo tổng doanh thu' },
        { href: '/admin/debt-reports/debt-by-user', label: 'Báo cáo tổng công nợ theo user' },
        { href: '/admin/debt-reports/reconciliation', label: 'Báo cáo kiểm tra đơn hàng mua' },
        { href: '/admin/debt-reports/customer', label: 'Báo cáo công nợ khách hàng' },
        { href: '/admin/debt-reports/by-shipment-lot', label: 'Báo cáo công nợ theo đợt hàng' },
      ],
    },
    {
      label: 'TÀI KHOẢN',
      icon: FiUsers,
      submenu: [
        { href: '/admin/roles', label: 'Role' },
        { href: '/admin/users', label: 'User' },
        { href: '/admin/clear-user-data', label: 'Xóa dữ liệu theo user' },
      ],
    },
    {
      label: 'DANH MỤC & CẤU HÌNH',
      icon: FiSettings,
      submenu: [
        { href: '/admin/periods', label: 'Danh mục kỳ' },
        { href: '/admin/exchange-rates', label: 'Tỷ giá' },
        { href: '/admin/websites', label: 'Danh sách website' },
        { href: '/admin/bank-accounts', label: 'Tài khoản ngân hàng' },
        { href: '/admin/service-fees', label: 'Công mua hàng' },
        { href: '/admin/delivery-addresses', label: 'Địa chỉ nhận hàng' },
        { href: '/admin/system-logs', label: 'Báo cáo hoạt động hệ thống' },
      ],
    },
    {
      label: 'THÔNG TIN',
      icon: FiInfo,
      submenu: [
        { href: '/', label: 'Trang chủ' },
        { href: '/admin/info', label: 'Thông tin' },
        { href: '/admin/qna', label: 'Thắc mắc' },
        { href: '/admin/websites', label: 'Cập nhật các trang web hay' },
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

  const toggleSidebarCollapsed = () => {
    setSidebarCollapsed((prevState) => {
      const nextState = !prevState;
      window.localStorage.setItem('admin-sidebar-collapsed', String(nextState));
      return nextState;
    });
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
        className={`fixed left-0 top-0 z-50 h-full transform bg-gradient-to-b from-[#14264b] via-[#1a3060] to-[#14264b] shadow-2xl transition-all duration-300 ease-out lg:translate-x-0 ${
          sidebarCollapsed ? 'lg:w-20' : 'lg:w-64'
        } ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } ${sidebarCollapsed ? 'lg:overflow-visible' : 'overflow-hidden'}`}
      >
        {/* Close button for mobile */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 hover:bg-slate-700 hover:text-white lg:hidden"
        >
          <FiX className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="relative flex h-16 items-center justify-center border-b border-white/10 bg-black/20 px-3">
          <Link href="/admin" className="inline-flex items-center justify-center" onClick={() => setSidebarOpen(false)}>
            <Image
              src={sidebarCollapsed ? '/image1/LOGO_ONLY_PHUC_LONG_EXPRESS_WHITE.png' : '/image1/LOGO_PHUC_LONG_EXPRESS_FULL_WHITE.png'}
              alt="Phuc Long Express"
              width={160}
              height={48}
              className="h-12 object-contain transition-all duration-300"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav
          className={`mt-4 px-3 pb-4 space-y-1 max-h-[calc(100vh-8rem)] ${
            sidebarCollapsed ? 'overflow-visible' : 'overflow-y-auto'
          }`}
        >
          {(() => {
            // Find the longest matching href across all sections to resolve prefix conflicts
            // e.g. /admin/debt-reports/by-shipment-lot should only activate VẬN CHUYỂN, not FINANCE
            let longestMatch = '';
            let activeLabel = '';
            for (const item of navItems) {
              for (const sub of item.submenu ?? []) {
                if (sub.href && sub.href !== '/' && (pathname === sub.href || pathname.startsWith(sub.href + '/')) && sub.href.length > longestMatch.length) {
                  longestMatch = sub.href;
                  activeLabel = item.label;
                }
              }
            }
            return navItems.map((item) => {
            const isActive = item.label === activeLabel;
            const isOpen = openSubmenu === item.label;
            const IconComponent = item.icon;
            return (
              <div key={item.label} className="relative group/item">
                <button
                  onClick={() => toggleSubmenu(item.label)}
                  className={`group flex w-full items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-[#eb7325]/20 to-transparent text-[#eb7325] border-l-2 border-[#eb7325]'
                      : 'text-white/70 hover:bg-white/10 hover:text-white border-l-2 border-transparent'
                  } ${sidebarCollapsed ? 'justify-center lg:px-2' : ''}`}
                  title={sidebarCollapsed ? item.label : undefined}
                >
                  <IconComponent className={`h-5 w-5 flex-shrink-0 ${sidebarCollapsed ? '' : 'mr-3'}`} />
                  {!sidebarCollapsed && <span className="flex-1 text-left truncate">{item.label}</span>}
                  {item.submenu && !sidebarCollapsed && (
                    <span className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  )}
                </button>
                {/* Submenu */}
                {item.submenu && isOpen && !sidebarCollapsed && (
                  <div className="mt-1 ml-3 space-y-0.5 border-l border-white/15 pl-3">
                    {item.submenu.map((subItem, idx) =>
                      subItem.type === 'divider' || !subItem.href ? (
                        <div key={idx} className="py-2 text-[10px] font-bold text-white/30 tracking-wider uppercase">
                          {subItem.label}
                        </div>
                      ) : (
                        <Link
                          key={subItem.href}
                          href={subItem.href}
                          className={`flex items-center rounded-lg px-3 py-2 text-sm transition-all duration-150 ${
                            pathname === subItem.href
                              ? 'bg-[#eb7325]/15 text-[#eb7325] font-medium'
                              : 'text-white/55 hover:bg-white/10 hover:text-white'
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
                {item.submenu && sidebarCollapsed && (
                  <div className="pointer-events-none absolute left-full top-0 z-20 hidden w-[19rem] pr-3 opacity-0 transition-all duration-200 group-hover/item:pointer-events-auto group-hover/item:opacity-100 lg:block">
                    <div className="ml-3 rounded-2xl border border-white/10 bg-[#14264b]/98 p-3 shadow-2xl">
                      <div className="mb-2 px-2 text-xs font-bold uppercase tracking-[0.24em] text-[#eb7325]">
                        {item.label}
                      </div>
                      <div className="space-y-1">
                        {item.submenu.map((subItem, idx) =>
                          subItem.type === 'divider' || !subItem.href ? (
                            <div key={idx} className="px-2 py-2 text-[10px] font-bold uppercase tracking-wider text-white/30">
                              {subItem.label}
                            </div>
                          ) : (
                            <Link
                              key={subItem.href}
                              href={subItem.href}
                              className={`flex items-center rounded-xl px-3 py-2 text-sm transition-all duration-150 ${
                                pathname === subItem.href
                                  ? 'bg-[#eb7325]/15 text-[#eb7325] font-medium'
                                  : 'text-white/65 hover:bg-white/10 hover:text-white'
                              }`}
                              onClick={() => setSidebarOpen(false)}
                            >
                              <span className="mr-2 h-1.5 w-1.5 rounded-full bg-current opacity-50" />
                              {subItem.label}
                            </Link>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          });
          })()}
        </nav>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/20 p-3">
          <div className={`flex items-center text-xs text-slate-400 ${sidebarCollapsed ? 'justify-center' : 'gap-2'}`}>
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            {!sidebarCollapsed && <span>Hệ thống hoạt động</span>}
          </div>
        </div>
      </aside>

      {/* Main content area */}
      <div className={`transition-all duration-300 ${sidebarCollapsed ? 'lg:ml-20' : 'lg:ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 lg:px-6 shadow-sm">
          <div className="flex items-center gap-2">
            {/* Mobile menu button */}
            <button
              className="rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#14264b] lg:hidden"
              onClick={() => setSidebarOpen(true)}
            >
              <FiMenu className="h-6 w-6" />
            </button>
            <button
              className="hidden rounded-xl p-2 text-slate-600 transition-colors hover:bg-slate-100 hover:text-[#14264b] lg:inline-flex"
              onClick={toggleSidebarCollapsed}
              title={sidebarCollapsed ? 'Mở rộng menu' : 'Thu gọn menu'}
            >
              <FiMenu className="h-5 w-5" />
            </button>
          </div>

          {/* Search bar */}
          <div className="hidden flex-1 md:block md:max-w-lg">
            <div className="relative group">
              <input
                type="text"
                placeholder="Tìm kiếm đơn hàng, khách hàng..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 pl-10 text-sm focus:border-[#14264b] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#14264b]/20 transition-all placeholder:text-slate-400"
              />
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-[#14264b] transition-colors" />
            </div>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Notifications */}
            <button className="relative rounded-xl p-2.5 text-slate-500 hover:bg-slate-100 hover:text-[#14264b] transition-colors cursor-pointer">
              <FiBell className="h-5 w-5" />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-slate-200 mx-1" />

            {/* User menu */}
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#eb7325] to-[#14264b] text-white font-bold shadow-lg shadow-[#eb7325]/30">
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
