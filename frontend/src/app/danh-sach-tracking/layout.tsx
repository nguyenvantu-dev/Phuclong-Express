import PublicLayout from '@/app/components/public-home/public-layout';

/**
 * DanhSachTracking Public Page Layout
 * Uses public layout (not admin)
 * Converted from: UF/DanhSachTracking.aspx
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  );
}
