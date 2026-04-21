import { create } from 'zustand';

interface LoginModalState {
  isOpen: boolean;
  redirectTo: string | null;
  openModal: (redirectTo?: string) => void;
  closeModal: () => void;
}

/**
 * Global store for login modal visibility.
 * Used by: middleware redirect handler, axios 401 interceptor.
 */
export const useLoginModalStore = create<LoginModalState>((set) => ({
  isOpen: false,
  redirectTo: null,
  openModal: (redirectTo) => set({ isOpen: true, redirectTo: redirectTo ?? null }),
  closeModal: () => set({ isOpen: false, redirectTo: null }),
}));
