'use client';
import { authClient } from './auth-client';

export class ApiError extends Error {
  constructor(message: string, public status: number, public code?: string) {
    super(message);
  }
}

/**
 * JWT handling: the short-lived Better Auth JWT is requested with the session cookie and kept IN MEMORY only
 * (never localStorage / non-HttpOnly cookies). It is refreshed shortly before expiry and once on a 401.
 */
let cached: { token: string; exp: number } | null = null;
let inflight: Promise<string | null> | null = null;

function decodeExp(token: string): number {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return (payload.exp ?? 0) * 1000;
  } catch {
    return 0;
  }
}

export function clearToken() {
  cached = null;
  inflight = null;
}

async function getToken(force = false): Promise<string | null> {
  if (!force && cached && cached.exp - Date.now() > 30_000) return cached.token;
  if (!inflight) {
    inflight = authClient
      .token()
      .then((res) => {
        const token = res.data?.token ?? null;
        cached = token ? { token, exp: decodeExp(token) } : null;
        return token;
      })
      .catch(() => null)
      .finally(() => { inflight = null; });
  }
  return inflight;
}

interface Options { method?: string; body?: unknown; auth?: boolean; signal?: AbortSignal }

export async function api<T = unknown>(path: string, opts: Options = {}): Promise<T> {
  const { method = 'GET', body, auth = true, signal } = opts;

  const send = async (forceToken: boolean) => {
    const headers: Record<string, string> = {};
    if (body !== undefined) headers['Content-Type'] = 'application/json';
    if (auth) {
      const token = await getToken(forceToken);
      if (token) headers.Authorization = `Bearer ${token}`;
    }
    return fetch(`/api${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal });
  };

  let res = await send(false);
  if (res.status === 401 && auth) {
    clearToken();
    res = await send(true); // one retry with a fresh token
  }

  let data: any = null;
  try { data = await res.json(); } catch { /* empty */ }

  if (!res.ok) {
    if (res.status === 403 && /blocked/i.test(data?.error || '')) {
      clearToken();
      await authClient.signOut().catch(() => undefined);
      if (typeof window !== 'undefined') window.location.href = '/signin?blocked=1';
    }
    throw new ApiError(data?.error || `Request failed (${res.status})`, res.status, data?.code);
  }
  return data as T;
}

export async function uploadImage(file: File): Promise<string> {
  if (!/^image\/(png|jpe?g|webp)$/.test(file.type)) throw new ApiError('Please choose a PNG, JPEG or WEBP image.', 400);
  if (file.size > 5 * 1024 * 1024) throw new ApiError('Image must be 5 MB or smaller.', 400);
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result as string);
    r.onerror = () => reject(new ApiError('Could not read the selected file.', 400));
    r.readAsDataURL(file);
  });
  const res = await api<{ url: string }>('/upload', { method: 'POST', body: { imageBase64: dataUrl, fileName: file.name } });
  return res.url;
}
