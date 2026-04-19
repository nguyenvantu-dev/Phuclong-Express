'use client';

import { useEffect, useRef, useState } from 'react';

const stats = [
  { value: 10000, prefix: '+', label: 'Đơn hàng đã giao', suffix: '' },
  { value: 5000,  prefix: '+', label: 'Khách hàng tin dùng', suffix: '' },
  { value: 500,   prefix: '+', label: 'Quan hệ đối tác', suffix: '' },
  { value: 8,     prefix: '',  label: 'Năm kinh nghiệm', suffix: '+' },
];

/** Count-up hook: starts after `delay` ms, animates over `duration` ms */
function useCountUp(target: number, isVisible: boolean, delay = 0, duration = 1600) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isVisible) return;

    let timeout: ReturnType<typeof setTimeout>;
    let timer: ReturnType<typeof setInterval>;

    timeout = setTimeout(() => {
      let start = 0;
      const step = target / (duration / 16);
      timer = setInterval(() => {
        start += step;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
    }, delay);

    return () => {
      clearTimeout(timeout);
      clearInterval(timer);
    };
  }, [isVisible, target, delay, duration]);

  return count;
}

function StatItem({
  stat,
  isVisible,
  delay,
}: {
  stat: typeof stats[0];
  isVisible: boolean;
  delay: number;
}) {
  const count = useCountUp(stat.value, isVisible, delay);
  const formatted = count >= 1000
    ? count.toLocaleString('en-US')
    : count.toString();

  return (
    <div
      className="text-center py-10 px-4 rounded-2xl transition-all duration-500"
      style={{
        backgroundColor: 'rgba(255,255,255,0.05)',
        border: '1px solid rgba(255,255,255,0.08)',
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
        transitionDelay: `${delay}ms`,
      }}
    >
      <div className="text-3xl md:text-4xl font-black mb-2 leading-none" style={{ color: '#eb7325' }}>
        {stat.prefix}{formatted}{stat.suffix}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wider mt-2" style={{ color: 'rgba(255,255,255,0.55)' }}>
        {stat.label}
      </p>
    </div>
  );
}

/**
 * Stats Section — staggered count-up animation on scroll into view
 */
export default function StatsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="py-20 md:py-28"
      style={{ background: 'linear-gradient(135deg, #0f1e35 0%, #14264b 60%, #1a3460 100%)' }}
    >
      <div className="container mx-auto px-4 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#eb7325' }}>
              Thành tựu
            </span>
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white">
            Con số khẳng định <span style={{ color: '#eb7325' }}>uy tín</span> của chúng tôi
          </h2>
        </div>

        {/* Staggered cards: each starts 150ms after the previous */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => (
            <StatItem key={i} stat={stat} isVisible={isVisible} delay={i * 150} />
          ))}
        </div>

      </div>
    </section>
  );
}
