import { restoreAdminSession } from './adminAuthService';

export class ApiError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export async function api<T>(path: string, body?: unknown, method = body === undefined ? 'GET' : 'POST', retry = true): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`/api${path}`, {
      method, credentials: 'include', cache: 'no-store',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: AbortSignal.timeout(30000),
    });
  } catch {
    throw new ApiError(503, 'Unable to reach the server. Check your connection and try again.');
  }
  if (response.status === 401 && path.startsWith('/admin/') && retry) {
    await restoreAdminSession();
    return api<T>(path, body, method, false);
  }
  if (!response.ok) {
    const result = await response.json().catch(() => null);
    throw new ApiError(response.status, typeof result?.detail === 'string' ? result.detail : 'The request could not be completed.');
  }
  if (response.status === 204) return undefined as T;
  return response.json();
}

export async function list<T>(resource: string): Promise<T[]> {
  const result: T[] = [];
  for (let offset = 0; ; offset += 500) {
    const page = await api<{ items: T[]; total: number }>(`/admin/records/${resource}?limit=500&offset=${offset}`);
    result.push(...page.items);
    if (result.length >= page.total || !page.items.length) return result;
  }
}

export const create = <T>(resource: string, body: unknown) => api<T>(`/admin/records/${resource}`, body);
export const update = <T>(resource: string, id: string, body: unknown) => api<T>(`/admin/records/${resource}/${encodeURIComponent(id)}`, body, 'PATCH');
export const query = (params: object) => new URLSearchParams(Object.entries(params).filter(([,v]) => v !== undefined && v !== null && v !== '').map(([k,v]) => [k,String(v)])).toString();

export async function uploadFile(file: File, kind: 'photo' | 'document') {
  if (file.size > 10 * 1024 * 1024) throw new Error('Choose a file no larger than 10 MB.');
  const content = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(new Error('Unable to read the selected file.'));
    reader.readAsDataURL(file);
  });
  return api<{ id: string; url: string; size: number }>('/admin/files', { name: file.name, contentType: file.type, content, kind });
}

export async function downloadReport(kind: string) {
  await restoreAdminSession();
  const response = await fetch(`/api/admin/reports/${kind}.csv`, { credentials: 'include', cache: 'no-store' });
  if (!response.ok) throw new Error('Unable to download this report.');
  const url = URL.createObjectURL(await response.blob());
  const a = document.createElement('a'); a.href = url; a.download = `${kind}.csv`; a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
