'use client';

import { FaQuoteLeft, FaStar } from 'react-icons/fa';

const testimonials = [
  {
    quote: 'Tôi rất hài lòng khi đã tin và sử dụng các dịch vụ của Phuc Long Express. Quy trình rõ ràng, hàng về đúng hẹn. Tôi sẽ tiếp tục sử dụng và giới thiệu cho người thân!',
    avatar: '/image1/user-1.png',
    name: 'Chị Thúy Diễm',
    role: 'Khách hàng cá nhân',
  },
  {
    quote: 'Sản phẩm đúng như mô tả, vận chuyển nhanh, giá hợp lý. Ai có nhu cầu mua hàng nước ngoài thì Phuc Long Express rất đáng tin cậy, có dịp sẽ ủng hộ tiếp.',
    avatar: '/image1/user-2.png',
    name: 'Anh Minh Quân',
    role: 'Khách hàng cá nhân',
  },
  {
    quote: 'Chúc công ty ngày một phát triển! Đã từng sử dụng dịch vụ và rất hài lòng — tư vấn nhiệt tình, hàng về nhanh, không có phí phát sinh ngoài dự kiến.',
    avatar: '/image1/user-3.png',
    name: 'Chị Thu Hương',
    role: 'Khách hàng thân thiết',
  },
];

/**
 * Testimonials Section — dark navy bg, consistent with new design system
 */
export default function TestimonialsSection() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#eb7325' }}>
              Khách hàng nói gì
            </span>
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#14264b' }}>
            Niềm tin từ <span style={{ color: '#eb7325' }}>khách hàng</span> của chúng tôi
          </h2>
          <p className="max-w-xl mx-auto text-sm" style={{ color: '#64748b' }}>
            Ý kiến thực tế từ những khách hàng đã trải nghiệm dịch vụ mua hộ và vận chuyển cùng PLE
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <div
              key={i}
              className="rounded-2xl p-7 flex flex-col transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: '#ffffff',
                border: '1px solid #e2e8f0',
                boxShadow: '0 2px 12px rgba(20,38,75,0.06)',
              }}
            >
              {/* Quote icon */}
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center mb-5 flex-shrink-0"
                style={{ backgroundColor: 'rgba(235,115,37,0.2)' }}
              >
                <FaQuoteLeft className="w-4 h-4" style={{ color: '#eb7325' }} />
              </div>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, j) => (
                  <FaStar key={j} className="w-4 h-4" style={{ color: '#fbbf24' }} />
                ))}
              </div>

              {/* Quote text */}
              <p className="leading-relaxed text-sm flex-1 mb-6" style={{ color: '#475569' }}>
                "{t.quote}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 pt-5" style={{ borderTop: '1px solid #e2e8f0' }}>
                <img
                  src={t.avatar}
                  alt={t.name}
                  className="w-11 h-11 rounded-full object-cover flex-shrink-0"
                  style={{ border: '2px solid rgba(235,115,37,0.4)' }}
                />
                <div>
                  <p className="font-bold text-sm" style={{ color: '#14264b' }}>{t.name}</p>
                  <p className="text-xs" style={{ color: '#94a3b8' }}>{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
