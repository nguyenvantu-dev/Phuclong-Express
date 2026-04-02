import PublicLayout from '@/app/components/public-home/public-layout';
import HoiDapPage from './page';

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
