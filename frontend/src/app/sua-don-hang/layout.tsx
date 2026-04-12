import PublicLayout from '@/app/components/public-home/public-layout';

/**
 * SuaDonHang Public Page Layout
 * Uses public layout (not admin)
 * Converted from: UF/SuaDonHang.aspx
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  );
}
