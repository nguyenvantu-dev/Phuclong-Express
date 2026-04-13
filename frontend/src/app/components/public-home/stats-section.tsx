'use client';

import { useEffect, useRef, useState } from 'react';
import { FiPackage, FiFileText, FiUsers, FiUserCheck } from 'react-icons/fi';

/**
 * Stats Section Component
 *
 * Displays animated counters for package counts, orders, customers, and partners.
 * Uses Intersection Observer to trigger count-up animation on scroll.
 * Uses #14264b as primary color.
 */
export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);

  const colors = {
    primary: '#14264b',
    accent: '#eb7325',
    text: '#111827',
    textMuted: '#6b7280',
  };

  const stats = [
    { value: 1435, label: 'KIỆN HÀNG ĐÃ GIAO', icon: FiPackage },
    { value: 2675, label: 'ĐƠN HÀNG', icon: FiFileText },
    { value: 4436, label: 'KHÁCH HÀNG', icon: FiUsers },
    { value: 749, label: 'ĐỐI TÁC DOANH NGHIỆP', icon: FiUserCheck },
  ];

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="py-16 md:py-20"
      style={{ backgroundColor: '#1e293b' }}
    >
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-3 text-white">
          Thành tựu của chúng tôi
        </h2>
        <div className="flex justify-center mb-4">
          <div className="h-1 w-16 rounded-full" style={{ backgroundColor: colors.accent }} />
        </div>
        <p className="text-center mb-12 max-w-2xl mx-auto text-white/60">
          Những con số khẳng định uy tín và chất lượng dịch vụ
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center p-6 rounded-2xl hover:bg-white/5 transition-all duration-300"
            >
              <div
                className="w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center"
                style={{ backgroundColor: colors.primary }}
              >
                <stat.icon className="w-8 h-8 text-white" />
              </div>
              <span
                className="block text-4xl md:text-5xl font-black mb-2"
                style={{ color: colors.accent }}
              >
                {isVisible ? stat.value.toLocaleString() : '0'}
              </span>
              <span className="text-white/70 text-sm font-medium uppercase tracking-wider">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
