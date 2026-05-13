'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html>
      <body>
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h2>Đã xảy ra lỗi hệ thống!</h2>
          {error.digest && <p style={{ color: '#888', fontSize: '12px' }}>{error.digest}</p>}
          <button onClick={() => reset()}>Thử lại</button>
        </div>
      </body>
    </html>
  );
}
