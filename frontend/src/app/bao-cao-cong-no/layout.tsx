import PublicLayout from '@/app/components/public-home/public-layout';
import BaoCaoCongNoPage from './page';

/**
 * BaoCaoCongNo Public Page Layout
 * Uses public layout (not admin)
 * Converted from: UF/BaoCao_CanDoiCongNo_User.aspx
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <BaoCaoCongNoPage />
    </PublicLayout>
  );
}
