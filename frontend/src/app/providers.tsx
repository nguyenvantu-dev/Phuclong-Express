'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { AuthProvider } from '@/hooks/use-auth-context';
import { useLoginModalStore } from '@/lib/login-modal-store';
import LoginModal from '@/app/components/public-home/login-modal';
import '@/lib/axios-setup';

// Detects ?auth=1 injected by middleware and opens the login modal.
// Uses window.location/history directly to avoid depending on App Router context,
// which can be duplicated by Windows IIS path casing (C:\Inetpub vs C:\inetpub).
function AuthParamWatcher() {
  const openModal = useLoginModalStore((s) => s.openModal);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('auth') === '1') {
      openModal();
      params.delete('auth');
      const cleaned = window.location.pathname + (params.toString() ? '?' + params.toString() : '');
      window.history.replaceState(null, '', cleaned);
    }
  }, [openModal]);

  return null;
}

/** Global login modal driven by useLoginModalStore. */
function GlobalLoginModal() {
  const { isOpen, redirectTo, closeModal } = useLoginModalStore();

  const handleSuccess = () => {
    closeModal();
    if (redirectTo) {
      window.location.href = redirectTo;
    } else {
      window.location.reload();
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
        <AuthParamWatcher />
        <GlobalLoginModal />
        {children}
      </QueryClientProvider>
    </AuthProvider>
  );
}
