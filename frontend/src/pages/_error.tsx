// Custom Pages Router error page.
// getInitialProps makes this dynamic (not prerendered at build time),
// avoiding the React dual-instance crash caused by Windows path casing mismatch
// (C:\Inetpub vs C:\inetpub) during static generation of /_error.
// In practice this page never renders because App Router handles all 404/500s.

type Props = { statusCode: number };

export default function Error({ statusCode }: Props) {
  return (
    <p>{statusCode ? `Lỗi ${statusCode}` : 'Đã xảy ra lỗi'}</p>
  );
}

Error.getInitialProps = ({
  res,
  err,
}: {
  res?: { statusCode: number };
  err?: { statusCode?: number };
}) => {
  const statusCode = res?.statusCode ?? err?.statusCode ?? 404;
  return { statusCode };
};
