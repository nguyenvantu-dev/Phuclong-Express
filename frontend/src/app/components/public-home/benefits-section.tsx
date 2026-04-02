/**
 * Benefits Section Component
 *
 * Displays 4 benefit items with icons and an image.
 * Two-column layout: list on left, image on right.
 */
export default function BenefitsSection() {
  const benefits = [
    {
      title: 'Sự an toàn',
      text: 'An tâm mua hàng mà không sợ lừa đảo, hàng giả, hàng nhái',
    },
    {
      title: 'Chất lượng cao',
      text: 'Chất lượng sản phẩm tốt, dịch vụ chuyên nghiệp',
    },
    {
      title: 'Bảo hành & Hỗ trợ 24/7',
      text: 'Khi có bất cứ vấn đề nào phát sinh đến đơn hàng, đừng lo lắng! Chúng tôi sẽ hỗ trợ bạn ngay!',
    },
    {
      title: 'Bảo mật thông tin',
      text: 'Việc bảo mật thông tin khách hàng là ưu tiên hàng đầu của chúng tôi. Vì vậy thông tin khách hàng sẽ được đảm bảo bí mật, an toàn một cách tuyệt đối',
    },
  ];

  return (
    <section className="section" id="benefits" data-scrollspy="#benefits">
      <div className="conteiner">
        <h2 className="section__title"><span>Lợi ích</span></h2>
        <div className="benefits">
          <div className="benefits__col">
            <ul className="benefits-list">
              {benefits.map((benefit, index) => (
                <li
                  key={index}
                  className="benefits-list__item"
                  data-aos="fade-down"
                  data-aos-delay={index * 100}
                  data-aos-anchor=".benefits"
                >
                  <h4 className="benefits-list__title">{benefit.title}</h4>
                  <div className="benefits-list__text">
                    <p>{benefit.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="benefits__col">
            <img className="benefits__img" src="/image1/2.jpg" alt="Benefits" />
          </div>
        </div>
      </div>
    </section>
  );
}