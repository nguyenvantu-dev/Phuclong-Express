import PublicLayout from '@/app/components/public-home/public-layout';
import DatHangMPage from './page';

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
