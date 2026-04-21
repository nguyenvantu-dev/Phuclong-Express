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
        * { box-sizing: border-box; }
        .lp { font-family: 'Inter', sans-serif; }

        @keyframes aurora-a { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(60px,-40px) scale(1.15)} 66%{transform:translate(-40px,50px) scale(0.9)} }
        @keyframes aurora-b { 0%,100%{transform:translate(0,0) scale(1)} 33%{transform:translate(-80px,40px) scale(1.2)} 66%{transform:translate(60px,-60px) scale(0.85)} }
        @keyframes aurora-c { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,60px) scale(1.25)} }
        @keyframes border-spin { to { transform: rotate(360deg); } }
        @keyframes card-in { from{opacity:0;transform:translateY(32px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes pulse-glow { 0%,100%{opacity:0.6} 50%{opacity:1} }

        .aurora-a { animation: aurora-a 20s ease-in-out infinite; }
        .aurora-b { animation: aurora-b 26s ease-in-out infinite; }
        .aurora-c { animation: aurora-c 18s ease-in-out infinite; }
        .border-spin { animation: border-spin 5s linear infinite; }
        .card-in { animation: card-in 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
        .pulse-glow { animation: pulse-glow 3s ease-in-out infinite; }

        .glass-input {
          background: rgba(255,255,255,0.04);
          border: 1.5px solid rgba(255,255,255,0.08);
          color: white;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
          outline: none;
        }
        .glass-input::placeholder { color: rgba(255,255,255,0.18); }
        .glass-input:focus { border-color: #eb7325; box-shadow: 0 0 0 3px rgba(235,115,37,0.18); background: rgba(255,255,255,0.07); }

        .shimmer-btn {
          background: linear-gradient(270deg, #eb7325, #ff9a5c, #c55a14, #eb7325);
          background-size: 300% auto;
          transition: background-position 0.5s, transform 0.2s, box-shadow 0.2s;
          box-shadow: 0 4px 28px rgba(235,115,37,0.45);
        }
        .shimmer-btn:hover:not(:disabled) {
          animation: shimmer 1.8s linear infinite;
          transform: translateY(-2px);
          box-shadow: 0 10px 40px rgba(235,115,37,0.6);
        }
        .shimmer-btn:active:not(:disabled) { transform: translateY(0); }
      `}</style>

      <div className="lp min-h-screen flex items-center justify-center relative overflow-hidden" style={{ background: '#02080e' }}>

        {/* ── Aurora background ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="aurora-a absolute top-[-20%] left-[-10%] w-[700px] h-[700px] rounded-full opacity-[0.22]"
            style={{ background: 'radial-gradient(circle, #eb7325 0%, #c55a14 40%, transparent 70%)', filter: 'blur(80px)' }} />
          <div className="aurora-b absolute bottom-[-25%] right-[-15%] w-[800px] h-[800px] rounded-full opacity-[0.18]"
            style={{ background: 'radial-gradient(circle, #14264b 0%, #0a1628 50%, transparent 70%)', filter: 'blur(90px)' }} />
          <div className="aurora-c absolute top-[40%] left-[40%] w-[500px] h-[500px] rounded-full opacity-[0.12]"
            style={{ background: 'radial-gradient(circle, #7c3aed 0%, transparent 65%)', filter: 'blur(70px)' }} />
          {/* grid lines */}
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        </div>

        {/* ── Card wrapper ── */}
        <div className="card-in relative z-10 w-full max-w-[420px] px-4">

          {/* Logo above card */}
          <div className="flex flex-col items-center mb-8">
            <div className="pulse-glow">
              <img src="/image1/LOGO_PHUC_LONG_EXPRESS_FULL_WHITE.png" alt="Phuc Long Express"
                className="h-24 object-contain drop-shadow-[0_0_32px_rgba(235,115,37,0.6)]" />
            </div>
            <p className="mt-3 text-[11px] font-semibold tracking-[0.3em] uppercase" style={{ color: 'rgba(235,115,37,0.8)' }}>
              Hệ thống quản trị · Admin Portal
            </p>
          </div>

          {/* Rotating border wrapper */}
          <div className="relative rounded-3xl p-[1.5px] overflow-hidden">
            {/* spinning gradient ring */}
            <div className="border-spin absolute inset-[-200%] rounded-full"
              style={{ background: 'conic-gradient(from 0deg, transparent 0deg, transparent 260deg, rgba(235,115,37,0.9) 300deg, rgba(235,115,37,0.4) 330deg, transparent 360deg)' }} />

            {/* Glass card */}
            <div className="relative rounded-[22px] px-8 py-9"
              style={{ background: 'rgba(6,18,38,0.85)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>

              {/* Top shimmer line */}
              <div className="absolute top-0 left-[10%] right-[10%] h-px rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(235,115,37,0.6), transparent)' }} />

              <div className="mb-7">
                <h2 className="text-[22px] font-bold text-white leading-tight">Chào mừng trở lại</h2>
                <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>Đăng nhập để vào hệ thống quản trị</p>
              </div>

              <form onSubmit={handleSubmit} noValidate className="space-y-4">

                {/* Username */}
                <div>
                  <label htmlFor="u" className="block text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    Tên đăng nhập
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                      </svg>
                    </span>
                    <input id="u" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                      className="glass-input w-full pl-11 pr-4 py-3.5 rounded-xl text-sm"
                      placeholder="Nhập tên đăng nhập" required autoFocus />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="p" className="block text-[11px] font-semibold uppercase tracking-widest mb-2" style={{ color: 'rgba(255,255,255,0.38)' }}>
                    Mật khẩu
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'rgba(255,255,255,0.2)' }}>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                    </span>
                    <input id="p" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                      className="glass-input w-full pl-11 pr-11 py-3.5 rounded-xl text-sm"
                      placeholder="Nhập mật khẩu" required />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} aria-label="Toggle password"
                      className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-150"
                      style={{ color: 'rgba(255,255,255,0.22)' }}
                      onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(235,115,37,0.8)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.22)'; }}>
                      {showPassword
                        ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                        : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                    </button>
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px]"
                    style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)', color: '#f87171' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                    {error}
                  </div>
                )}

                {/* Submit */}
                <button type="submit" disabled={loading}
                  className="shimmer-btn w-full py-4 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed mt-1">
                  {loading
                    ? <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Đang đăng nhập...
                      </span>
                    : 'Đăng nhập'}
                </button>
              </form>

              {/* Bottom shimmer line */}
              <div className="absolute bottom-0 left-[20%] right-[20%] h-px rounded-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(20,38,75,0.8), transparent)' }} />
            </div>
          </div>

          <p className="text-center mt-6 text-[11px]" style={{ color: 'rgba(255,255,255,0.15)' }}>
            © {new Date().getFullYear()} Phuc Long Express · Hà Nội, Việt Nam
          </p>
        </div>
      </div>
    </>
  );
}
