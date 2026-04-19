'use client';

import Link from 'next/link';
import { FiCheckCircle, FiLink } from 'react-icons/fi';

const benefits = [
  'Không cần thẻ quốc tế',
  'Không cần tự xử lý thủ tục phức tạp',
  'Chỉ cần gửi link, phần còn lại để Phuc Long Express lo',
];

/**
 * Why Choose Section — 3 key benefits + company description
 */
export default function ServicesSection() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-16 items-center">

          {/* Left: benefits */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
              <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#eb7325' }}>
                Tại sao chọn chúng tôi
              </span>
            </div>

            <h2 className="text-3xl md:text-4xl font-black mb-8 leading-tight" style={{ color: '#14264b' }}>
              Mua sắm quốc tế<br />
              <span style={{ color: '#eb7325' }}>dễ dàng hơn bao giờ hết</span>
            </h2>

            <ul className="space-y-5 mb-10">
              {benefits.map((item, i) => (
                <li key={i} className="flex items-start gap-4">
                  <FiCheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" style={{ color: '#22c55e' }} />
                  <span className="text-lg font-semibold" style={{ color: '#1e293b' }}>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/dat-hang"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:shadow-lg"
              style={{ backgroundColor: '#eb7325' }}
            >
              <FiLink className="w-4 h-4" />
              Gửi link sản phẩm ngay
            </Link>
          </div>

          {/* Right: description */}
          <div
            className="rounded-3xl p-8 md:p-10"
            style={{ backgroundColor: '#14264b' }}
          >
            <h3 className="text-xl font-bold text-white mb-5">
              Phuc Long Express là gì?
            </h3>
            <p className="text-white/75 leading-relaxed mb-6">
              Phuc Long Express là đơn vị chuyên cung cấp dịch vụ mua hộ quốc tế và vận chuyển hàng từ nước ngoài về Việt Nam dành cho cá nhân, hộ kinh doanh và doanh nghiệp.
            </p>
            <p className="text-white/75 leading-relaxed">
              Chúng tôi giúp khách hàng đơn giản hóa quá trình mua sắm xuyên biên giới: từ tư vấn nguồn hàng, nhận link sản phẩm, đặt mua, thanh toán, gom hàng cho đến vận chuyển và giao tận tay tại Việt Nam — với chi phí minh bạch và quy trình rõ ràng.
            </p>

            <div className="mt-8 pt-8 border-t grid grid-cols-2 gap-6" style={{ borderColor: 'rgba(255,255,255,0.12)' }}>
              {[
                { label: 'Thành lập', value: '2018' },
                { label: 'Thị trường', value: '5+ quốc gia' },
                { label: 'Kinh nghiệm', value: '8+ năm' },
                { label: 'Hỗ trợ', value: '24/7' },
              ].map((item, i) => (
                <div key={i}>
                  <p className="text-xs uppercase tracking-widest mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</p>
                  <p className="text-lg font-bold" style={{ color: '#eb7325' }}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
