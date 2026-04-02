'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/autoplay';

/**
 * Clients Section Component
 *
 * Displays client logos and review slider.
 */
export default function ClientsSection() {
  const reviews = [
    {
      logo: '/image1/logo2.png',
      name: 'Phúc Long Express',
      text: `Với hơn 10 năm kinh nghiệm thực tiễn trong lĩnh vực vận chuyển Quốc tế, thế mạnh về mạng lưới vận chuyển trong nước và Quốc tế, cùng đội ngũ Nhân viên chuyên nghiệp, Phúc Long Express tự hào là đơn vị vận chuyển uy tín mang đến chất lượng dịch vụ tốt nhất cho khách hàng.`,
    },
    {
      logo: '/image1/logo2.png',
      name: 'Phúc Long Express',
      text: `Theo đó, Phúc Long Express chuyên cung cấp các dịch vụ: Mua hộ, Đấu giá, Thanh toán hộ Cod, Gom hàng, Vận chuyển hàng từ Mỹ về Việt Nam đảm bảo an toàn hàng hóa với chính sách bảo hiểm hàng hóa tốt nhất. Phúc Long Express hỗ trợ order đặt mua hộ hàng trên các website thương mại điện tử uy tín nhất tại Mỹ. Thủ tục nhanh chóng, thao tác dễ dàng, kiểm soát và theo dõi đơn hàng xuyên suốt, nhận báo giá tự động ngay trên website Phúc Long Express.`,
    },
  ];

  return (
    <section className="section section--map" id="clients">
      <div className="conteiner">
        <h2 className="section__title">Khách hàng</h2>

        <div className="clients">
          {/* Logo */}
          <div className="clients__logos">
            <ul className="clients__list">
              <li data-aos="fade-right" data-aos-delay={0}>
                <a href="https://velvety-platypus-bf18c3.netlify.app/#" target="_blank" rel="noopener noreferrer">
                  <img className="clients__list-logo" src="/image1/1.svg" alt="Client logo" />
                </a>
              </li>
            </ul>
          </div>

          {/* Reviews Slider */}
          <div className="clients__reviews">
            <Swiper
              modules={[Autoplay]}
              autoplay={{ delay: 5000 }}
              loop={true}
              className="reviews"
              id="reviewsSlider"
            >
              {reviews.map((review, index) => (
                <SwiperSlide key={index}>
                  <div className="reviews__header">
                    <img className="reviews__photo" src={review.logo} alt={review.name} />
                    <div className="reviews__header-content">
                      <div className="reviews__name">
                        <span className="bestship">{review.name}</span>
                      </div>
                    </div>
                  </div>
                  <div className="reviews__content">
                    <p className="reviews__p">{review.text}</p>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </div>
    </section>
  );
}