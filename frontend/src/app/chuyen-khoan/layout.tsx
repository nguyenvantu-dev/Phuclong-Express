import PublicLayout from '@/app/components/public-home/public-layout';

/**
 * ChuyenKhoan Public Page Layout
 * Uses public layout (not admin)
 * Converted from: UF/ChuyenKhoan.aspx
 */
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <PublicLayout>
      {children}
    </PublicLayout>
  );
}
