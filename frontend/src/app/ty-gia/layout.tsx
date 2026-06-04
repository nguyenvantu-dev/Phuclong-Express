import PublicLayout from '@/app/components/public-home/public-layout';
import { buildMetadata } from '@/lib/seo/build-metadata';

export const metadata = buildMetadata({
  title: 'Tỷ giá ngoại tệ hôm nay',
  description:
    'Cập nhật tỷ giá ngoại tệ (USD, JPY, KRW, CNY, EUR...) áp dụng cho dịch vụ vận chuyển hàng quốc tế của Phuc Long Express. Tra cứu lịch sử tỷ giá theo ngày.',
  path: '/ty-gia',
  keywords: [
    'tỷ giá ngoại tệ',
    'tỷ giá USD JPY KRW',
    'tỷ giá vận chuyển',
    'lịch sử tỷ giá',
  ],
});

export default function TyGiaLayout({ children }: { children: React.ReactNode }) {
  return <PublicLayout>{children}</PublicLayout>;
}
