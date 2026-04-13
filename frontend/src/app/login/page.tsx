'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth-context';

/**
 * Login Page
 *
 * PhucLong Express - Logistics & Shipping services login page.
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(username, password);
      window.location.href = '/';
    } catch {
      setError('Tên đăng nhập hoặc mật khẩu không đúng');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[#0F172A]">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #14264b 1px, transparent 1px),
                             radial-gradient(circle at 75% 75%, #14264b 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-20 w-64 h-64 bg-[#14264b]/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-80 h-80 bg-[#14264b]/10 rounded-full blur-3xl" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-[#14264b]/20 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <img src="/image1/LOGO_PHUC_LONG_EXPRESS_FULL.png" alt="Phuc Long Express" className="h-20 object-contain mb-4" />
            <h1 className="text-2xl font-bold text-[#1E293B]">Phuc Long Express</h1>
            <p className="text-sm text-[#14264b]/70 mt-1">Vận chuyển & Logistics</p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <div className="mb-5">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-[#475569] mb-2"
              >
                Tên đăng nhập
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-[#14264b]/30 focus:border-[#14264b]
                         transition-all duration-200 text-[#1E293B] placeholder-[#94A3B8]"
                placeholder="Nhập tên đăng nhập"
                required
              />
            </div>

            {/* Password Field */}
            <div className="mb-5">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-[#475569] mb-2"
              >
                Mật khẩu
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-[#14264b]/30 focus:border-[#14264b]
                         transition-all duration-200 text-[#1E293B] placeholder-[#94A3B8]"
                placeholder="Nhập mật khẩu"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#14264b] to-[#eb7325] text-white py-3 px-6
                       rounded-xl font-medium hover:from-[#1e3a6e] hover:to-[#c55a14]
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-300 shadow-lg hover:shadow-xl shadow-[#14264b]/20
                       transform hover:-translate-y-0.5 cursor-pointer"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : 'Đăng nhập'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-[#64748B]">
              © 2026 Phuc Long Express
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
