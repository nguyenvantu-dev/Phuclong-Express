'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

/**
 * Mission Section Component
 *
 * Displays mission statements with a simple image carousel.
 */
export default function MissionSection() {
  const missionImages = [
    '/image1/mission1.png',
    '/image1/mission2.png',
    '/image1/mission1.png',
  ];

  return (
    <section className="section" id="mission">
      <div className="conteiner">
        <h2 className="mission-title">Nhiệm vụ của chúng tôi</h2>
        <div className="mission" data-aos="fade-up" data-aos-delay={200}>
          {/* Image Carousel */}
          <div id="slideshow">
            <div className="slide-wrapper">
              <Swiper
                modules={[Autoplay]}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                loop={true}
              >
                {missionImages.map((src, index) => (
                  <SwiperSlide key={index}>
                    <div className="slide">
                      <img src={src} alt={`Mission ${index + 1}`} />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>

          {/* Mission Statements */}
          {[...Array(4)].map((_, index) => (
            <h4 key={index} className="mission__subtitle">
              Đảm bảo cung cấp cho khách hàng các dịch vụ đủ tiêu chuẩn theo tiêu chuẩn quốc tế
            </h4>
          ))}
        </div>
      </div>
    </section>
  );
}