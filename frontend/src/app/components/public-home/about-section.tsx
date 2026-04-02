import { FaEnvelope, FaPhone } from 'react-icons/fa';

/**
 * About Section Component
 *
 * Displays company story and CSKH contact card.
 */
export default function AboutSection() {
  const story = `Chúng tôi bắt đầu với giấc mơ định hình một doanh nghiệp Việt Nam chuyên cung cấp và quảng bá các dịch vụ logistics đáng tin cậy dựa trên chất lượng dịch vụ, chuyên môn nhân sự và công nghệ tiên tiến.

Vậy nên chúng tôi đã khởi xướng ước mơ giản dị của riêng mình bằng cách xây dựng một nhà cung cấp dịch vụ logistics- mang tới dịch vụ hoàn hảo, chú trọng tính chuyên nghiệp, uy tín, tận tâm và trách nhiệm với khách hàng - điều khiến chúng tôi tạo nên tính khác biệt, cạnh tranh so với các đối thủ.

Từ đó, Phúc Long Express (PLE Logistics) đã được thành lập vào năm 2018 tại Thủ đô Hà Nội. Trải qua hơn 5 năm trên chặng đường trưởng thành, từ khát vọng giản dị đó mà PLE Logistics ngày nay đã có những bước phát triển vượt bậc. Mỗi thành viên trong PLE Logistics đều trân quý bất kỳ chuyến hàng nào mà khách hàng tin tưởng giao cho chúng tôi, và chúng tôi luôn coi vấn đề của khách hàng là của chính mình để nỗ lực và đưa ra các giải pháp phù hợp, tư vấn cho khách hàng để tối ưu hóa chuỗi giá trị.

Trong tương lai gần, PLE Logistics định hướng sẽ tiếp tục phát triển mở rộng mạng lưới toàn quốc tế và cung cấp dịch vụ chuyển phát hàng hóa toàn cầu với chất lượng chuyên nghiệp, tận tâm nhất đến khách hàng.`;

  return (
    <section className="section section--gray" id="about" data-scrollspy="#about">
      <div className="conteiner">
        <h2 className="section__title">Về chúng tôi</h2>

        <div className="vechungtoi">
          <div className="vechungtoi__col">
            <img className="vechungtoi_img" src="/image1/Sale.jpg" alt="About us" />
          </div>
          <div className="vechungtoi__col">
            {story.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4">{paragraph.trim()}</p>
            ))}
          </div>
        </div>

        <div className="team">
          <div className="team__col" style={{ margin: 'auto' }}>
            <div className="team__item" data-aos="fade-in" data-aos-delay={100} style={{ textAlign: 'center' }}>
              <img className="team__photo" src="/image1/cskh1.jpg" alt="CSKH" />
              <div className="team__name">HOTLINE CSKH</div>
              <div className="team__prof">Dịch vụ CSKH tận tình</div>
              <ul className="team__contacts">
                <li>
                  <FaEnvelope className="text-emerald-600" />
                  <a href="mailto:cskh.plelogistics@gmail.com">cskh.plelogistics@gmail.com</a>
                </li>
                <li>
                  <FaPhone className="text-emerald-600" />
                  <a href="tel:+84962904490">(+84) 962.904.490</a>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}