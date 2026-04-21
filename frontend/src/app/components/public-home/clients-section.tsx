'use client';

/**
 * Brands Section — local brand images in dual-direction marquee
 * Images in /public/image1/brand-*.png and brand-2-*.jpg
 */

const rowOne = [
  { name: 'Amazon',       src: '/image2/amazon-logo-squid-ink-smile-orange.png' },
  { name: 'Apple',        src: '/image2/apple-com-logo.png' },
  { name: 'Casio',        src: '/image2/casio-co-jp-logo.png' },
  { name: 'CompUSA',      src: '/image2/compusa-com-logo.png' },
  { name: 'Disney Store', src: '/image2/disney-store-logo.png' },
  { name: 'eBay',         src: '/image2/ebay-com-logo.png' },
  { name: 'H&M',          src: '/image2/hm-com-logo.png' },
  { name: 'Jomashop',     src: '/image2/jomashop.webp' },
  { name: "Levi's",       src: '/image2/levi-com-logo.png' },
  { name: 'Nike',         src: '/image2/nike-com-logo.png' },
  { name: 'Overstock',    src: '/image2/overstock-com-logo.png' },
  { name: 'Target',       src: '/image2/target-com-logo.png' },
  { name: 'Uniqlo',       src: '/image2/uniqlo-com-logo.png' },
];

const rowTwo = [
  { name: 'Nike',         src: '/image2/nike-com-logo.png' },
  { name: 'Uniqlo',       src: '/image2/uniqlo-com-logo.png' },
  { name: 'Target',       src: '/image2/target-com-logo.png' },
  { name: 'H&M',          src: '/image2/hm-com-logo.png' },
  { name: 'Overstock',    src: '/image2/overstock-com-logo.png' },
  { name: 'eBay',         src: '/image2/ebay-com-logo.png' },
  { name: "Levi's",       src: '/image2/levi-com-logo.png' },
  { name: 'Disney Store', src: '/image2/disney-store-logo.png' },
  { name: 'Jomashop',     src: '/image2/jomashop.webp' },
  { name: 'Amazon',       src: '/image2/amazon-logo-squid-ink-smile-orange.png' },
  { name: 'CompUSA',      src: '/image2/compusa-com-logo.png' },
  { name: 'Apple',        src: '/image2/apple-com-logo.png' },
  { name: 'Casio',        src: '/image2/casio-co-jp-logo.png' },
];

type Brand = { name: string; src: string };

function BrandCard({ brand }: { brand: Brand }) {
  return (
    <div
      className="flex-shrink-0 flex flex-col items-center justify-center gap-3 mx-3 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-lg cursor-default"
      style={{
        backgroundColor: '#ffffff',
        width: '200px',
        height: '140px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      }}
    >
      <img
        src={brand.src}
        alt={brand.name}
        className="object-contain"
        style={{ width: '130px', height: '80px' }}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = 'none';
        }}
      />
    </div>
  );
}

function MarqueeRow({ items, reverse = false }: { items: Brand[]; reverse?: boolean }) {
  // Doubled array + translateX(-50%) = seamless infinite loop, no jump
  const doubled = [...items, ...items];
  return (
    <div className="overflow-hidden py-2">
      <div
        className="flex will-change-transform"
        style={{
          animation: `marquee 20s linear infinite`,
          animationDirection: reverse ? 'reverse' : 'normal',
          width: 'max-content',
        }}
      >
        {doubled.map((brand, i) => (
          <BrandCard key={i} brand={brand} />
        ))}
      </div>
    </div>
  );
}

export default function ClientsSection() {
  return (
    <section className="py-20 md:py-24" style={{ backgroundColor: '#f8fafc' }}>

      {/* Header */}
      <div className="container mx-auto px-4 max-w-6xl mb-12 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
          <span className="text-sm font-bold tracking-widest uppercase" style={{ color: '#eb7325' }}>
            Thương hiệu nổi tiếng
          </span>
          <div className="w-8 h-0.5 rounded-full" style={{ backgroundColor: '#eb7325' }} />
        </div>
        <h2 className="text-3xl md:text-4xl font-black" style={{ color: '#14264b' }}>
          Order từ các thương hiệu <span style={{ color: '#eb7325' }}>hàng đầu thế giới</span>
        </h2>
        <p className="mt-3 text-sm" style={{ color: '#64748b' }}>
          Mua hộ từ hàng nghìn website và thương hiệu uy tín tại Mỹ, Anh, Nhật, Ba Lan, Tây Ban Nha...
        </p>
      </div>

      <div
        className="mx-auto"
        style={{
          maxWidth: '1152px',
          overflow: 'hidden',
          maskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 12%, black 88%, transparent 100%)',
        }}
      >
        <MarqueeRow items={rowOne} />
        <div className="h-4" />
        <MarqueeRow items={rowTwo} reverse />
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>

    </section>
  );
}
