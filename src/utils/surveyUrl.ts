/**
 * Resolves the public student survey URL dynamically based on environment:
 * - Production: https://unisole.org/survey/:slug
 * - Staging: https://stg.unisole.org/survey/:slug
 * - Local: uses VITE_SEO_URL or VITE_PUBLIC_SITE_URL or defaults to localhost:5180
 */
export function getSurveyPublicUrl(slug?: string): string {
  const envUrl = (import.meta as any).env?.VITE_SEO_URL || (import.meta as any).env?.VITE_PUBLIC_SITE_URL;
  if (envUrl) {
    const cleanBase = envUrl.replace(/\/$/, "");
    return slug ? `${cleanBase}/survey/${slug}` : `${cleanBase}/survey`;
  }

  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    // Staging environment check
    if (host.includes("stg") || host.includes("staging")) {
      return slug ? `https://stg.unisole.org/survey/${slug}` : `https://stg.unisole.org/survey`;
    }
    // Production environment check (non-localhost)
    if (!host.includes("localhost") && !host.includes("127.0.0.1") && !host.includes("0.0.0.0")) {
      return slug ? `https://unisole.org/survey/${slug}` : `https://unisole.org/survey`;
    }
  }

  // Local development fallback
  const port = (import.meta as any).env?.VITE_SEO_PORT || "5180";
  return slug ? `http://localhost:${port}/survey/${slug}` : `http://localhost:${port}/survey`;
}
