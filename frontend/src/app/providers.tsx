'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthProvider } from '@/hooks/use-auth-context';
import { useLoginModalStore } from '@/lib/login-modal-store';
import LoginModal from '@/app/components/public-home/login-modal';
import '@/lib/axios-setup';

/**
 * Detects ?auth=1 injected by middleware and opens the login modal.
 * Wrapped in Suspense because useSearchParams suspends in App Router.
 */
function AuthParamWatcher() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const openModal = useLoginModalStore((s) => s.openModal);

  useEffect(() => {
    if (searchParams.get('auth') === '1') {
      openModal();
      const clean = new URL(window.location.href);
      clean.searchParams.delete('auth');
      router.replace(clean.pathname + (clean.search || ''));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

/** Global login modal driven by useLoginModalStore. */
function GlobalLoginModal() {
  const { isOpen, redirectTo, closeModal } = useLoginModalStore();
  const router = useRouter();

  const handleSuccess = () => {
    closeModal();
    if (redirectTo) {
      router.push(redirectTo);
    } else {
      router.refresh();
    }
  };

  return <LoginModal isOpen={isOpen} onClose={closeModal} onSuccess={handleSuccess} />;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 5 * 60 * 1000, retry: 3 },
        },
      }),
  );

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <Suspense fallback={null}>
          <AuthParamWatcher />
        </Suspense>
        <GlobalLoginModal />
        {children}
      </QueryClientProvider>
    </AuthProvider>
  );
}
