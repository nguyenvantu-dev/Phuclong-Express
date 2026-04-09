'use client';

import { useState } from 'react';
import { FaQuoteLeft, FaStar } from 'react-icons/fa';

/**
 * Testimonials Section Component
 *
 * Displays 3 customer testimonials in a responsive grid with star ratings.
 * Uses #5cc6ee as primary color.
 */
export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const colors = {
    primary: '#5cc6ee',
    primaryLight: '#e0f7ff',
    primaryDark: '#2a8fb3',
    text: '#1e293b',
    textMuted: '#64748b',
  };

  const testimonials = [
    {
      quote: 'Tôi rất hài lòng khi đã tin và sử dụng các dịch vụ của Phuc Long Express trong thời gian qua. Tôi sẽ tiếp tục sử dụng các DV của Phuc Long Express và sẽ giới thiệu Phuc Long Express với những người thân của tôi!',
      avatar: '/image1/user-1.png',
      name: 'Chị Thúy Diễm',
      role: 'Khách hàng',
    },
    {
      quote: 'Sản phẩm vẫn ổn, vận chuyển nhanh, giá cũng hợp lý. Nếu ai có nhu cầu mua hàng ở nước ngoài thì Phuc Long Express đáng tin cậy, nếu có dịp sẽ ủng hộ tiếp.',
      avatar: '/image1/user-2.png',
      name: 'Anh Minh Quân',
      role: 'Khách hàng',
    },
    {
      quote: 'Đầu tiên mình chúc công ty Phuc Long Express ngày một phát triển và dịch vụ có thêm nhiều điều mới, tạo thêm lợi ích cho khách hàng. Đã từng sử dụng qua dịch và rất hài lòng.',
      avatar: '/image1/user-3.png',
      name: 'Chị Thu Hương',
      role: 'Khách hàng',
    },
  ];

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-4"
          style={{ color: colors.text }}
        >
          Khách hàng nói gì về <span style={{ color: colors.primary }}>dịch vụ</span>
        </h2>
        <p
          className="text-center mb-12 max-w-2xl mx-auto"
          style={{ color: colors.textMuted }}
        >
          Ý kiến đóng góp từ khách hàng đã sử dụng dịch vụ
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              style={{ border: `1px solid ${colors.primaryLight}` }}
            >
              {/* Quote Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
                style={{ backgroundColor: colors.primaryLight }}
              >
                <FaQuoteLeft className="w-6 h-6" style={{ color: colors.primary }} />
              </div>

              {/* Quote Text */}
              <p
                className="mb-6 leading-relaxed"
                style={{ color: colors.textMuted }}
              >
                "{testimonial.quote}"
              </p>

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="w-5 h-5" style={{ color: '#fbbf24' }} fill="#fbbf24" />
                ))}
              </div>

              {/* Author */}
              <div className="flex items-center gap-4">
                <img
                  className="w-12 h-12 rounded-full object-cover"
                  src={testimonial.avatar}
                  alt={testimonial.name}
                />
                <div>
                  <h4 className="font-bold" style={{ color: colors.text }}>
                    {testimonial.name}
                  </h4>
                  <p className="text-sm" style={{ color: colors.textMuted }}>
                    {testimonial.role}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
