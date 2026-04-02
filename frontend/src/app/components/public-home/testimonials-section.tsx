'use client';

import { FaQuoteLeft, FaStar } from 'react-icons/fa';

/**
 * Testimonials Section Component
 *
 * Displays 3 customer testimonials in a grid with star ratings.
 */
export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: 'Tôi rất hài lòng khi đã tin và sử dụng các dịch vụ của Phúc Long Express trong thời gian qua. Tôi sẽ tiếp tục sử dụng các DV của Phúc Long Express và sẽ giới thiệu Phúc Long Express với những người thân của tôi!',
      avatar: '/image1/user-1.png',
      name: 'Chị Thúy Diễm',
    },
    {
      quote: 'Sản phẩm vẫn ổn, vận chuyển nhanh, giá cũng hợp lý. Nếu ai có nhu cầu mua hàng ở nước ngoài thì Phúc Long Express đáng tin cậy, nếu có dịp sẽ ủng hộ tiếp.',
      avatar: '/image1/user-2.png',
      name: 'Anh Minh Quân',
    },
    {
      quote: 'Đầu tiên mình chúc công ty Phúc Long Express ngày một phát triển và dịch vụ có thêm nhiều điều mới, tạo thêm lợi ích cho khách hàng. Đã từng sử dụng qua dịch và rất hài lòng.',
      avatar: '/image1/user-3.png',
      name: 'Chị Thu Hương',
    },
  ];

  return (
    <>
      <div className="center__title">KHÁCH HÀNG NÓI GÌ VỀ DỊCH VỤ CỦA CHÚNG TÔI?</div>
      <div className="testimonial">
      <div className="small-container">
        <div className="row">
          {testimonials.map((testimonial, index) => (
            <div className="col-3" key={index}>
              <FaQuoteLeft className="text-emerald-600 text-2xl mb-4" />
              <p>{testimonial.quote}</p>
              <div className="rating">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className="text-yellow-400 text-sm" />
                ))}
              </div>
              <img src={testimonial.avatar} alt={testimonial.name} />
              <h3>{testimonial.name}</h3>
            </div>
          ))}
        </div>
      </div>
    </div>
    </>
  );
}