import { FiMail, FiPhone } from 'react-icons/fi';
import { FaCalendar, FaFacebook } from 'react-icons/fa';

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

Từ đó, Phuc Long Express (PLE Logistics) đã được thành lập vào năm 2018 tại Thủ đô Hà Nội. Trải qua hơn 5 năm trên chặng đường trưởng thành, từ khát vọng giản dị đó mà PLE Logistics ngày nay đã có những bước phát triển vượt bậc. Mỗi thành viên trong PLE Logistics đều trân quý bất kỳ chuyến hàng nào mà khách hàng tin tưởng giao cho chúng tôi, và chúng tôi luôn coi vấn đề của khách hàng là của chính mình để nỗ lực và đưa ra các giải pháp phù hợp, tư vấn cho khách hàng để tối ưu hóa chuỗi giá trị.

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
        <div className="max-w-4xl mx-auto">
          <div
            className="rounded-3xl overflow-hidden shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 60%, #7dd8f5 100%)` }}
          >
            {/* Header */}
            <div className="px-8 pt-10 pb-6 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-white/20 backdrop-blur-sm">
                <FiPhone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-1 tracking-wide">
                HOTLINE CSKH
              </h3>
              <p className="text-white/80 text-sm">
                Chăm sóc khách hàng tận tình — 24/7
              </p>
            </div>

            {/* Contact grid */}
            <div className="px-6 pb-8 grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone 1 */}
              <a
                href="tel:+84962904490"
                className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-white/25 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors duration-200">
                  <FiPhone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs mb-0.5">Hotline 1</p>
                  <p className="text-white font-bold text-base">(+84) 962.904.490</p>
                </div>
              </a>

              {/* Phone 2 */}
              <a
                href="tel:+840344415213"
                className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-white/25 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors duration-200">
                  <FiPhone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs mb-0.5">Hotline 2</p>
                  <p className="text-white font-bold text-base">(+84) 344.415.213</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:cskh.plelogistics@gmail.com"
                className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-white/25 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0 group-hover:bg-white/30 transition-colors duration-200">
                  <FiMail className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/70 text-xs mb-0.5">Email</p>
                  <p className="text-white font-semibold text-sm truncate">cskh.plelogistics@gmail.com</p>
                </div>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/phuclongexpress"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 px-5 py-4 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 hover:bg-white/25 transition-all duration-200 cursor-pointer group"
              >
                <div className="w-10 h-10 rounded-xl bg-[#1877F2]/80 flex items-center justify-center flex-shrink-0 group-hover:bg-[#1877F2] transition-colors duration-200">
                  <FaFacebook className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/70 text-xs mb-0.5">Facebook</p>
                  <p className="text-white font-semibold text-sm">Phuc Long Express</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
