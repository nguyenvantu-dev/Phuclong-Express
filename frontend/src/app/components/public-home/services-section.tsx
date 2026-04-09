'use client';

import { FiTarget, FiEye } from 'react-icons/fi';

/**
 * Services Section Component
 *
 * Displays mission (Sứ mệnh) and vision (Tầm nhìn) cards - modern design.
 * Uses #5cc6ee as primary color.
 */
export default function ServicesSection() {
  const colors = {
    primary: '#5cc6ee',
    primaryLight: '#e0f7ff',
    primaryDark: '#2a8fb3',
    text: '#1e293b',
    textMuted: '#64748b',
  };

  const services = [
    {
      title: 'Sứ mệnh',
      icon: FiTarget,
      image: '/image1/Sumenh.jpg',
      text: `PLE Logistics mang đến sứ mệnh:
      - Là mạng lưới tiên tiến kết nối con người với hàng hóa, dịch vụ và ý tưởng sẽ tạo ra những tiện ích nhằm nâng cao chất lượng chuyển phát theo tiêu chí " Nhanh chóng- An toàn- Tiết kiệm".
      - PLE tin rằng cuộc sống tốt đẹp hơn chính là khi chất lượng dịch vụ luôn luôn được đảm bảo tối ưu, mang đến trải nghiệm dễ chịu, an tâm khi khách hàng sử dụng. Với sứ mệnh trở thành trung tâm kết nối con người với hàng hóa và dịch vụ xuất phát từ tâm, giúp chất lượng sống trở nên tốt đẹp, PLE tạo ra những cơ hội, nền tảng để khách hàng có thể mua sắm hàng hóa và nhận hàng một cách nhanh chóng đến mọi địa chỉ trên toàn quốc.`,
    },
    {
      title: 'Tầm nhìn',
      icon: FiEye,
      image: '/image1/Tamnhin.jpg',
      text: `Trở thành một trong những nhà cung cấp dịch vụ chuyển phát chuyên nghiệp với công nghệ tiên tiến bậc nhất đến từ Việt Nam. Giá trị cốt lõi của PLE Logistics:
      - Khách hàng là trọng tâm
      - Chuyển phát dễ hiểu
      - Hợp tác để lớn mạnh
      - Phát triển bản thân
      - Dịch vụ tận tâm`,
    },
  ];

  return (
    <section className="py-16 md:py-20" id="services" style={{ backgroundColor: '#f8fafc' }}>
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-4"
          style={{ color: colors.text }}
        >
          Phuc Long Express
        </h2>
        <p
          className="text-center mb-12 max-w-2xl mx-auto"
          style={{ color: colors.textMuted }}
        >
          Dịch vụ logistics chuyên nghiệp hàng đầu Việt Nam
        </p>
        <div className="grid md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
              style={{ border: `1px solid ${colors.primaryLight}` }}
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  src={service.image}
                  alt={service.title}
                />
                <div
                  className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(135deg, ${colors.primaryDark}cc 0%, ${colors.primary}cc 100%)`,
                  }}
                >
                  <service.icon className="w-16 h-16 text-white" />
                </div>
              </div>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: colors.primaryLight }}
                  >
                    <service.icon className="w-5 h-5" style={{ color: colors.primaryDark }} />
                  </div>
                  <h4
                    className="text-xl font-bold"
                    style={{ color: colors.text }}
                  >
                    {service.title}
                  </h4>
                </div>
                <div className="space-y-2" style={{ color: colors.textMuted }}>
                  {service.text.split('\n').map((line, i) => {
                    const trimmed = line.trim();
                    if (!trimmed) return null;
                    return (
                      <p key={i} style={{ marginTop: trimmed.startsWith('-') ? '5px' : '15px' }}>
                        {trimmed.startsWith('-') ? (
                          <>
                            <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: colors.primary }} />
                            {trimmed.replace(/^-\s*/, '')}
                          </>
                        ) : (
                          trimmed
                        )}
                      </p>
                    );
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
