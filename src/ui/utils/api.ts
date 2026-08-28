/// <reference types="vite/client" />

/**
 * Dynamic API Base URL helper.
 * If VITE_API_URL is configured (e.g. https://foresight-production.up.railway.app),
 * requests will go directly to that backend.
 * Otherwise, requests fallback to relative '/api/...' which works with
 * local Vite proxy or Vercel rewrites.
 */
export const API_BASE_URL = (
  (typeof import.meta !== "undefined" && (import.meta as any).env?.VITE_API_URL) || ""
).replace(/\/$/, "");

export function apiUrl(path: string): string {
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${cleanPath}`;
}
