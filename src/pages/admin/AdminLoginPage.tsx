import React, { useState } from 'react';
import { Link, Navigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useAdminAuth } from '../../context/AdminAuthContext';
import { AdminAuthFrame, authInputClass, authButtonClass } from '../../components/admin/AdminAuthFrame';
import { safeAdminDestination } from '../../components/admin/RequireAdmin';

export function AdminLoginPage() {
  const { user, loading, error: sessionError, login } = useAdminAuth();
  const [params] = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  if (user && !loading) return <Navigate to={safeAdminDestination(params.get('next'))} replace />;

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (busy || loading) return;
    setBusy(true); setError(null);
    try { await login(email.trim(), password); setPassword(''); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to sign in.'); }
    finally { setBusy(false); }
  };
  return <AdminAuthFrame title="Welcome back" description="Sign in to manage your fleet and rental operations.">
    <form onSubmit={submit} className="space-y-5">
      {(error || sessionError) && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">{error || sessionError}</p>}
      <div><label htmlFor="admin-email" className="block text-sm font-semibold mb-2">Work email</label>
        <input id="admin-email" name="email" type="email" autoComplete="username" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} disabled={busy} className={authInputClass} placeholder="you@company.com" /></div>
      <div><label htmlFor="admin-password" className="block text-sm font-semibold mb-2">Password</label>
        <div className="relative"><input id="admin-password" name="password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required maxLength={128} value={password} onChange={e => setPassword(e.target.value)} disabled={busy} className={`${authInputClass} pr-12`} />
          <button type="button" onClick={() => setShowPassword(v => !v)} aria-label={showPassword ? 'Hide password' : 'Show password'} aria-pressed={showPassword} className="absolute right-3 top-3 text-[#65727B] p-0.5">{showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}</button></div>
      </div>
      <div className="flex justify-end"><Link to="/admin/forgot-password" className="text-sm font-semibold text-[#2F6F6D] hover:underline">Forgot password?</Link></div>
      <button type="submit" disabled={busy || loading} className={`${authButtonClass} flex items-center justify-center gap-2`}>
        {busy || loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
        {loading ? 'Checking session…' : busy ? 'Signing in…' : 'Sign in'}
      </button>
      <p className="text-xs leading-5 text-[#65727B]">Need access? Ask your account owner to create and authorize your administrator account.</p>
    </form>
  </AdminAuthFrame>;
}
