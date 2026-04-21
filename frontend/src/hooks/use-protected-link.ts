import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth-context';
import { useLoginModalStore } from '@/lib/login-modal-store';

/**
 * Returns a navigate function that opens the login modal for protected routes
 * when the user is not authenticated, otherwise navigates directly.
 */
export function useProtectedLink() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const openModal = useLoginModalStore((s) => s.openModal);

  return (path: string) => {
    if (isAuthenticated) {
      router.push(path);
    } else {
      openModal(path);
    }
  };
}
