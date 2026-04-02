import PublicLayout from '@/app/components/public-home/public-layout';
import ChuyenKhoanPage from './page';

/**
 * ChuyenKhoan Public Page Layout
 * Uses public layout (not admin)
 * Converted from: UF/ChuyenKhoan.aspx
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <ChuyenKhoanPage />
    </PublicLayout>
  );
}
