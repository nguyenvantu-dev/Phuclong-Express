'use client';

import { FiShoppingBag, FiTv, FiSmartphone, FiHeart, FiGift, FiBriefcase, FiDroplet, FiGrid } from 'react-icons/fi';

/**
 * Categories Section Component
 *
 * Displays 9 product category cards in a responsive modern grid.
 * Uses #5cc6ee as primary color.
 */
export default function CategoriesSection() {
  const colors = {
    primary: '#5cc6ee',
    primaryLight: '#e0f7ff',
    primaryDark: '#2a8fb3',
    text: '#1e293b',
    textMuted: '#64748b',
  };

  const categories = [
    { name: 'Thời trang', image: '/image1/service4.jpg', icon: FiShoppingBag },
    { name: 'Đồ điện tử', image: '/image1/service6.jpg', icon: FiTv },
    { name: 'Thiết bị công nghệ', image: '/image1/service5.jpg', icon: FiSmartphone },
    { name: 'TPCN, Vitamin', image: '/image1/service7.jpg', icon: FiHeart },
    { name: 'Đồ cho trẻ em', image: '/image1/service8.jpg', icon: FiGift },
    { name: 'Thiết bị văn phòng', image: '/image1/service9.jpg', icon: FiBriefcase },
    { name: 'Trang sức', image: '/image1/service10.jpg', icon: FiDroplet },
    { name: 'Phụ tùng xe', image: '/image1/service11.jpg', icon: FiGrid },
    { name: 'Mỹ phẩm', image: '/image1/service12.jpg', icon: FiHeart },
  ];

  return (
    <section className="py-16 md:py-20" style={{ backgroundColor: '#f1f5f9' }}>
      <div className="container mx-auto px-4">
        <h2
          className="text-3xl md:text-4xl font-bold text-center mb-4"
          style={{ color: colors.text }}
        >
          <span style={{ color: colors.primary }}>Phúc Long Express</span> HỖ TRỢ MUA ĐA DẠNG NGÀNH HÀNG
        </h2>
        <p
          className="text-center mb-12 max-w-2xl mx-auto"
          style={{ color: colors.textMuted }}
        >
          Trên các website uy tín hàng đầu
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category, index) => (
            <div
              key={index}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
            >
              <div className="relative h-48 overflow-hidden">
                <img
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                  src={category.image}
                  alt={category.name}
                />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{
                    background: `linear-gradient(to top, ${colors.primaryDark}ee 0%, transparent 100%)`,
                  }}
                />
                <div className="absolute top-4 right-4 w-10 h-10 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0" style={{ backgroundColor: colors.primary }}>
                  <category.icon className="w-5 h-5 text-white" />
                </div>
              </div>
              <div
                className="p-4 text-center font-bold transition-colors duration-300"
                style={{ backgroundColor: 'white', color: colors.text }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primaryLight;
                  e.currentTarget.style.color = colors.primaryDark;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.color = colors.text;
                }}
              >
                {category.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
