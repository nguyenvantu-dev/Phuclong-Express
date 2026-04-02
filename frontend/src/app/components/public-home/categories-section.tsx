/**
 * Categories Section Component
 *
 * Displays 9 product category cards in a responsive grid.
 */
export default function CategoriesSection() {
  const categories = [
    { name: 'CÁC SẢN PHẨM THỜI TRANG', image: '/image1/service4.jpg' },
    { name: 'ĐỒ DÙNG ĐIỆN TỬ', image: '/image1/service6.jpg' },
    { name: 'THIẾT BỊ CÔNG NGHỆ', image: '/image1/service5.jpg' },
    { name: 'TPCN, VITAMIN', image: '/image1/service7.jpg' },
    { name: 'CÁC MẶT HÀNG CHO TRẺ EM', image: '/image1/service8.jpg' },
    { name: 'THIẾT BỊ VĂN PHÒNG', image: '/image1/service9.jpg' },
    { name: 'TRANG SỨC CÁC LOẠI', image: '/image1/service10.jpg' },
    { name: 'PHỤ TÙNG Ô TÔ, XE MÁY', image: '/image1/service11.jpg' },
    { name: 'MỸ PHẨM', image: '/image1/service12.jpg' },
  ];

  return (
    <div className="conteiner">
      <h2 className="center__title">
        <span className="bestship">Phúc Long Express</span> HỖ TRỢ MUA ĐA DẠNG NGÀNH HÀNG TRÊN CÁC WEBSITE UY TÍN
      </h2>
      <div className="team center__title">
        {categories.map((category, index) => (
          <div className="team__col" key={index}>
            <div className="team__item" data-aos="fade-in" data-aos-delay={100}>
              <img className="team__photo" src={category.image} alt={category.name} />
              <div className="team__name">{category.name}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}