'use client';

import { useState } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';

const GEO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-50m.json';
const NEIGHBORS = new Set(['116', '418', '764', '156', '458']);

const warehouses = [
  {
    id: 'north',
    num: '01',
    region: 'Miền Bắc',
    city: 'Hà Nội',
    label: 'Trụ sở chính',
    address: '60 Trương Công Giai, Cầu Giấy, Hà Nội',
    coordinates: [105.8412, 21.0245] as [number, number],
    color: '#eb7325',
  },
  {
    id: 'central',
    num: '02',
    region: 'Miền Trung',
    city: 'Đà Nẵng',
    label: 'Kho trung chuyển',
    address: '84 Bắc Sơn, An Khê, Đà Nẵng',
    coordinates: [108.2022, 16.0471] as [number, number],
    color: '#60a5fa',
  },
  {
    id: 'south',
    num: '03',
    region: 'Miền Nam',
    city: 'TP. Hồ Chí Minh',
    label: 'Kho phía Nam',
    address: '21 Đào Duy Anh, Đức Nhuận, TP. HCM',
    coordinates: [106.6297, 10.8231] as [number, number],
    color: '#34d399',
  },
];

export default function WarehousesSection() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section
      className="py-20 md:py-28 relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #0f1e35 0%, #14264b 60%, #1a3460 100%)' }}
    >
      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10"
          style={{ background: 'radial-gradient(circle, #eb7325 0%, transparent 70%)' }} />
      </div>

      <div className="container mx-auto px-4 max-w-6xl relative z-10">

        {/* Header */}
        <div className="text-center mb-14">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
            <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#eb7325' }}>
              Hệ thống kho
            </span>
            <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-3">
            Phủ sóng toàn quốc{' '}
            <span style={{ color: '#eb7325' }}>Bắc – Trung – Nam</span>
          </h2>
          <p className="text-sm md:text-base max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.55)' }}>
            Hệ thống 3 kho chiến lược giúp rút ngắn thời gian giao hàng và tối ưu chi phí vận chuyển trên toàn quốc.
          </p>
        </div>

        {/* Cards left + Map right */}
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Warehouse cards */}
          <div className="flex-1 flex flex-col gap-0 w-full relative">
            {/* Vertical connector */}
            <div className="absolute left-[27px] top-10 bottom-10 w-px hidden md:block"
              style={{ background: 'linear-gradient(to bottom, #eb732560, #60a5fa60, #34d39960)' }} />

            {warehouses.map((wh) => {
              const isActive = active === wh.id;
              return (
                <div
                  key={wh.id}
                  className="flex items-start gap-5 p-5 md:p-6 rounded-2xl cursor-pointer transition-all duration-300 mb-4 last:mb-0"
                  style={{
                    background: isActive
                      ? `linear-gradient(135deg, ${wh.color}18 0%, ${wh.color}08 100%)`
                      : 'rgba(255,255,255,0.04)',
                    border: `1px solid ${isActive ? wh.color + '60' : 'rgba(255,255,255,0.08)'}`,
                    transform: isActive ? 'translateX(6px)' : 'translateX(0)',
                    boxShadow: isActive ? `0 8px 32px ${wh.color}20` : 'none',
                  }}
                  onMouseEnter={() => setActive(wh.id)}
                  onMouseLeave={() => setActive(null)}
                >
                  {/* Number badge */}
                  <div
                    className="w-14 h-14 rounded-2xl flex-shrink-0 flex items-center justify-center"
                    style={{
                      background: isActive ? wh.color : 'rgba(255,255,255,0.06)',
                      border: `1px solid ${isActive ? wh.color : 'rgba(255,255,255,0.1)'}`,
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <span
                      className="text-lg font-black"
                      style={{ color: isActive ? 'white' : wh.color }}
                    >
                      {wh.num}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold uppercase tracking-widest" style={{ color: wh.color }}>
                        {wh.region}
                      </span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>·</span>
                      <span className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{wh.label}</span>
                    </div>
                    <h3 className="text-xl font-black text-white mb-1">{wh.city}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{wh.address}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Map */}
          <div
            className="flex-shrink-0 rounded-3xl overflow-hidden relative"
            style={{
              width: '300px',
              height: '540px',
              background: 'linear-gradient(160deg, #0a1628 0%, #0d1e35 100%)',
              border: '1px solid rgba(255,255,255,0.08)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.4)',
            }}
          >
            {/* Sea glow */}
            <div className="absolute inset-0 pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at 70% 50%, rgba(30,64,175,0.2) 0%, transparent 65%)' }} />

            {/* Label */}
            <div className="absolute top-4 left-0 right-0 flex justify-center z-20">
              <span className="text-xs font-bold tracking-widest uppercase px-3 py-1 rounded-full"
                style={{ color: 'rgba(255,255,255,0.4)', backgroundColor: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)' }}>
                Việt Nam
              </span>
            </div>

            <ComposableMap
              projection="geoMercator"
              projectionConfig={{ center: [106.2, 16.2], scale: 1750 }}
              width={300}
              height={540}
              className="relative z-10"
            >
              <Geographies geography={GEO_URL}>
                {({ geographies }: { geographies: { id: string; rsmKey: string }[] }) =>
                  geographies.map((geo) => {
                    const isVietnam = geo.id === '704';
                    const isNeighbor = NEIGHBORS.has(geo.id);
                    if (!isVietnam && !isNeighbor) return null;
                    return (
                      <Geography
                        key={geo.rsmKey}
                        geography={geo}
                        fill={isVietnam ? '#1e4d8c' : '#111e30'}
                        stroke={isVietnam ? '#3b6db5' : '#1a2d45'}
                        strokeWidth={isVietnam ? 1.2 : 0.5}
                        style={{
                          default: { outline: 'none' },
                          hover: { outline: 'none', fill: isVietnam ? '#2558a0' : '#111e30' },
                          pressed: { outline: 'none' },
                        }}
                      />
                    );
                  })
                }
              </Geographies>

              {warehouses.map((wh) => {
                const isActive = active === wh.id;
                return (
                  <Marker
                    key={wh.id}
                    coordinates={wh.coordinates}
                    onMouseEnter={() => setActive(wh.id)}
                    onMouseLeave={() => setActive(null)}
                  >
                    {/* Pulse ring */}
                    <circle r={isActive ? 18 : 13} fill={wh.color} opacity={isActive ? 0.25 : 0.12}
                      style={{ transition: 'all 0.25s ease' }} />
                    {/* Dot */}
                    <circle r={isActive ? 7 : 5} fill={wh.color} stroke="white" strokeWidth={2}
                      style={{
                        transition: 'all 0.25s ease',
                        cursor: 'pointer',
                        filter: isActive ? `drop-shadow(0 0 8px ${wh.color})` : 'none',
                      }} />
                    {/* Label */}
                    <text textAnchor="middle" y={-16}
                      style={{
                        fontFamily: 'inherit',
                        fontSize: '8px',
                        fontWeight: 800,
                        fill: isActive ? wh.color : 'rgba(255,255,255,0.7)',
                        pointerEvents: 'none',
                        letterSpacing: '0.04em',
                        transition: 'fill 0.25s ease',
                      }}
                    >
                      {wh.city}
                    </text>
                  </Marker>
                );
              })}
            </ComposableMap>
          </div>

        </div>

        {/* Bottom stats */}
        <div className="mt-14 pt-10 grid grid-cols-3 gap-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          {[
            { value: '3', label: 'Kho chiến lược' },
            { value: '63', label: 'Tỉnh thành phủ sóng' },
            { value: '24–72h', label: 'Thời gian giao hàng' },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-2xl md:text-3xl font-black mb-1" style={{ color: '#eb7325' }}>{s.value}</p>
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: 'rgba(255,255,255,0.4)' }}>{s.label}</p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
