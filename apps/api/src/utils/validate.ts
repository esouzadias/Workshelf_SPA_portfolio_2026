export function reqBody<T extends Record<string, any>>(body: any, required: (keyof T)[]) {
  if (!body || typeof body !== "object") return { ok: false, missing: required };
  const missing = required.filter(k => body[k as string] == null || body[k as string] === "");
  return missing.length ? { ok: false, missing } : { ok: true };
}