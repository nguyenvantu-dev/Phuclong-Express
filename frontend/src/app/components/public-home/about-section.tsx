import { FiPhone, FiMail } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

const features = [
  {
    title: 'Tư vấn đúng nhu cầu',
    desc: 'Đội ngũ tư vấn am hiểu thị trường quốc tế, giúp bạn chọn đúng sản phẩm và nguồn hàng phù hợp nhất.',
    icon: '🎯',
  },
  {
    title: 'Xử lý đơn nhanh chóng',
    desc: 'Đặt hàng nhanh, cập nhật trạng thái liên tục — từ lúc đặt đến khi hàng về tay bạn.',
    icon: '⚡',
  },
  {
    title: 'Chi phí minh bạch',
    desc: 'Không phát sinh chi phí ẩn. Báo giá rõ ràng ngay từ đầu, thanh toán đúng như cam kết.',
    icon: '💎',
  },
  {
    title: 'Hỗ trợ xuyên suốt',
    desc: 'Đội ngũ CSKH online liên tục, sẵn sàng giải đáp mọi thắc mắc trong suốt hành trình đơn hàng.',
    icon: '🛡️',
  },
];

/**
 * About Section — company story (left) + 4 key features grid (right) + contact card
 */
export default function AboutSection() {
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#f8fafc' }} id="about">
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Top: story + features */}
        <div className="grid lg:grid-cols-2 gap-16 items-start mb-16">

          {/* Left: company story */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
              <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#eb7325' }}>
                Về chúng tôi
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black mb-6 leading-tight" style={{ color: '#14264b' }}>
              Phuc Long Express —<br />
              <span style={{ color: '#eb7325' }}>8 năm đồng hành</span> cùng khách hàng
            </h2>
            <div className="space-y-4" style={{ color: '#475569' }}>
              <p className="leading-relaxed">
                Phuc Long Express được thành lập vào năm 2018 tại Hà Nội với giấc mơ xây dựng một đơn vị logistics Việt Nam chuyên nghiệp, tận tâm, dựa trên chất lượng dịch vụ và công nghệ tiên tiến.
              </p>
              <p className="leading-relaxed">
                Trải qua hơn 8 năm phát triển, PLE Logistics đã có những bước tăng trưởng vượt bậc. Mỗi thành viên trong đội ngũ đều coi vấn đề của khách hàng là của chính mình — nỗ lực đưa ra giải pháp tối ưu và tư vấn để chuỗi giá trị dịch vụ luôn tốt nhất.
              </p>
              <p className="leading-relaxed">
                Trong tương lai gần, PLE Logistics định hướng tiếp tục mở rộng mạng lưới quốc tế và cung cấp dịch vụ chuyển phát hàng hóa toàn cầu với chất lượng chuyên nghiệp, tận tâm nhất đến khách hàng.
              </p>
            </div>
          </div>

          {/* Right: 4 features grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {features.map((feature, i) => (
              <div
                key={i}
                className="rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg cursor-default"
                style={{ backgroundColor: 'white', border: '1px solid #e2e8f0' }}
              >
                <span className="text-3xl mb-4 block">{feature.icon}</span>
                <h3 className="font-bold text-base mb-2" style={{ color: '#14264b' }}>
                  {feature.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#64748b' }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Contact card */}
        <div
          className="rounded-3xl overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #14264b 0%, #1f3a6d 100%)' }}
        >
          <div className="px-8 pt-10 pb-6 text-center">
            <FiPhone className="w-8 h-8 text-white mx-auto mb-3" />
            <h3 className="text-2xl font-black text-white mb-1">HOTLINE CSKH</h3>
            <p className="text-white/60 text-sm">Chăm sóc khách hàng tận tình — 24/7</p>
            <div className="mt-6 h-px mx-4" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
          </div>

          <div className="px-6 pb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { icon: <FiPhone className="w-5 h-5 text-white" />, label: 'Hotline', value: '(+84) 344.415.213', href: 'tel:+840344415213' },
              { icon: <FiMail className="w-5 h-5 text-white" />, label: 'Email', value: 'phuclongexpress@gmail.com', href: 'mailto:phuclongexpress@gmail.com' },
              { icon: <FaFacebook className="w-5 h-5 text-white" />, label: 'Facebook', value: 'Phuc Long Express', href: 'https://www.facebook.com/phuclongexpress', external: true },
            ].map((item, i) => (
              <a
                key={i}
                href={item.href}
                {...(item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                className="flex flex-col items-center gap-3 px-4 py-5 rounded-2xl text-center transition-all duration-200 hover:scale-[1.02]"
                style={{ backgroundColor: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)' }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
                  {item.icon}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider mb-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{item.label}</p>
                  <p className="text-white font-semibold text-sm">{item.value}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
