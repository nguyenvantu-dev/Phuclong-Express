'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import { FiAward, FiTruck, FiShield, FiClock } from 'react-icons/fi';

/**
 * Clients Section Component
 *
 * Displays client logos and company advantages.
 * Uses #5cc6ee as primary color.
 */
export default function ClientsSection() {
  const colors = {
    primary: '#5cc6ee',
    primaryLight: '#e0f7ff',
    primaryDark: '#2a8fb3',
    text: '#1e293b',
    textMuted: '#64748b',
  };

  const advantages = [
    {
      icon: FiTruck,
      title: 'Vận chuyển nhanh',
      desc: 'Giao hàng toàn quốc trong 3-5 ngày',
    },
    {
      icon: FiShield,
      title: 'Bảo hiểm hàng hóa',
      desc: 'An tâm với bảo hiểm 100% giá trị',
    },
    {
      icon: FiClock,
      title: 'Theo dõi 24/7',
      desc: 'Cập nhật trạng thái liên tục',
    },
    {
      icon: FiAward,
      title: 'Uy tín 10+ năm',
      desc: 'Hơn 10 năm kinh nghiệm logistics',
    },
  ];

  const companyIntro = {
    logo: '/image1/logo2.png',
    name: 'Phúc Long Express',
    text: `Với hơn 10 năm kinh nghiệm thực tiễn trong lĩnh vực vận chuyển Quốc tế, thế mạnh về mạng lưới vận chuyển trong nước và Quốc tế, cùng đội ngũ Nhân viên chuyên nghiệp, Phúc Long Express tự hào là đơn vị vận chuyển uy tín mang đến chất lượng dịch vụ tốt nhất cho khách hàng.`,
  };

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: colors.primary }} id="clients">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-12 text-white"
        >
          Tại sao chọn chúng tôi
        </h2>

        {/* Advantages Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {advantages.map((adv, index) => (
            <div
              key={index}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center hover:bg-white/20 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <adv.icon className="w-7 h-7" style={{ color: colors.primary }} />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{adv.title}</h3>
              <p className="text-white/80 text-sm">{adv.desc}</p>
            </div>
          ))}
        </div>

        {/* Company Intro */}
        <div
          className="max-w-4xl mx-auto rounded-2xl p-8 md:p-12"
          style={{ backgroundColor: 'white' }}
        >
          <div className="flex flex-col md:flex-row items-center gap-8">
            <img
              className="w-24 h-24 object-contain"
              src={companyIntro.logo}
              alt={companyIntro.name}
            />
            <div className="text-center md:text-left">
              <h3
                className="text-2xl font-bold mb-4"
                style={{ color: colors.primary }}
              >
                {companyIntro.name}
              </h3>
              <p className="" style={{ color: colors.textMuted }}>
                {companyIntro.text}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
