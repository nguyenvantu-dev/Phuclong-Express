'use client';

import { useProtectedLink } from '@/hooks/use-protected-link';
import React from 'react';
import US from 'country-flag-icons/react/3x2/US';
import GB from 'country-flag-icons/react/3x2/GB';
import PL from 'country-flag-icons/react/3x2/PL';
import ES from 'country-flag-icons/react/3x2/ES';
import JP from 'country-flag-icons/react/3x2/JP';
import KR from 'country-flag-icons/react/3x2/KR';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type FlagComponent = React.ComponentType<any>;

const countries: { Flag: FlagComponent; name: string; desc: string }[] = [
  { Flag: US, name: 'HOA KỲ', desc: 'Amazon, eBay, Target, Walmart...' },
  { Flag: GB, name: 'VƯƠNG QUỐC ANH', desc: 'ASOS, Next, Boots, Argos...' },
  { Flag: PL, name: 'CỘNG HÒA BA LAN', desc: 'Allegro, Media Expert...' },
  { Flag: ES, name: 'TÂY BAN NHA', desc: 'El Corte, Zara, Mango...' },
  { Flag: JP, name: 'NHẬT BẢN', desc: 'Rakuten, Yahoo JP, Uniqlo...' },
  { Flag: KR, name: 'HÀN QUỐC', desc: 'Coupang, Gmarket, Olive Young...' },
];

/**
 * Countries Section — markets PLE ships from
 */
export default function CategoriesSection() {
  const navigate = useProtectedLink();
  return (
    <section className="py-20 md:py-28" style={{ backgroundColor: '#14264b' }}>
      <div className="container mx-auto px-4 max-w-6xl">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#eb7325' }}>
              Thị trường
            </span>
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-4">
            Vận chuyển hàng từ nhiều{' '}
            <span style={{ color: '#eb7325' }}>quốc gia về Việt Nam</span>
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Phuc Long Express hỗ trợ các tuyến vận chuyển từ nhiều thị trường lớn, phù hợp cho nhu cầu tiêu dùng cá nhân lẫn nhập hàng kinh doanh.
          </p>
        </div>

        {/* Country cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
          {countries.map((country, i) => (
            <div
              key={i}
              className="group flex flex-col items-center text-center px-3 py-5 rounded-xl cursor-pointer transition-all duration-300 hover:-translate-y-1"
              style={{
                backgroundColor: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(235,115,37,0.12)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(235,115,37,0.45)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLDivElement).style.backgroundColor = 'rgba(255,255,255,0.06)';
                (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(255,255,255,0.08)';
              }}
            >
              <div className="mb-3 rounded overflow-hidden shadow-lg" style={{ width: '56px', height: '37px' }}>
                <country.Flag style={{ width: '56px', height: '37px', display: 'block' }} />
              </div>
              <h3 className="text-white font-bold text-xs mb-1 leading-snug tracking-wide">{country.name}</h3>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)', fontSize: '10px' }}>
                {country.desc}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <button
            onClick={() => navigate('/dat-hang')}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-white border-2 transition-all duration-200 hover:bg-white hover:text-[#14264b] cursor-pointer"
            style={{ borderColor: 'rgba(255,255,255,0.3)' }}
          >
            Đặt hàng ngay
          </button>
        </div>

      </div>
    </section>
  );
}
