'use client';

import { useRouter } from 'next/navigation';
import { FiArrowRight, FiShield, FiZap, FiGlobe } from 'react-icons/fi';
import { useAuth } from '@/hooks/use-auth-context';
import { useLoginModalStore } from '@/lib/login-modal-store';

const benefits = [
  {
    icon: FiGlobe,
    title: 'Không cần thẻ quốc tế',
    desc: 'Chúng tôi thanh toán thay bạn tại hàng nghìn website nước ngoài',
  },
  {
    icon: FiShield,
    title: 'Không cần tự xử lý thủ tục',
    desc: 'Toàn bộ quy trình hải quan, vận chuyển được xử lý chuyên nghiệp',
  },
  {
    icon: FiZap,
    title: 'Chỉ cần gửi link là xong',
    desc: 'Gửi link sản phẩm, nhận báo giá trong vài phút — đơn giản vậy thôi',
  },
];

const stats = [
  { label: 'Thành lập', value: '2018' },
  { label: 'Thị trường', value: '5+ quốc gia' },
  { label: 'Kinh nghiệm', value: '8+ năm' },
  { label: 'Hỗ trợ', value: '24/7' },
];

export default function ServicesSection() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const openModal = useLoginModalStore((s) => s.openModal);

  const handleCTA = () => {
    if (isAuthenticated) {
      router.push('/dat-hang');
    } else {
      openModal('/dat-hang');
    }
  };

  return (
    <section className="relative py-20 md:py-28 overflow-hidden" id="services"
      style={{ backgroundColor: '#f1f5f9' }}>

      {/* Ambient glow */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(235,115,37,0.08) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(20,38,75,0.07) 0%, transparent 70%)', transform: 'translate(-20%, 20%)' }} />

      <div className="relative container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* ── Left: benefits ── */}
          <div>
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6"
              style={{ background: 'rgba(235,115,37,0.1)', border: '1px solid rgba(235,115,37,0.25)' }}>
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: '#eb7325' }} />
              <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#eb7325' }}>
                Tại sao chọn chúng tôi
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black mb-10 leading-tight" style={{ color: '#14264b' }}>
              Mua sắm quốc tế<br />
              <span style={{ color: '#eb7325' }}>dễ dàng hơn bao giờ hết</span>
            </h2>

            <ul className="space-y-6 mb-10">
              {benefits.map((item, i) => {
                const Icon = item.icon;
                return (
                  <li key={i} className="flex items-start gap-4 group">
                    <div
                      className="flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
                      style={{
                        background: 'linear-gradient(135deg, #14264b 0%, #1e3a6e 100%)',
                        boxShadow: '0 4px 14px rgba(20,38,75,0.22)',
                      }}
                    >
                      <Icon size={20} color="#fff" />
                    </div>
                    <div>
                      <p className="font-bold text-base mb-0.5" style={{ color: '#1e293b' }}>{item.title}</p>
                      <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>{item.desc}</p>
                    </div>
                  </li>
                );
              })}
            </ul>

            <button
              onClick={handleCTA}
              className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl font-bold text-white transition-all duration-200 hover:-translate-y-0.5 cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #eb7325 0%, #c95e12 100%)',
                boxShadow: '0 4px 18px rgba(235,115,37,0.4)',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(235,115,37,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = '0 4px 18px rgba(235,115,37,0.4)'; }}
            >
              Gửi link sản phẩm ngay
              <FiArrowRight size={16} />
            </button>
          </div>

          {/* ── Right: company card ── */}
          <div className="relative">
            {/* Glow behind card */}
            <div className="absolute -inset-4 rounded-[2rem] opacity-30 blur-2xl pointer-events-none"
              style={{ background: 'linear-gradient(135deg, #14264b, #eb7325)' }} />

            <div
              className="relative rounded-3xl overflow-hidden"
              style={{ background: 'linear-gradient(145deg, #0d1b35 0%, #14264b 55%, #1c3260 100%)' }}
            >
              {/* Decorative circles */}
              <div className="absolute -top-14 -right-14 w-48 h-48 rounded-full pointer-events-none"
                style={{ background: 'rgba(235,115,37,0.12)' }} />
              <div className="absolute -bottom-12 -left-12 w-40 h-40 rounded-full pointer-events-none"
                style={{ background: 'rgba(235,115,37,0.07)' }} />

              <div className="relative p-8 md:p-10">
                <h3 className="text-xl font-bold text-white mb-4">
                  Phuc Long Express là gì?
                </h3>
                <p className="leading-relaxed mb-4 text-[15px]" style={{ color: 'rgba(255,255,255,0.72)' }}>
                  Đơn vị chuyên cung cấp dịch vụ{' '}
                  <strong className="text-white font-semibold">mua hộ quốc tế</strong>{' '}
                  và vận chuyển hàng từ nước ngoài về Việt Nam dành cho cá nhân, hộ kinh doanh và doanh nghiệp.
                </p>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.48)' }}>
                  Từ tư vấn nguồn hàng, nhận link sản phẩm, đặt mua, thanh toán, gom hàng cho đến vận chuyển và giao tận tay — chi phí minh bạch, quy trình rõ ràng.
                </p>

                {/* Stats */}
                <div className="mt-8 pt-8 grid grid-cols-2 gap-3"
                  style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                  {stats.map((item, i) => (
                    <div key={i}
                      className="rounded-2xl p-4 transition-colors duration-200"
                      style={{ background: 'rgba(255,255,255,0.06)', backdropFilter: 'blur(8px)' }}
                    >
                      <p className="text-[10px] uppercase tracking-widest mb-1.5"
                        style={{ color: 'rgba(255,255,255,0.38)' }}>
                        {item.label}
                      </p>
                      <p className="text-xl font-black" style={{ color: '#eb7325' }}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
