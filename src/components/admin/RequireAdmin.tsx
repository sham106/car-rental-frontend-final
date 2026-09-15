import React from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAdminAuth } from '../../context/AdminAuthContext';

export function RequireAdmin() {
  const { user, loading, error, retry } = useAdminAuth();
  const location = useLocation();
  if (loading) return <div role="status" className="min-h-screen grid place-items-center bg-[#F4F6F7] text-[#17324D]">Checking administrator access…</div>;
  if (error) return <div className="min-h-screen grid place-items-center bg-[#F4F6F7] px-4">
    <div className="max-w-md rounded-2xl border border-[#DCE2E6] bg-white p-8 space-y-4">
      <h1 className="text-xl font-bold text-[#17324D]">Unable to verify your session</h1>
      <p role="alert" className="text-sm text-[#65727B]">{error}</p>
      <button onClick={retry} className="rounded-lg bg-[#17324D] px-4 py-2 text-white">Try again</button>
      <Link to="/admin/login" className="block text-sm underline">Go to sign in</Link>
    </div>
  </div>;
  if (!user) return <Navigate to={`/admin/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  return <Outlet />;
}

export function safeAdminDestination(value: string | null): string {
  if (!value || !/^\/admin(?:\/|\?|$)/.test(value) || value.includes('\\')) return '/admin';
  const path = value.split('?')[0];
  if (['/admin/login', '/admin/forgot-password', '/admin/reset-password'].includes(path)) return '/admin';
  return value;
}
