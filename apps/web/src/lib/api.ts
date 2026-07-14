import type { ApiResponse } from "@portfolio/types";

const API_BASE = import.meta.env.VITE_API_URL ?? "https://api.nguyennhatduy.qzz.io";

export async function apiGet<T>(path: string): Promise<T | null> {
  const res = await fetch(`${API_BASE}${path}`);
  const json: ApiResponse<T> = await res.json();
  return json.success ? (json.data ?? null) : null;
}

export async function apiPost<T>(path: string, body: unknown): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  return res.json();
}
