'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth-context';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { login } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @keyframes lm-in { from{opacity:0} to{opacity:1} }
        @keyframes lm-card { from{opacity:0;transform:translateY(20px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        .lm-wrap { animation: lm-in 0.18s ease-out; }
        .lm-card { animation: lm-card 0.28s cubic-bezier(0.16,1,0.3,1) forwards; }
        .lm-input {
          border: 1.5px solid #e2e8f0;
          background: #f8fafc;
          color: #1e293b;
          outline: none;
          transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
        }
        .lm-input::placeholder { color: #cbd5e1; }
        .lm-input:focus { border-color: #14264b; box-shadow: 0 0 0 3px rgba(20,38,75,0.08); background: #fff; }
      `}</style>

      <div
        className="lm-wrap fixed inset-0 z-[10000] flex items-center justify-center p-4"
        style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(8px)' }}
        onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="lm-card w-full max-w-[400px] rounded-3xl overflow-hidden shadow-2xl">

          {/* Brand header */}
          <div className="relative flex flex-col items-center pt-8 pb-7 px-8 overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0f1f3d 0%, #14264b 60%, #1a3260 100%)' }}>
            {/* Subtle decor */}
            <div className="absolute -top-10 -right-10 w-36 h-36 rounded-full opacity-10"
              style={{ background: '#eb7325' }} />
            <div className="absolute -bottom-8 -left-8 w-28 h-28 rounded-full opacity-[0.08]"
              style={{ background: '#eb7325' }} />

            <button type="button" onClick={onClose}
              className="absolute top-3.5 right-3.5 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition-all duration-150"
              style={{ color: 'rgba(255,255,255,0.45)', background: 'rgba(255,255,255,0.08)' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.16)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = 'rgba(255,255,255,0.45)'; }}
              aria-label="Đóng">
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>

            <img src="/image1/LOGO_PHUC_LONG_EXPRESS_FULL_WHITE.png" alt="Phuc Long Express"
              className="relative z-10 h-20 object-contain mb-2" />
            <p className="relative z-10 text-[11px] font-semibold tracking-[0.25em] uppercase"
              style={{ color: 'rgba(235,115,37,0.9)' }}>
              Vận chuyển &amp; Logistics
            </p>
          </div>

          {/* Form section — white, clean */}
          <div className="bg-white px-8 pt-7 pb-8">
            <h2 className="text-lg font-bold text-[#0f1f3d] mb-1">Đăng nhập tài khoản</h2>
            <p className="text-sm text-[#94a3b8] mb-6">Chào mừng bạn quay lại!</p>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Username */}
              <div>
                <label htmlFor="lm-user" className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Tên đăng nhập
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#cbd5e1]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input id="lm-user" type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                    className="lm-input w-full pl-10 pr-4 py-3 rounded-xl text-sm"
                    placeholder="Nhập tên đăng nhập" required autoFocus />
                </div>
              </div>

              {/* Password */}
              <div>
                <label htmlFor="lm-pass" className="block text-xs font-semibold text-[#475569] mb-1.5">
                  Mật khẩu
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-[#cbd5e1]">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                  </span>
                  <input id="lm-pass" type={showPassword ? 'text' : 'password'} value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="lm-input w-full pl-10 pr-10 py-3 rounded-xl text-sm"
                    placeholder="Nhập mật khẩu" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer transition-colors duration-150 text-[#cbd5e1] hover:text-[#64748b]"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}>
                    {showPassword
                      ? <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                      : <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></svg>}
                  </button>
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm text-red-600"
                  style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                  {error}
                </div>
              )}

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full py-3.5 rounded-xl text-sm font-bold text-white cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                style={{ background: 'linear-gradient(135deg, #14264b 0%, #1e3a6e 50%, #eb7325 100%)', boxShadow: '0 4px 16px rgba(20,38,75,0.25)' }}
                onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(20,38,75,0.35)'; } }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 4px 16px rgba(20,38,75,0.25)'; }}>
                {loading
                  ? <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                      Đang đăng nhập...
                    </span>
                  : 'Đăng nhập'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
