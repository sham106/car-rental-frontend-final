import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAuthService } from '../../services/adminAuthService';
import { AdminAuthFrame, authInputClass, authButtonClass } from '../../components/admin/AdminAuthFrame';

export function AdminResetPasswordPage() {
  // Supabase's hosted recovery verification redirects with a fragment. Keep it only in memory.
  const [token, setToken] = useState(() => new URLSearchParams(window.location.hash.slice(1)).get('access_token') || '');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  useEffect(() => {
    window.history.replaceState(window.history.state, '', window.location.pathname);
  }, []);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    if (password !== confirmation) { setError('The passwords do not match.'); return; }
    setBusy(true); setError('');
    try {
      setMessage((await adminAuthService.resetPassword(token, password)).message);
      setToken(''); setPassword(''); setConfirmation('');
      if ('BroadcastChannel' in window) { const channel = new BroadcastChannel('ocr-admin-session'); channel.postMessage('changed'); channel.close(); }
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to reset your password.'); }
    finally { setBusy(false); }
  };
  return <AdminAuthFrame title="Choose a new password" description="Use a unique password with at least 12 characters.">
    {message ? <p role="status" className="rounded-xl bg-[#EEF5F1] p-4 text-sm text-[#2F6F6D]">{message}</p> : !token ?
      <div className="space-y-4"><p role="alert" className="text-sm text-[#65727B]">This reset link is missing or no longer available. Request a new link to continue.</p><Link to="/admin/forgot-password" className="font-semibold text-sm text-[#2F6F6D] underline">Request a new reset link</Link></div> :
      <form onSubmit={submit} className="space-y-5">
        {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}
        <div><label htmlFor="new-password" className="block mb-2 text-sm font-semibold">New password</label><input id="new-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={password} onChange={e => setPassword(e.target.value)} className={authInputClass} disabled={busy} /></div>
        <div><label htmlFor="confirm-password" className="block mb-2 text-sm font-semibold">Confirm password</label><input id="confirm-password" type="password" autoComplete="new-password" minLength={12} maxLength={128} required value={confirmation} onChange={e => setConfirmation(e.target.value)} className={authInputClass} disabled={busy} /></div>
        <button disabled={busy} className={authButtonClass}>{busy ? 'Updating password…' : 'Update password'}</button>
      </form>}
    <Link to="/admin/login" className="mt-6 text-sm text-[#2F6F6D] font-semibold hover:underline">Back to sign in</Link>
  </AdminAuthFrame>;
}
