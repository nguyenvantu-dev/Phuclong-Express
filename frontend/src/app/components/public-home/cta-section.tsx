import Link from 'next/link';
import { FiLink, FiSearch } from 'react-icons/fi';
import { FaFacebook } from 'react-icons/fa';

/**
 * CTA Section — final call to action before footer
 */
export default function CtaSection() {
  return (
    <section
      className="py-20 md:py-28"
      style={{ background: 'linear-gradient(135deg, #14264b 0%, #1f3a6d 60%, #14264b 100%)' }}
    >
      <div className="container mx-auto px-4 max-w-4xl text-center">

        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 text-xs font-bold tracking-widest uppercase"
          style={{ backgroundColor: 'rgba(235,115,37,0.2)', color: '#eb7325', border: '1px solid rgba(235,115,37,0.3)' }}
        >
          Bắt đầu ngay hôm nay
        </div>

        <h2 className="text-3xl md:text-5xl font-black text-white mb-5 leading-tight">
          Muốn mua hàng nước ngoài?<br />
          <span style={{ color: '#eb7325' }}>Để Phuc Long Express lo.</span>
        </h2>

        <p className="text-white/65 max-w-xl mx-auto mb-10 leading-relaxed">
          Gửi link sản phẩm — chúng tôi lo phần còn lại. Không cần thẻ quốc tế, không cần biết ngoại ngữ, không phí ẩn.
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/dat-hang"
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all hover:opacity-90 hover:shadow-xl hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            style={{ backgroundColor: '#eb7325' }}
          >
            <FiLink className="w-4 h-4" />
            Gửi link đặt hàng
          </Link>

          <Link
            href="/danh-sach-tracking"
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            style={{
              backgroundColor: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
            }}
          >
            <FiSearch className="w-4 h-4" />
            Tra cứu đơn hàng
          </Link>

          <a
            href="https://www.facebook.com/phuclongexpress"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-8 py-4 rounded-xl font-bold transition-all hover:-translate-y-0.5 w-full sm:w-auto justify-center"
            style={{
              backgroundColor: 'rgba(24,119,242,0.2)',
              border: '1px solid rgba(24,119,242,0.4)',
              color: 'white',
            }}
          >
            <FaFacebook className="w-4 h-4" style={{ color: '#1877F2' }} />
            Nhắn tin Facebook
          </a>
        </div>

        {/* Trust note */}
        <p className="mt-10 text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
          Hơn 10,000 đơn hàng đã giao thành công · Hotline: (+84) 344.415.213
        </p>

      </div>
    </section>
  );
}
