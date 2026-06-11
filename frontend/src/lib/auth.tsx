'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { authApi, tokenStorage } from './api';
import type { User, RegisterDto, LoginDto } from './types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const token = tokenStorage.getAccess();
    if (!token) { setUser(null); setLoading(false); return; }
    try {
      const res = await authApi.me();
      setUser(res.data);
    } catch {
      const refreshToken = tokenStorage.getRefresh();
      if (refreshToken) {
        try {
          const res = await authApi.refresh(refreshToken);
          tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
          setUser(res.data.user);
        } catch {
          tokenStorage.clear();
          setUser(null);
        }
      } else {
        tokenStorage.clear();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refreshUser(); }, [refreshUser]);

  const login = async (dto: LoginDto) => {
    const res = await authApi.login(dto);
    tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
  };

  const register = async (dto: RegisterDto) => {
    const res = await authApi.register(dto);
    tokenStorage.setTokens(res.data.accessToken, res.data.refreshToken);
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      const refreshToken = tokenStorage.getRefresh();
      if (refreshToken) await authApi.logout(refreshToken);
    } catch { /* ignore */ }
    tokenStorage.clear();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
