'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';
import { FiCheckCircle, FiGlobe, FiTruck, FiShield } from 'react-icons/fi';

/**
 * Mission Section Component
 *
 * Displays mission statements with a modern image carousel.
 * Uses #5cc6ee as primary color.
 */
export default function MissionSection() {
  // Background images cycling for carousel cards
  const cardImages = [
    '/image1/mission1.png',
    '/image1/mission2.png',
    '/image1/mission1.png',
    '/image1/mission2.png',
  ];

  const colors = {
    primary: '#5cc6ee',
    primaryLight: '#e0f7ff',
    primaryDark: '#2a8fb3',
    text: '#1e293b',
    textMuted: '#64748b',
  };

  const missions = [
    {
      icon: FiCheckCircle,
      title: 'Chất lượng tiêu chuẩn',
      desc: 'Đảm bảo cung cấp cho khách hàng các dịch vụ đủ tiêu chuẩn theo tiêu chuẩn quốc tế',
    },
    {
      icon: FiGlobe,
      title: 'Phạm vi toàn cầu',
      desc: 'Mở rộng mạng lưới vận chuyển đến mọi quốc gia trên thế giới',
    },
    {
      icon: FiTruck,
      title: 'Giao hàng nhanh',
      desc: 'Tối ưu hóa quy trình vận chuyển để giao hàng nhanh nhất',
    },
    {
      icon: FiShield,
      title: 'An toàn hàng đầu',
      desc: 'Bảo hiểm 100% giá trị hàng hóa trong suốt quá trình vận chuyển',
    },
  ];

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: '#1e293b' }} id="mission">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-white">
          Nhiệm vụ của chúng tôi
        </h2>
        <p className="text-center mb-12 max-w-2xl mx-auto" style={{ color: colors.primary }}>
          Cam kết mang đến dịch vụ logistics tốt nhất
        </p>

        {/* Mission Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {missions.map((mission, index) => (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 cursor-pointer group"
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform" style={{ backgroundColor: colors.primary }}>
                <mission.icon className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-white font-bold text-lg mb-2">{mission.title}</h3>
              <p className="text-white/60 text-sm">{mission.desc}</p>
            </div>
          ))}
        </div>

        {/* Mission Carousel — card-per-slide with big number */}
        <div className="max-w-5xl mx-auto">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={true}
            speed={600}
            slidesPerView={1}
            breakpoints={{
              640: { slidesPerView: 2, spaceBetween: 20 },
              1024: { slidesPerView: 3, spaceBetween: 24 },
            }}
            spaceBetween={16}
          >
            {missions.map((mission, index) => {
              const Icon = mission.icon;
              return (
                <SwiperSlide key={index}>
                  <div
                    className="rounded-2xl p-7 h-56 flex flex-col justify-between relative overflow-hidden"
                    style={{ border: '1px solid rgba(92,198,238,0.15)' }}
                  >
                    {/* Background image */}
                    <img
                      src={cardImages[index % cardImages.length]}
                      alt=""
                      aria-hidden="true"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                    {/* Dark overlay so text is always readable */}
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(10,25,40,0.92) 0%, rgba(10,25,40,0.75) 100%)' }} />

                    {/* Big background number */}
                    <span
                      className="absolute top-2 right-4 font-black select-none pointer-events-none z-10"
                      style={{ fontSize: '5rem', lineHeight: 1, color: 'rgba(92,198,238,0.12)' }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>

                    {/* Top row: icon + number */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center"
                        style={{ backgroundColor: colors.primary }}
                      >
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-xs font-bold tracking-widest" style={{ color: colors.primary }}>
                        {String(index + 1).padStart(2, '0')}
                      </span>
                    </div>

                    {/* Bottom: title + desc */}
                    <div className="relative z-10">
                      {/* Accent line */}
                      <div className="w-8 h-0.5 mb-3 rounded-full" style={{ backgroundColor: colors.primary }} />
                      <h3 className="text-white font-bold text-base mb-1.5 leading-snug">{mission.title}</h3>
                      <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>
                        {mission.desc}
                      </p>
                    </div>
                  </div>
                </SwiperSlide>
              );
            })}
          </Swiper>
        </div>
      </div>
    </section>
  );
}
