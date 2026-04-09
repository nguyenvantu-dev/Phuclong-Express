'use client';

import { useState, useRef } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import { FiSearch, FiTruck, FiPackage, FiShield, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { searchTracking } from '@/lib/api';
import type { Swiper as SwiperType } from 'swiper';

interface TrackingHistoryItem {
  ngay: string;
  tinhTrang: string;
  moTa: string;
  ghiChu: string;
}

interface TrackingResultState {
  status: 'pending' | 'found' | 'not_found' | 'error';
  message?: string;
  history?: TrackingHistoryItem[];
}

// Custom colors based on #5cc6ee
const colors = {
  primary: '#5cc6ee',
  primaryHover: '#4ab3dc',
  primaryDark: '#2a8fb3',
  accent: '#ff6b35',
  text: '#1e293b',
  textLight: '#f8fafc',
};

/**
 * Hero Section Component
 *
 * Modern hero with full-width slider, glass tracking form, and bold typography.
 * Uses #5cc6ee as primary color.
 */
export default function HeroSection() {
  const [trackingCode, setTrackingCode] = useState('');
  const [trackingResult, setTrackingResult] = useState<TrackingResultState | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  const slides = [
    { src: '/image1/slide-1.jpg', alt: 'Slide 1' },
    { src: '/image1/slide-2.jpg', alt: 'Slide 2' },
    { src: '/image1/slide-3.jpg', alt: 'Slide 3' },
    { src: '/image1/slide-4.jpg', alt: 'Slide 4' },
    { src: '/image1/slide-5.jpg', alt: 'Slide 5' },
  ];

  const handleTrackingSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setTrackingResult({ status: 'pending', message: 'Đang tra cứu...' });

    try {
      const result = await searchTracking(trackingCode.trim());
      if (result.found && result.history && result.history.length > 0) {
        setTrackingResult({
          status: 'found',
          history: result.history,
        });
      } else {
        setTrackingResult({
          status: 'not_found',
          message: 'Không tìm thấy dữ liệu',
        });
      }
    } catch (error) {
      setTrackingResult({
        status: 'error',
        message: 'Có lỗi xảy ra khi tra cứu. Vui lòng thử lại sau.',
      });
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('vi-VN') + ' ' + date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <section className="relative h-[90vh] min-h-[620px] overflow-hidden">

      {/* Slider */}
      <div className="absolute inset-0">
        <Swiper
          modules={[EffectFade, Autoplay]}
          effect="fade"
          speed={1500}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          loop={true}
          className="h-full"
          onSwiper={(swiper) => { swiperRef.current = swiper; }}
          onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full">
              <img className="w-full h-full object-cover" src={slide.src} alt={slide.alt} />
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Cinematic overlay: dark left + dark bottom, image visible in center/right */}
        <div
          className="absolute inset-0 z-10"
          style={{
            background: 'linear-gradient(to right, rgba(10,25,40,0.85) 0%, rgba(10,25,40,0.5) 55%, rgba(10,25,40,0.2) 100%)',
          }}
        />
        <div
          className="absolute inset-0 z-10"
          style={{ background: 'linear-gradient(to top, rgba(10,25,40,0.7) 0%, transparent 50%)' }}
        />
      </div>

      {/* Content */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-6 md:px-12 flex flex-col lg:flex-row items-center justify-between gap-10">

          {/* Left: Headline */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-0.5" style={{ backgroundColor: colors.primary }} />
              <span className="text-sm font-semibold tracking-widest uppercase" style={{ color: colors.primary }}>
                PLE Logistics
              </span>
            </div>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-black leading-tight mb-4"
              style={{ color: '#ffffff', textShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
            >
              Mua hộ
              <br />
              <span style={{ color: colors.primary }}>Vận chuyển</span>
              <br />
              <span className="text-3xl md:text-4xl lg:text-5xl font-bold" style={{ color: 'rgba(255,255,255,0.75)' }}>
                USA &amp; Toàn quốc
              </span>
            </h1>
            {/* Feature pills */}
            <div className="flex flex-wrap gap-2 mt-6">
              <div
                className="px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              >
                <FiShield className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                Bảo hiểm hàng hóa
              </div>
              <div
                className="px-3 py-1.5 rounded-full flex items-center gap-1.5 backdrop-blur-md text-sm font-medium"
                style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)', color: 'white' }}
              >
                <FiTruck className="w-3.5 h-3.5" style={{ color: colors.primary }} />
                Giao hàng toàn quốc
              </div>
            </div>
          </div>

          {/* Right: Tracking form */}
          <div
            className="w-full lg:w-[400px] flex-shrink-0 p-6 rounded-2xl backdrop-blur-xl"
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
            }}
          >
            <h3 className="flex items-center justify-center gap-2 text-base font-bold mb-4 text-white">
              <FiPackage className="w-5 h-5" style={{ color: colors.primary }} />
              TRA CỨU TRACKING
            </h3>
            <form onSubmit={handleTrackingSearch} className="space-y-3">
              <input
                type="text"
                placeholder="Nhập mã tracking..."
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full px-4 py-3 rounded-xl text-white placeholder-white/50 outline-none focus:ring-2 backdrop-blur-sm transition-all border bg-white/10"
                style={{ borderColor: 'rgba(255,255,255,0.2)', '--tw-ring-color': colors.primary } as React.CSSProperties}
              />
              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold transition-all duration-200 cursor-pointer hover:opacity-90 hover:shadow-lg flex items-center justify-center gap-2 text-white"
                style={{ backgroundColor: colors.primary }}
              >
                <FiSearch className="w-4 h-4" />
                Tìm kiếm
              </button>
            </form>

            {/* Results */}
            {trackingResult && (
              <div className="mt-3 max-h-60 overflow-y-auto">
                {trackingResult.status === 'pending' && (
                  <div className="p-3 rounded-xl text-center text-sm animate-pulse text-white" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
                    {trackingResult.message}
                  </div>
                )}
                {trackingResult.status === 'not_found' && (
                  <div className="p-3 rounded-xl text-sm space-y-1.5" style={{ backgroundColor: 'rgba(239,68,68,0.25)', border: '1px solid rgba(239,68,68,0.3)' }}>
                    <p style={{ color: '#fca5a5' }}>{trackingResult.message}</p>
                    <p className="font-medium text-xs" style={{ color: '#fed7aa' }}>
                      Tracking chưa có thông tin. Quý khách vui lòng inbox nhóm làm việc ngay để được kiểm tra và giải đáp.
                    </p>
                  </div>
                )}
                {trackingResult.status === 'error' && (
                  <div className="p-3 rounded-xl text-sm" style={{ backgroundColor: 'rgba(239,68,68,0.25)', color: '#fca5a5' }}>
                    {trackingResult.message}
                  </div>
                )}
                {trackingResult.status === 'found' && trackingResult.history && (
                  <div className="space-y-2">
                    {trackingResult.history.map((item, idx) => (
                      <div key={idx} className="flex gap-3 p-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }}>
                        <div className="w-1/3 text-right">
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.55)' }}>{formatDate(item.ngay)}</p>
                        </div>
                        <div className="w-2/3">
                          <p className="text-sm font-medium text-white">{item.moTa}</p>
                          {item.ghiChu && (
                            <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>
                              <span className="font-medium">Ghi chú:</span> {item.ghiChu}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Bottom bar: dots + arrows */}
      <div className="absolute bottom-6 left-0 right-0 z-30 flex items-center justify-center gap-6">
        {/* Prev */}
        <button
          type="button"
          aria-label="Previous slide"
          onClick={() => swiperRef.current?.slidePrev()}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-white/20"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <FiChevronLeft className="w-4 h-4 text-white" />
        </button>

        {/* Dots */}
        <div className="flex items-center gap-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              aria-label={`Go to slide ${idx + 1}`}
              onClick={() => { swiperRef.current?.slideToLoop(idx); setActiveIndex(idx); }}
              className="transition-all duration-300 cursor-pointer rounded-full"
              style={{
                width: activeIndex === idx ? '24px' : '8px',
                height: '8px',
                backgroundColor: activeIndex === idx ? colors.primary : 'rgba(255,255,255,0.4)',
              }}
            />
          ))}
        </div>

        {/* Next */}
        <button
          type="button"
          aria-label="Next slide"
          onClick={() => swiperRef.current?.slideNext()}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-white/20"
          style={{ backgroundColor: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <FiChevronRight className="w-4 h-4 text-white" />
        </button>
      </div>

    </section>
  );
}
