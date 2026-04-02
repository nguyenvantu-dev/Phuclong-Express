'use client';

import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectFade, Autoplay, Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-fade';
import 'swiper/css/navigation';
import { FaSearch } from 'react-icons/fa';
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

/**
 * Hero Section Component
 *
 * Displays intro slider with tracking lookup form.
 * Reverts to original logic: only show timeline history
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
    <section className="intro" id="intro">
      {/* Slider */}
      <div className="intro__slider" id="introSlider">
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
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index}>
              <img
                className="intro__slider-photo"
                src={slide.src}
                alt={slide.alt}
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Content */}
      <div className="conteiner absolute left-0 right-0 top-0 h-full flex items-end justify-between z-10 px-4 md:px-8">
        <div className="intro__inner flex items-end justify-between relative w-full">
          {/* Tracking Form */}
          <div className="request-form request-form--intro" data-aos="fade-right">
            <div className="request-form__header">
              <h3 className="request-form__title">
                TRA CỨU TRACKING <FaSearch style={{ color: 'white', fontSize: '24px' }} />
              </h3>
            </div>
            <form onSubmit={handleTrackingSearch} className="p-4">
              <div className="flex flex-col gap-3">
                <input
                  type="text"
                  placeholder="Nhập mã tracking..."
                  value={trackingCode}
                  onChange={(e) => setTrackingCode(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors font-medium"
                >
                  Tìm
                </button>
              </div>

              {/* Results - Timeline Style */}
              {trackingResult && (
                <div className="mt-4">
                  {trackingResult.status === 'pending' && (
                    <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm text-center">
                      {trackingResult.message}
                    </div>
                  )}
                  {trackingResult.status === 'not_found' && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                      {trackingResult.message}
                    </div>
                  )}
                  {trackingResult.status === 'error' && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-lg text-sm">
                      {trackingResult.message}
                    </div>
                  )}
                  {trackingResult.status === 'found' && trackingResult.history && (
                    <div className="timeline-wf" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                      {trackingResult.history.map((item, idx) => (
                        <div key={idx} className="entry" style={{ display: 'flex', marginBottom: '15px' }}>
                          <div className="title" style={{ width: '30%', textAlign: 'right', paddingRight: '15px' }}>
                            <h3 style={{ fontSize: '12px', margin: 0 }}>
                              {formatDate(item.ngay)}
                            </h3>
                          </div>
                          <div className="timeline-wf-body" style={{ width: '70%', paddingLeft: '10px' }}>
                            <div style={{ fontWeight: '500', color: '#333' }}>
                              {item.moTa}
                            </div>
                            {item.ghiChu && (
                              <p style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                                <b>Ghi chú:</b> {item.ghiChu}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Intro Text */}
          <div className="intro__text" data-aos="fade-left">
            <div className="intro__countries">USA</div>
            <h1 className="intro__title">
              <span className="intro__title-amp">&amp;</span>
              Mua hộ<br />
              Vận chuyển
            </h1>
          </div>

          {/* Slider Arrows */}
          <div className="intro__slider-arrows">
            <button className="intro__slider-btn intro__slider-btn--prev" id="introSliderPrev" type="button">
              Prev
            </button>
            <button className="intro__slider-btn intro__slider-btn--next" id="introSliderNext" type="button">
              Next
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
