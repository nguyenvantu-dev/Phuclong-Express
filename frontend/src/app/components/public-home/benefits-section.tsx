import { FiShield, FiAward, FiClock, FiLock } from 'react-icons/fi';

/**
 * Benefits Section Component
 *
 * Displays 4 benefit items with icons and an image.
 * Two-column layout: list on left, image on right.
 * Uses #5cc6ee as primary color.
 */
export default function BenefitsSection() {
  const colors = {
    primary: '#5cc6ee',
    primaryLight: '#e0f7ff',
    primaryDark: '#2a8fb3',
    text: '#1e293b',
    textMuted: '#64748b',
  };

  const benefits = [
    {
      title: 'Sự an toàn',
      text: 'An tâm mua hàng mà không sợ lừa đảo, hàng giả, hàng nhái',
      icon: FiShield,
    },
    {
      title: 'Chất lượng cao',
      text: 'Chất lượng sản phẩm tốt, dịch vụ chuyên nghiệp',
      icon: FiAward,
    },
    {
      title: 'Bảo hành & Hỗ trợ 24/7',
      text: 'Khi có bất cứ vấn đề nào phát sinh đến đơn hàng, đừng lo lắng! Chúng tôi sẽ hỗ trợ bạn ngay!',
      icon: FiClock,
    },
    {
      title: 'Bảo mật thông tin',
      text: 'Việc bảo mật thông tin khách hàng là ưu tiên hàng đầu của chúng tôi',
      icon: FiLock,
    },
  ];

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: colors.primary }} id="benefits">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          Lợi ích khi sử dụng dịch vụ
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto text-white/80">
          Những giá trị mà chúng tôi mang đến cho khách hàng
        </p>

        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Benefits List */}
          <div className="grid sm:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/20 transition-all duration-300 cursor-pointer group"
              >
                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-7 h-7" style={{ color: colors.primary }} />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">{benefit.title}</h3>
                <p className="text-white/70 text-sm">{benefit.text}</p>
              </div>
            ))}
          </div>

          {/* Image */}
          <div className="relative">
            <img
              className="w-full rounded-2xl shadow-2xl"
              src="/image1/2.jpg"
              alt="Benefits"
            />
            <div
              className="absolute -bottom-6 -left-6 p-6 rounded-2xl shadow-xl hidden md:block"
              style={{ backgroundColor: colors.primary }}
            >
              <p className="text-white font-bold text-lg">10+</p>
              <p className="text-white/80 text-sm">Năm kinh nghiệm</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
