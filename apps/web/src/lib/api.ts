export class ApiError extends Error {
  status: number;
  code: string | null;
  constructor(status: number, code: string | null, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export type ProfileTileDTO = {
fullName: string | null
age: number | null
maritalStatus: "single" | "married" | "divorced" | "widowed" | "civil_union" | "other" | null
employmentStatus: "employed" | "unemployed" | "freelance" | "contractor" | "student" | "between_jobs" | "other" | null
currentTitle: string | null
yearsInCurrentRole: number | null
yearsTotal: number | null
};

import { getToken, clearToken } from "./session";
const API = "http://localhost:4000";

type RequestOpts = { softAuth?: boolean };

async function request<T>(path: string, init: RequestInit = {}, opts: RequestOpts = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    ...(init.headers as Record<string, string> | undefined),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const res = await fetch(`${API}${path}`, { ...init, headers });

  const parseApiError = async (): Promise<{ message: string; code: string | null }> => {
    try {
      const j = await res.json();
      return { message: j?.error || `HTTP ${res.status}`, code: (j?.errorCode as string | undefined) ?? null };
    } catch {
      return { message: `HTTP ${res.status}`, code: null };
    }
  };


  if (res.status === 401) {
    const { message, code } = await parseApiError();
    if (opts.softAuth) throw new ApiError(401, code, message);
    clearToken();
    sessionStorage.setItem("ws_postLoginRedirect", location.pathname + location.search);
    location.href = "/auth";
    throw new ApiError(401, code ?? "err.session_expired", "Sessão expirada");
  }

  if (!res.ok) {
    const { message, code } = await parseApiError();
    throw new ApiError(res.status, code, message);
  }

  if (res.status === 204) return undefined as unknown as T;
  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  const txt = await res.text();
  // @ts-expect-error retorno não-JSON opcional
  return txt;
}

export const apiGet = <T,>(p: string, o?: RequestOpts) => request<T>(p, {}, o);
export const apiPost = <T,>(p: string, b: any, o?: RequestOpts) =>
  request<T>(p, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }, o);
export const apiPut =  <T,>(p: string, b: any, o?: RequestOpts) =>
  request<T>(p, { method: "PUT",  headers: { "Content-Type": "application/json" }, body: JSON.stringify(b) }, o);
export function changePassword(currentPassword: string, newPassword: string) {
  return apiPost("/auth/change-password", { currentPassword, newPassword });
}
export function changeEmail(newEmail: string, password: string) {
  return apiPost("/auth/change-email", { newEmail, password });
}
export function apiDelete<T>(path: string, opts?: RequestOpts) {
  return request<T>(path, { method: "DELETE" }, opts);
}

export const apiPostForm = <T,>(path: string, form: FormData, opts?: RequestOpts) =>
  request<T>(path, { method: "POST", body: form }, opts);

export const getProfileTile = () => apiGet<ProfileTileDTO>("/users/tiles/profile");

export async function fetchApi<T = any>(
  path: string,
  { method = "GET", body, headers = {} }: { method?: string; body?: any; headers?: Record<string,string> } = {}
): Promise<T> {
  return request<T>(path, {
    method,
    headers: body ? { "Content-Type": "application/json", ...headers } : headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}