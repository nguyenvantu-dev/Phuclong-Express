'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import { FiSearch, FiTruck, FiPackage, FiShield } from 'react-icons/fi';
import { searchTracking } from '@/lib/api';

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
    <section className="relative h-[85vh] min-h-[600px] overflow-hidden">
      {/* Slider */}
      <div className="absolute inset-0">
        <Swiper
          modules={[EffectFade, Autoplay, Navigation]}
          effect="fade"
          speed={2000}
          autoplay={{ delay: 5000, disableOnInteraction: false }}
          navigation={{
            prevEl: '#introSliderPrev',
            nextEl: '#introSliderNext',
          }}
          loop={true}
          className="h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="h-full">
              <div
                className="absolute inset-0 z-10"
                style={{
                  background: `linear-gradient(135deg, rgba(42, 143, 179, 0.9) 0%, rgba(92, 198, 238, 0.7) 50%, rgba(42, 143, 179, 0.5) 100%)`,
                }}
              />
              <img
                className="w-full h-full object-cover"
                src={slide.src}
                alt={slide.alt}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Content Overlay */}
      <div className="relative z-20 h-full flex items-center">
        <div className="container mx-auto px-4 md:px-8 flex flex-col lg:flex-row items-end justify-between gap-12">
          {/* Tracking Form - Glass Style */}
          <div
            className="w-full max-w-md p-6 rounded-2xl backdrop-blur-xl"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: '1px solid rgba(255, 255, 255, 0.3)',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            }}
          >
            <h3
              className="flex items-center justify-center gap-3 text-xl font-bold mb-4"
              style={{ color: colors.textLight }}
            >
              <FiPackage className="w-6 h-6" />
              TRA CỨU TRACKING
            </h3>
            <form onSubmit={handleTrackingSearch} className="space-y-4">
              <input
                type="text"
                placeholder="Nhập mã tracking..."
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                className="w-full px-5 py-4 rounded-xl text-white placeholder-white/70 focus:ring-2 focus:ring-white/50 backdrop-blur-sm transition-all border border-white/20 bg-white/10"
              />
              <button
                type="submit"
                className="w-full py-4 rounded-xl font-bold transition-all cursor-pointer hover:shadow-lg hover:scale-[1.02] flex items-center justify-center gap-2"
                style={{ backgroundColor: colors.primary, color: 'white' }}
              >
                <FiSearch className="w-5 h-5" />
                Tìm kiếm
              </button>
            </form>

            {/* Results - Timeline Style */}
            {trackingResult && (
              <div className="mt-4 max-h-64 overflow-y-auto">
                {trackingResult.status === 'pending' && (
                  <div
                    className="p-4 rounded-xl text-center animate-pulse"
                    style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: colors.textLight }}
                  >
                    {trackingResult.message}
                  </div>
                )}
                {trackingResult.status === 'not_found' && (
                  <div
                    className="p-4 rounded-xl text-sm"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                  >
                    {trackingResult.message}
                  </div>
                )}
                {trackingResult.status === 'error' && (
                  <div
                    className="p-4 rounded-xl text-sm"
                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.3)', color: '#fca5a5' }}
                  >
                    {trackingResult.message}
                  </div>
                )}
                {trackingResult.status === 'found' && trackingResult.history && (
                  <div className="space-y-3">
                    {trackingResult.history.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex gap-4 p-3 rounded-lg"
                        style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
                      >
                        <div className="w-1/4 text-right">
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.7)' }}>
                            {formatDate(item.ngay)}
                          </p>
                        </div>
                        <div className="w-3/4">
                          <p className="font-medium" style={{ color: colors.textLight }}>
                            {item.moTa}
                          </p>
                          {item.ghiChu && (
                            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.6)' }}>
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

          {/* Intro Text - Bold Typography */}
          <div className="text-right flex-1" data-aos="fade-left">
            <div
              className="mb-4 text-lg font-medium tracking-widest uppercase"
              style={{ color: 'rgba(255,255,255,0.8)' }}
            >
              <FiTruck className="inline mr-2" />
              Usa
            </div>
            <h1
              className="text-5xl md:text-7xl lg:text-8xl font-black leading-tight"
              style={{
                color: colors.textLight,
                textShadow: '0 4px 30px rgba(0,0,0,0.2)',
              }}
            >
              <span className="text-white">&</span>
              <br />
              Mua hộ
              <br />
              Vận chuyển
            </h1>
          </div>
        </div>
      </div>

      {/* Slider Arrows */}
      <div className="absolute bottom-8 right-8 z-30 flex gap-2">
        <button
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer hover:bg-white/30"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
          id="introSliderPrev"
          type="button"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer hover:bg-white/30"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(10px)' }}
          id="introSliderNext"
          type="button"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Feature Pills */}
      <div className="absolute bottom-8 left-8 z-30 hidden md:flex gap-3">
        <div
          className="px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: colors.textLight }}
        >
          <FiShield className="w-4 h-4" />
          <span className="text-sm font-medium">Bảo hiểm hàng hóa</span>
        </div>
        <div
          className="px-4 py-2 rounded-full flex items-center gap-2 backdrop-blur-md"
          style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: colors.textLight }}
        >
          <FiTruck className="w-4 h-4" />
          <span className="text-sm font-medium">Giao hàng toàn quốc</span>
        </div>
      </div>
    </section>
  );
}
