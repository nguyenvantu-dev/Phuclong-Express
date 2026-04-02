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
  const colors = {
    primary: '#5cc6ee',
    primaryLight: '#e0f7ff',
    primaryDark: '#2a8fb3',
    text: '#1e293b',
    textMuted: '#64748b',
  };

  const missionImages = [
    '/image1/mission1.png',
    '/image1/mission2.png',
    '/image1/mission1.png',
  ];

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

        {/* Image Carousel */}
        <div className="max-w-4xl mx-auto">
          <Swiper
            modules={[Autoplay]}
            autoplay={{ delay: 3000, disableOnInteraction: false }}
            loop={true}
            className="rounded-2xl overflow-hidden"
          >
            {missionImages.map((src, index) => {
              const missionIndex = index % missions.length;
              return (
                <SwiperSlide key={index}>
                  <div className="relative h-64 md:h-80">
                    <img
                      className="w-full h-full object-cover"
                      src={src}
                      alt={`Mission ${index + 1}`}
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{
                        background: `linear-gradient(135deg, ${colors.primaryDark}cc 0%, ${colors.primary}cc 100%)`,
                      }}
                    >
                      <p className="text-white text-2xl font-bold text-center px-8">
                        {missions[missionIndex].desc}
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
