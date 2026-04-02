import PublicLayout from '@/app/components/public-home/public-layout';
import ThongTinLoHangPage from './page';

/**
 * ThongTinLoHang Public Page Layout
 * Uses public layout (not admin)
 * Converted from: UF/ThongTinLoHang.aspx
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <ThongTinLoHangPage />
    </PublicLayout>
  );
}
