import PublicLayout from '@/app/components/public-home/public-layout';
import { buildMetadata } from '@/lib/seo/build-metadata';
import HoiDapPage from './page';

export const metadata = buildMetadata({
  title: 'Câu hỏi thường gặp (FAQ)',
  description:
    'Giải đáp các câu hỏi thường gặp về dịch vụ mua hộ và vận chuyển hàng quốc tế của Phuc Long Express: phí ship, thời gian giao, thuế hải quan, hoàn tiền, theo dõi đơn.',
  path: '/hoi-dap',
  keywords: [
    'câu hỏi thường gặp Phuc Long Express',
    'FAQ mua hộ',
    'hỏi đáp vận chuyển quốc tế',
  ],
});

/**
 * HoiDap Public Page Layout
 * Uses public layout (not admin)
 * Converted from: UF/HoiDap.aspx
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <HoiDapPage />
    </PublicLayout>
  );
}
