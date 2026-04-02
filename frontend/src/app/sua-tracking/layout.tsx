import PublicLayout from '@/app/components/public-home/public-layout';
import SuaTrackingPage from './page';

/**
 * SuaTracking Public Page Layout
 * Uses public layout (not admin)
 * Converted from: UF/SuaTracking.aspx
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      <SuaTrackingPage />
    </PublicLayout>
  );
}
