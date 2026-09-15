import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAuthService } from '../../services/adminAuthService';
import { AdminAuthFrame, authInputClass, authButtonClass } from '../../components/admin/AdminAuthFrame';

export function AdminForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); if (busy) return;
    setBusy(true); setError('');
    try { setMessage((await adminAuthService.recover(email.trim())).message); }
    catch (err) { setError(err instanceof Error ? err.message : 'Unable to request a reset link.'); }
    finally { setBusy(false); }
  };
  return <AdminAuthFrame title="Reset your password" description="Enter your account email and we’ll help you regain access.">
    {message ? <p role="status" className="rounded-xl bg-[#EEF5F1] p-4 text-sm text-[#2F6F6D]">{message} Check your inbox and spam folder.</p> :
      <form onSubmit={submit} className="space-y-5">
        {error && <p role="alert" className="text-sm text-red-800 bg-red-50 rounded-xl p-3">{error}</p>}
        <div><label htmlFor="recovery-email" className="block text-sm font-semibold mb-2">Work email</label><input id="recovery-email" type="email" autoComplete="email" required maxLength={254} value={email} onChange={e => setEmail(e.target.value)} className={authInputClass} disabled={busy} /></div>
        <button disabled={busy} className={authButtonClass}>{busy ? 'Requesting link…' : 'Send reset link'}</button>
      </form>}
    <Link to="/admin/login" className="mt-6 text-sm text-[#2F6F6D] font-semibold hover:underline">Back to sign in</Link>
  </AdminAuthFrame>;
}
