import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { AdminIdentity, AuthError, adminAuthService, restoreAdminSession } from '../services/adminAuthService';

interface AuthContextValue {
  user: AdminIdentity | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  retry: () => void;
}

const AdminAuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AdminAuthProvider() {
  const [user, setUser] = useState<AdminIdentity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);
  const mutating = useRef(false);
  const channel = useRef<BroadcastChannel | null>(null);

  const verify = useCallback(async (showLoading = false) => {
    if (mutating.current) return;
    const version = ++generation.current;
    if (showLoading) setLoading(true);
    try {
      const identity = await restoreAdminSession();
      if (version !== generation.current) return;
      setUser(identity); setError(null);
    } catch (err) {
      if (version !== generation.current) return;
      setUser(null);
      setError(err instanceof AuthError && [401, 403].includes(err.status)
        ? null : err instanceof Error ? err.message : 'Unable to verify your session.');
    } finally {
      if (version === generation.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void verify(true);
    const recheck = () => { if (document.visibilityState === 'visible') void verify(); };
    const timer = window.setInterval(recheck, 60000);
    window.addEventListener('focus', recheck);
    if ('BroadcastChannel' in window) {
      channel.current = new BroadcastChannel('ocr-admin-session');
      channel.current.onmessage = () => { void verify(true); };
    }
    return () => {
      ++generation.current;
      window.clearInterval(timer);
      window.removeEventListener('focus', recheck);
      channel.current?.close(); channel.current = null;
    };
  }, [verify]);

  const login = async (email: string, password: string) => {
    const version = ++generation.current;
    mutating.current = true;
    try {
      const session = await adminAuthService.login(email, password);
      if (version !== generation.current) return;
      setUser(session.user); setError(null); setLoading(false);
      channel.current?.postMessage('changed');
    } finally { mutating.current = false; }
  };

  const logout = async () => {
    ++generation.current;
    mutating.current = true;
    try {
      await adminAuthService.logout();
      setUser(null); setError(null); setLoading(false);
      channel.current?.postMessage('changed');
    } finally { mutating.current = false; }
  };

  return <AdminAuthContext.Provider value={{ user, loading, error, login, logout, retry: () => void verify(true) }}>
    <Outlet />
  </AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) throw new Error('useAdminAuth requires AdminAuthProvider');
  return context;
}
