export interface AdminIdentity {
  id: string;
  email: string;
  name: string;
  role: 'super_admin' | 'admin';
}

export class AuthError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

const ROOT = '/api/admin/auth';

export async function authRequest<T>(path: string, body?: unknown): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${ROOT}${path}`, {
      method: body === undefined ? 'GET' : 'POST',
      credentials: 'include', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(20000),
    });
  } catch {
    throw new AuthError(503, 'Unable to reach the authentication server. Please try again.');
  }
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    throw new AuthError(response.status, typeof data?.detail === 'string' ? data.detail : 'Authentication is unavailable. Please try again.');
  }
  if (!data) throw new AuthError(503, 'The authentication server returned an invalid response.');
  return data as T;
}

// Serialize cookie-changing operations, including across tabs where Web Locks is supported.
let sessionQueue: Promise<unknown> = Promise.resolve();
function sessionOperation<T>(operation: () => Promise<T>): Promise<T> {
  const run = () => typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request('ocr-admin-session', operation) : operation();
  const result = sessionQueue.then(run, run);
  sessionQueue = result.catch(() => undefined);
  return result;
}

// StrictMode and simultaneous refresh callers share one rotation of the refresh token.
let pendingRestore: Promise<AdminIdentity> | null = null;
export function restoreAdminSession(): Promise<AdminIdentity> {
  if (!pendingRestore) {
    pendingRestore = sessionOperation(() => authRequest<AdminIdentity>('/me').catch(async error => {
      if (!(error instanceof AuthError) || error.status !== 401) throw error;
      const session = await authRequest<{ user: AdminIdentity }>('/refresh', {});
      return session.user;
    })).finally(() => { pendingRestore = null; });
  }
  return pendingRestore;
}

export const adminAuthService = {
  login: (email: string, password: string) => sessionOperation(() => authRequest<{ user: AdminIdentity; expires_in: number }>('/login', { email, password })),
  logout: () => sessionOperation(() => authRequest<void>('/logout', {})),
  recover: (email: string) => authRequest<{ message: string }>('/forgot-password', { email }),
  resetPassword: (access_token: string, password: string) => sessionOperation(() => authRequest<{ message: string }>('/reset-password', { access_token, password })),
};
