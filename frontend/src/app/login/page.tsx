'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth-context';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      try {
        const raw = localStorage.getItem('auth-storage');
        if (raw) {
          const roles: string[] = JSON.parse(raw)?.state?.user?.roles || [];
          if (roles.includes('Admin')) { window.location.href = '/admin/dashboard'; return; }
        }
      } catch { /* fallback */ }
      window.location.href = '/';
    } catch {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        .login-root { font-family: 'Inter', sans-serif; }
        @keyframes mesh-move { 0%,100%{transform:translate(0,0) rotate(0deg)} 33%{transform:translate(30px,-20px) rotate(1deg)} 66%{transform:translate(-20px,15px) rotate(-1deg)} }
        @keyframes float-up { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes card-in { from{opacity:0;transform:translateY(24px) scale(0.98)} to{opacity:1;transform:translateY(0) scale(1)} }
        .mesh-1 { animation: mesh-move 18s ease-in-out infinite; }
        .mesh-2 { animation: mesh-move 24s ease-in-out infinite reverse; }
        .badge { animation: float-up 4s ease-in-out infinite; }
        .badge-2 { animation: float-up 4s ease-in-out infinite 1.3s; }
        .badge-3 { animation: float-up 4s ease-in-out infinite 2.6s; }
        .card-anim { animation: card-in 0.35s cubic-bezier(0.16,1,0.3,1) forwards; }
        .input-field { background: rgba(255,255,255,0.04); border: 1.5px solid rgba(255,255,255,0.09); color: white; transition: border-color 0.2s, box-shadow 0.2s, background 0.2s; }
        .input-field::placeholder { color: rgba(255,255,255,0.2); }
        .input-field:focus { outline: none; border-color: #eb7325; box-shadow: 0 0 0 3px rgba(235,115,37,0.15); background: rgba(255,255,255,0.07); }
      `}</style>

      <div className="login-root min-h-screen flex" style={{ background: '#06101f' }}>

        {/* ── Left Brand Panel ── */}
        <div className="hidden lg:flex flex-col justify-between w-[48%] relative overflow-hidden p-14" style={{ background: '#080f1e' }}>

          {/* Animated mesh blobs */}
          <div className="mesh-1 absolute -top-32 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.07]"
            style={{ background: 'radial-gradient(circle, #eb7325 0%, transparent 70%)' }} />
          <div className="mesh-2 absolute -bottom-40 right-0 w-[600px] h-[600px] rounded-full opacity-[0.06]"
            style={{ background: 'radial-gradient(circle, #14264b 0%, transparent 70%)' }} />

          {/* Dot grid */}
          <div className="absolute inset-0 opacity-[0.025]"
            style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '28px 28px' }} />

          {/* Top: Logo */}
          <div className="relative z-10">
            <img src="/image1/LOGO_PHUC_LONG_EXPRESS_FULL_WHITE.png" alt="Phuc Long Express" className="h-20 object-contain" />
          </div>

          {/* Center: Hero text + floating badges */}
          <div className="relative z-10 space-y-8">
            <div className="space-y-3">
              <span className="inline-block text-[11px] font-bold tracking-[0.3em] uppercase px-3 py-1 rounded-full"
                style={{ background: 'rgba(235,115,37,0.15)', color: '#eb7325', border: '1px solid rgba(235,115,37,0.3)' }}>
                Hệ thống quản trị
              </span>
              <h1 className="text-5xl font-black text-white leading-[1.1] tracking-tight">
                Vận hành<br />
                <span style={{ color: '#eb7325' }}>thông minh</span><br />
                hơn mỗi ngày
              </h1>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.38)' }}>
              Quản lý đơn hàng, lô hàng, tracking và công nợ toàn diện — tất cả trong một nền tảng.
            </p>

            {/* Floating stat badges */}
            <div className="flex flex-col gap-3">
              {[
                { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', label: '10,000+ đơn hàng được xử lý', cls: 'badge' },
                { icon: 'M13 10V3L4 14h7v7l9-11h-7z', label: 'Cập nhật trạng thái thời gian thực', cls: 'badge-2' },
                { icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z', label: 'Báo cáo công nợ chi tiết', cls: 'badge-3' },
              ].map(({ icon, label, cls }) => (
                <div key={label} className={`${cls} flex items-center gap-3 px-4 py-3 rounded-2xl w-fit`}
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', backdropFilter: 'blur(8px)' }}>
                  <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: 'rgba(235,115,37,0.15)' }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#eb7325" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d={icon} />
                    </svg>
                  </div>
                  <span className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom */}
          <div className="relative z-10">
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
              © {new Date().getFullYear()} Phuc Long Express · Thành lập 2018 · Hà Nội, Việt Nam
            </p>
          </div>
        </div>

        {/* ── Right Form Panel ── */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12" style={{ background: '#06101f' }}>
          <div className="card-anim w-full max-w-[400px]">

            {/* Mobile logo */}
            <div className="lg:hidden flex justify-center mb-8">
              <img src="/image1/LOGO_PHUC_LONG_EXPRESS_FULL_WHITE.png" alt="Phuc Long Express" className="h-16 object-contain" />
            </div>

            {/* Glassmorphism card */}
            <div className="rounded-3xl p-8 lg:p-10"
              style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', backdropFilter: 'blur(20px)' }}>

              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-1.5">Chào mừng trở lại</h2>
                <p className="text-sm" style={{ color: 'rgba(255,255,255,0.38)' }}>Đăng nhập để tiếp tục vào hệ thống</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">

                {/* Username */}
                <div>
                  <label htmlFor="login-username" className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>Tên đăng nhập</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.22)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input id="login-username" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      className="input-field w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                      placeholder="Nhập tên đăng nhập" required autoFocus />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="login-password" className="block text-xs font-semibold uppercase tracking-widest mb-2"
                    style={{ color: 'rgba(255,255,255,0.4)' }}>Mật khẩu</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.22)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input id="login-password" type={showPassword ? 'text' : 'password'} value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="input-field w-full pl-11 pr-11 py-3.5 rounded-xl text-sm"
                      placeholder="Nhập mật khẩu" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-150"
                      style={{ color: 'rgba(255,255,255,0.22)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)'; }}
                      aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                      {showPassword
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>
                      }
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-sm"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="w-full py-4 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2"
                  style={{ background: 'linear-gradient(135deg, #eb7325 0%, #c55a14 100%)', boxShadow: '0 4px 24px rgba(235,115,37,0.35)' }}
                  onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(235,115,37,0.5)'; } }}
                  onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 24px rgba(235,115,37,0.35)'; }}>
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang đăng nhập...
                      </span>
                    : 'Đăng nhập'}
                </button>
              </form>
            </div>

            <p className="mt-5 text-center text-xs" style={{ color: 'rgba(255,255,255,0.18)' }}>
              Phuc Long Express · Hệ thống quản trị nội bộ
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
