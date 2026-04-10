import { FiPhone, FiMail } from 'react-icons/fi';
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
        <div className="max-w-3xl mx-auto">
          <div
            className="rounded-3xl overflow-hidden shadow-2xl border border-white/10"
            style={{ background: `linear-gradient(135deg, ${colors.primaryDark} 0%, ${colors.primary} 60%, #7dd8f5 100%)` }}
          >
            {/* Header */}
            <div className="px-8 pt-10 pb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 bg-white/20 backdrop-blur-sm shadow-lg">
                <FiPhone className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl md:text-3xl font-black text-white mb-2 tracking-wide">
                HOTLINE CSKH
              </h3>
              <p className="text-white/75 text-sm">
                Chăm sóc khách hàng tận tình — 24/7
              </p>
              <div className="mt-6 h-px bg-white/20 mx-4" />
            </div>

            {/* Contact items — 3 equal columns on sm+ */}
            <div className="px-6 pb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Phone */}
              <a
                href="tel:+840344415213"
                className="flex flex-col items-center gap-3 px-4 py-5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 hover:border-white/35 hover:scale-[1.02] transition-all duration-200 cursor-pointer group text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200 shadow">
                  <FiPhone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/65 text-xs mb-1 uppercase tracking-wider">Hotline</p>
                  <p className="text-white font-bold text-sm">(+84) 344.415.213</p>
                </div>
              </a>

              {/* Email */}
              <a
                href="mailto:phuclongexpress@gmail.com"
                className="flex flex-col items-center gap-3 px-4 py-5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 hover:border-white/35 hover:scale-[1.02] transition-all duration-200 cursor-pointer group text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors duration-200 shadow">
                  <FiMail className="w-5 h-5 text-white" />
                </div>
                <div className="min-w-0 w-full">
                  <p className="text-white/65 text-xs mb-1 uppercase tracking-wider">Email</p>
                  <p className="text-white font-semibold text-xs truncate">phuclongexpress@gmail.com</p>
                </div>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/phuclongexpress"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center gap-3 px-4 py-5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 hover:bg-white/25 hover:border-white/35 hover:scale-[1.02] transition-all duration-200 cursor-pointer group text-center"
              >
                <div className="w-11 h-11 rounded-xl bg-[#1877F2]/70 flex items-center justify-center group-hover:bg-[#1877F2] transition-colors duration-200 shadow">
                  <FaFacebook className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white/65 text-xs mb-1 uppercase tracking-wider">Facebook</p>
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
