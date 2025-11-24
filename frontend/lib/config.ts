const FALLBACK_PROD_API_BASE = "http://155.248.246.208:8100";
const FALLBACK_DEV_API_BASE = "http://155.248.246.208:8100";

const rawApiBase =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  process.env.API_BASE_URL ??
  (process.env.NODE_ENV === "production" ? FALLBACK_PROD_API_BASE : FALLBACK_DEV_API_BASE);

export const API_BASE_URL = rawApiBase.replace(/\/$/, "");

const rawMediaBase =
  process.env.NEXT_PUBLIC_MEDIA_BASE_URL ??
  process.env.MEDIA_BASE_URL ??
  `${API_BASE_URL}/media`;

export const MEDIA_BASE_URL = rawMediaBase.replace(/\/$/, "");
