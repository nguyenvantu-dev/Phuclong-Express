import PublicLayout from '@/app/components/public-home/public-layout';
import { buildMetadata } from '@/lib/seo/build-metadata';
import DatHangMPage from './page';

export const metadata = buildMetadata({
  title: 'Đặt hàng quốc tế online',
  description:
    'Đặt hàng quốc tế nhanh chóng từ Mỹ, Nhật, Hàn, Trung Quốc và Châu Âu về Việt Nam. Nhập link sản phẩm, chọn tỷ giá, theo dõi đơn 24/7 với Phuc Long Express.',
  path: '/dat-hang',
  keywords: [
    'đặt hàng quốc tế',
    'order hàng Mỹ',
    'mua hộ hàng Nhật',
    'đặt hàng online',
    'gửi link mua hộ',
  ],
});

/**
 * DatHangM Public Page Layout
 * Uses public layout (not admin)
 * Converted from: UF/DatHangM.aspx
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <DatHangMPage />
    </PublicLayout>
  );
}
