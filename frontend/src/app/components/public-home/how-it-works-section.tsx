'use client';

import Link from 'next/link';

const steps = [
  {
    step: '01',
    title: 'Gửi link sản phẩm',
    desc: 'Copy link sản phẩm từ website nước ngoài (Amazon, eBay, Zara...) và gửi cho chúng tôi qua form đặt hàng hoặc Facebook.',
    icon: '🔗',
  },
  {
    step: '02',
    title: 'Xác nhận đơn & báo giá',
    desc: 'Chúng tôi kiểm tra sản phẩm, tính phí vận chuyển và báo tổng chi phí minh bạch trước khi bạn thanh toán.',
    icon: '📋',
  },
  {
    step: '03',
    title: 'Thanh toán & đặt hàng',
    desc: 'Bạn chuyển khoản theo báo giá. Chúng tôi tiến hành đặt hàng trên website quốc tế và cung cấp mã tracking để theo dõi.',
    icon: '💳',
  },
  {
    step: '04',
    title: 'Gom hàng & kiểm tra',
    desc: 'Hàng về kho trung chuyển, đội ngũ kiểm tra số lượng và tình trạng sản phẩm trước khi gom lô vận chuyển về Việt Nam.',
    icon: '📦',
  },
  {
    step: '05',
    title: 'Nhận hàng tại Việt Nam',
    desc: 'Hàng về Hà Nội, chúng tôi thông báo và giao tận nơi hoặc bạn đến nhận. Toàn bộ quá trình minh bạch, có tracking.',
    icon: '🏠',
  },
];

/**
 * How It Works Section — 5-step ordering process
 */
export default function HowItWorksSection() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#eb7325' }}>
              Quy trình
            </span>
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3" style={{ color: '#14264b' }}>
            Đặt hàng quốc tế chỉ với{' '}
            <span style={{ color: '#eb7325' }}>5 bước đơn giản</span>
          </h2>
          <p className="text-sm max-w-xl mx-auto" style={{ color: '#64748b' }}>
            Quy trình rõ ràng, minh bạch — từ lúc gửi link đến khi hàng về tay bạn tại Việt Nam
          </p>
        </div>

        {/* Steps */}
        <div className="relative">
          {/* Connector line (desktop) */}
          <div
            className="hidden lg:block absolute top-10 left-0 right-0 h-0.5 mx-[10%]"
            style={{ backgroundColor: '#e2e8f0', zIndex: 0 }}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 relative" style={{ zIndex: 1 }}>
            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                {/* Circle */}
                <div
                  className="w-20 h-20 rounded-full flex flex-col items-center justify-center mb-5 flex-shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{
                    backgroundColor: 'white',
                    border: '2px solid #e2e8f0',
                    boxShadow: '0 4px 20px rgba(20,38,75,0.08)',
                  }}
                >
                  <span className="text-2xl mb-0.5">{step.icon}</span>
                  <span className="text-xs font-black" style={{ color: '#eb7325' }}>{step.step}</span>
                </div>

                <h3 className="font-bold text-base mb-2 leading-snug" style={{ color: '#14264b' }}>
                  {step.title}
                </h3>
                <p className="text-xs leading-relaxed" style={{ color: '#64748b' }}>
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            href="/dat-hang"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5"
            style={{ backgroundColor: '#eb7325' }}
          >
            Bắt đầu đặt hàng ngay →
          </Link>
        </div>

      </div>
    </section>
  );
}
