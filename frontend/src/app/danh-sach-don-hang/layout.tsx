import PublicLayout from '@/app/components/public-home/public-layout';
import DanhSachDonHangPage from './page';

/**
 * DanhSachDonHang Public Page Layout
 * Uses public layout (not admin)
 * Converted from: UF/DanhSachDonHang.aspx
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <DanhSachDonHangPage />
    </PublicLayout>
  );
}
