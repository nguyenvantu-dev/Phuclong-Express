/**
 * Services Section Component
 *
 * Displays mission (Sứ mệnh) and vision (Tầm nhìn) cards.
 */
export default function ServicesSection() {
  const services = [
    {
      title: 'Sứ mệnh',
      image: '/image1/Sumenh.jpg',
      text: `PLE Logistics mang đến sứ mệnh:
      - Là mạng lưới tiên tiến kết nối con người với hàng hóa, dịch vụ và ý tưởng sẽ tạo ra những tiện ích nhằm nâng cao chất lượng chuyển phát theo tiêu chí " Nhanh chóng- An toàn- Tiết kiệm".
      - PLE tin rằng cuộc sống tốt đẹp hơn chính là khi chất lượng dịch vụ luôn luôn được đảm bảo tối ưu, mang đến trải nghiệm dễ chịu, an tâm khi khách hàng sử dụng. Với sứ mệnh trở thành trung tâm kết nối con người với hàng hóa và dịch vụ xuất phát từ tâm, giúp chất lượng sống trở nên tốt đẹp, PLE tạo ra những cơ hội, nền tảng để khách hàng có thể mua sắm hàng hóa và nhận hàng một cách nhanh chóng đến mọi địa chỉ trên toàn quốc.`,
    },
    {
      title: 'Tầm nhìn',
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
    <section className="section" id="services" data-scrollspy="#services">
      <div className="conteiner">
        <h2 className="section__title">Phúc Long Express</h2>
        <div className="services">
          {services.map((service, index) => (
            <div className="services__item" key={index} data-aos="fade-down" data-aos-delay={index * 50}>
              <h4 className="services__title">{service.title}</h4>
              <img className="services__img" src={service.image} alt={service.title} />
              <div className="services__text">
                {service.text.split('\n').map((line, i) => {
                  const trimmed = line.trim();
                  if (!trimmed) return null;
                  return (
                    <p key={i} style={{ marginTop: trimmed.startsWith('-') ? '5px' : '15px' }}>
                      {trimmed.startsWith('-') ? (
                        <>
                          &nbsp;&nbsp;{trimmed.replace(/^-\s*/, '')}
                        </>
                      ) : (
                        trimmed
                      )}
                    </p>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}