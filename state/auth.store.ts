import { create } from 'zustand';

interface AuthState {
  user: any | null;
  tenantId: string | null;
  role: 'admin' | 'consultant' | 'secretary' | 'accountant' | null;
  
  // Actions
  setAuth: (user: any, tenantId: string, role: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  tenantId: 'fbad0720-6cfa-40c9-aeea-e5cb33347946', // Default for MVP
  role: 'admin', // Default for MVP

  setAuth: (user, tenantId, role) => set({ user, tenantId, role }),
  logout: () => set({ user: null, tenantId: null, role: null }),
}));
