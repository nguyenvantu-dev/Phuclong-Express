import { FiMail, FiPhone } from 'react-icons/fi';
import { FaCalendar } from 'react-icons/fa';

/**
 * About Section Component
 *
 * Displays company story and CSKH contact card.
 * Uses #5cc6ee as primary color.
 */
export default function AboutSection() {
  const colors = {
    primary: '#5cc6ee',
    primaryLight: '#e0f7ff',
    primaryDark: '#2a8fb3',
    text: '#1e293b',
    textMuted: '#64748b',
  };

  const story = `Chúng tôi bắt đầu với giấc mơ định hình một doanh nghiệp Việt Nam chuyên cung cấp và quảng bá các dịch vụ logistics đáng tin cậy dựa trên chất lượng dịch vụ, chuyên môn nhân sự và công nghệ tiên tiến.

Vậy nên chúng tôi đã khởi xướng ước mơ giản dị của riêng mình bằng cách xây dựng một nhà cung cấp dịch vụ logistics- mang tới dịch vụ hoàn hảo, chú trọng tính chuyên nghiệp, uy tín, tận tâm và trách nhiệm với khách hàng - điều khiến chúng tôi tạo nên tính khác biệt, cạnh tranh so với các đối thủ.

Từ đó, Phúc Long Express (PLE Logistics) đã được thành lập vào năm 2018 tại Thủ đô Hà Nội. Trải qua hơn 5 năm trên chặng đường trưởng thành, từ khát vọng giản dị đó mà PLE Logistics ngày nay đã có những bước phát triển vượt bậc. Mỗi thành viên trong PLE Logistics đều trân quý bất kỳ chuyến hàng nào mà khách hàng tin tưởng giao cho chúng tôi, và chúng tôi luôn coi vấn đề của khách hàng là của chính mình để nỗ lực và đưa ra các giải pháp phù hợp, tư vấn cho khách hàng để tối ưu hóa chuỗi giá trị.

Trong tương lai gần, PLE Logistics định hướng sẽ tiếp tục phát triển mở rộng mạng lưới toàn quốc tế và cung cấp dịch vụ chuyển phát hàng hóa toàn cầu với chất lượng chuyên nghiệp, tận tâm nhất đến khách hàng.`;

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: '#f8fafc' }} id="about">
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-12"
          style={{ color: colors.text }}
        >
          Về chúng tôi
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 items-start mb-16">
          {/* Image */}
          <div className="relative">
            <img
              className="w-full rounded-2xl shadow-xl"
              src="/image1/Sale.jpg"
              alt="About us"
            />
            <div
              className="absolute -bottom-6 -right-6 p-6 rounded-2xl shadow-xl"
              style={{ backgroundColor: colors.primary }}
            >
              <FaCalendar className="w-8 h-8 text-white mb-2" />
              <p className="text-white font-bold text-xl">2018</p>
              <p className="text-white/80 text-sm">Năm thành lập</p>
            </div>
          </div>

          {/* Story */}
          <div>
            {story.split('\n\n').map((paragraph, index) => (
              <p key={index} className="mb-4 leading-relaxed" style={{ color: colors.textMuted }}>
                {paragraph.trim()}
              </p>
            ))}
          </div>
        </div>

        {/* CSKH Card */}
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-2xl p-8 md:p-12 shadow-xl"
            style={{ backgroundColor: 'white', border: `1px solid ${colors.primaryLight}` }}
          >
            <div className="text-center mb-8">
              <div
                className="w-20 h-20 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <FiPhone className="w-10 h-10 text-white" />
              </div>
              <h3
                className="text-2xl font-bold mb-2"
                style={{ color: colors.text }}
              >
                HOTLINE CSKH
              </h3>
              <p style={{ color: colors.textMuted }}>
                Dịch vụ chăm sóc khách hàng tận tình 24/7
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-8">
              <a
                href="mailto:cskh.plelogistics@gmail.com"
                className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer"
                style={{ backgroundColor: colors.primaryLight, color: colors.primaryDark }}
              >
                <FiMail className="w-5 h-5" />
                <span className="font-medium">cskh.plelogistics@gmail.com</span>
              </a>
              <a
                href="tel:+84962904490"
                className="flex items-center gap-3 p-4 rounded-xl transition-all duration-300 hover:shadow-md cursor-pointer"
                style={{ backgroundColor: colors.primary, color: 'white' }}
              >
                <FiPhone className="w-5 h-5" />
                <span className="font-bold">(+84) 962.904.490</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
