const API_BASE =
  import.meta.env.VITE_API_COMPANY ||
  import.meta.env.VITE_API_VENDOR ||
  "http://localhost:5000";

const LOCAL_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;
const LOCAL_NO_SCHEME_RE = /^(localhost|127\.0\.0\.1)(:\d+)?\//i;
const LOCAL_PROTOCOL_RELATIVE_RE = /^\/\/(localhost|127\.0\.0\.1)(:\d+)?/i;

const trimTrailingSlash = (value = "") => value.replace(/\/$/, "");

export function normalizeAssetUrl(value) {
  if (!value) return value;

  const raw = String(value).trim();
  if (!raw) return raw;

  if (raw.startsWith("data:") || raw.startsWith("blob:")) {
    return raw;
  }

  const base = trimTrailingSlash(API_BASE);

  if (LOCAL_NO_SCHEME_RE.test(raw)) {
    return `${base}/${raw.replace(LOCAL_NO_SCHEME_RE, "")}`;
  }

  if (LOCAL_PROTOCOL_RELATIVE_RE.test(raw)) {
    return raw.replace(LOCAL_PROTOCOL_RELATIVE_RE, base);
  }

  if (LOCAL_ORIGIN_RE.test(raw)) {
    return raw.replace(LOCAL_ORIGIN_RE, base);
  }

  if (raw.startsWith("/uploads/")) {
    return `${base}${raw}`;
  }

  if (raw.startsWith("uploads/")) {
    return `${base}/${raw}`;
  }

  return raw;
}
