import type { ApiResponse } from "@portfolio/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.nguyennhatduy.qzz.io";

async function request<T>(path: string, options?: RequestInit): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    credentials: "include", // gửi kèm Cloudflare Access cookie (CF_Authorization)
    headers: { "Content-Type": "application/json", ...(options?.headers ?? {}) },
  });
  return res.json();
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  put: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PUT", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
};
