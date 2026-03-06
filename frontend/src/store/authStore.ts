import { create } from "zustand";
import { getMe } from "../api/auth";
import { setAuthToken } from "../api/axios";

export interface UserInfo {
  user_id: string;
  email: string;
  username: string;
  role: string;
}

interface AuthState {
  user: UserInfo | null;
  isLoading: boolean;
  checked: boolean;
  setUser: (user: UserInfo | null) => void;
  checkAuth: () => Promise<boolean>;
  logoutLocal: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  checked: false,
  setUser: (user) => set({ user, checked: true }),
  checkAuth: async () => {
    set({ isLoading: true });
    try {
      const data = await getMe();
      set({
        user: {
          user_id: data.user_id,
          email: data.email,
          username: data.username || data.email,
          role: data.role ?? "user",
        },
        checked: true,
        isLoading: false,
      });
      return true;
    } catch {
      setAuthToken(null);
      set({ user: null, checked: true, isLoading: false });
      return false;
    }
  },
  logoutLocal: () => {
    setAuthToken(null);
    set({ user: null });
  },
}));

