const rawApiUrl =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

function normalizarApiUrl(value) {
  let url = String(value || "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\/+$/, "");

  if (!url) return "http://localhost:3000/api";

  if (!/^https?:\/\//i.test(url)) {
    url = `https://${url}`;
  }

  return url.endsWith("/api") ? url : `${url}/api`;
}

export const API_URL = normalizarApiUrl(rawApiUrl);

export default API_URL;
