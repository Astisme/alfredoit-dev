/**
 * Client-side language detection & redirect.
 * 
 * This script:
 *  - Is invoked immediately when loaded.
 *  - Reuses localStorage language if present and valid.
 *  - Otherwise detects browser language and stores it.
 *  - Redirects to the preferred localized route when needed (including `/`).
 *  - Supported locales + default locale are expected to be passed in (e.g. from Astro layout) via a global variable or data attribute.
 * 
 * Requirements:
 *  - `astro.config.mjs` with `i18n` configured (locales, defaultLocale).
 *  - The layout / page must embed supported locales and default locale into the page in a way the script can read.
 *  - Locale-prefixed routes enabled (e.g. `/en/...`, `/it/...`).
 */

const LANGUAGE_STORAGE_KEY = "language";
const LOCALE_PATTERN = /^[a-z]{2}(?:-[a-z0-9]+)*$/;

/**
 * Check whether a locale code is safe to use in a URL path segment.
 * @param locale Locale code.
 * @returns True when the locale is a plain BCP-47-ish path segment.
 */
function isSafeLocale(locale: string): boolean {
  return LOCALE_PATTERN.test(locale);
}

/**
 * Keep only supported locale values that are safe URL path segments.
 * @param locales Raw locale values.
 * @returns Safe locale set.
 */
function getSafeSupportedLocales(locales: string[]): Set<string> {
  return new Set(
    locales
      .map((locale) => locale.toLowerCase())
      .filter(isSafeLocale)
  );
}

/**
 * Get the stored language from localStorage.
 * @returns The stored language code (e.g. "en", "it") if present, else null.
 */
function getStoredLanguage(): string | null {
  return localStorage.getItem(LANGUAGE_STORAGE_KEY);
}

/**
 * Save the language into localStorage.
 * @param lang The language code to store.
 */
function setStoredLanguage(lang: string): void {
  if (!lang) return;
  localStorage.setItem(LANGUAGE_STORAGE_KEY, lang);
}

/**
 * Detect browser language and pick one from supported locales.
 * @param supported Locales supported by the site.
 * @param defaultLocale Default locale if none matches.
 * @returns The detected locale (one of supported).
 */
function detectLanguage(supported: Set<string>, defaultLocale: string): string {
  const browserLang =
    (navigator.languages && navigator.languages[0]) ??
    navigator.language ??
    defaultLocale;

  const shortCode = browserLang.substring(0, 2).toLowerCase();
  if (supported.has(shortCode)) {
    return shortCode;
  }
  return defaultLocale;
}

/**
 * Normalize a pathname for lookup.
 * - Always starts with "/".
 * - Removes trailing slash except for "/".
 * @param pathname Raw pathname.
 * @returns Normalized pathname.
 */
function normalizePathname(pathname: string): string {
  const path = pathname.startsWith("/") ? pathname : `/${pathname}`;
  if (path.length > 1 && path.endsWith("/")) {
    return path.slice(0, -1);
  }
  return path;
}

/**
 * Add both slash variants for a path to a set.
 * This allows matching `/en/about` and `/en/about/`.
 * @param target Destination set.
 * @param pathname Path to register.
 */
function addPathVariants(target: Set<string>, pathname: string): void {
  const normalized = normalizePathname(pathname);
  target.add(normalized);
  if (normalized !== "/") {
    target.add(`${normalized}/`);
  }
}

/**
 * Remove locale prefix from pathname, if present.
 * @param pathname Current location pathname.
 * @param supported Supported locale codes.
 * @returns Path without locale prefix.
 */
function getPathWithoutLocale(pathname: string, supported: Set<string>): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  if (supported.has(segments[0])) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

/**
 * Build a locale-prefixed path for the target locale.
 * @param locale Locale code.
 * @param pathWithoutLocale Path without locale prefix.
 * @returns Localized path.
 */
function buildLocalePath(locale: string, pathWithoutLocale: string): string {
  if (!isSafeLocale(locale)) {
    return "/";
  }

  return pathWithoutLocale === "/"
    ? `/${locale}/`
    : `/${locale}${pathWithoutLocale}`;
}

/**
 * Check whether a redirect path is a safe same-origin absolute path.
 * @param pathname Path to validate.
 * @param supported Supported locale codes.
 * @returns True when the path cannot become a protocol-relative URL.
 */
function isSafeRedirectPath(pathname: string, supported: Set<string>): boolean {
  if (!pathname.startsWith("/") || pathname.startsWith("//")) return false;
  if (pathname.includes("\\")) return false;
  return getLocaleFromPath(pathname, supported) !== null;
}

/**
 * Build a browser redirect target from an allowlisted path.
 * @param pathname Safe path.
 * @param supported Supported locale codes.
 * @returns Relative same-origin redirect target, or null when unsafe.
 */
function buildRedirectTarget(
  pathname: string,
  supported: Set<string>
): string | null {
  if (!isSafeRedirectPath(pathname, supported)) return null;
  return pathname;
}

/**
 * Read locale from current pathname when the first segment is a known locale.
 * @param pathname Current location pathname.
 * @param supported Supported locale codes.
 * @returns Locale code or null when absent.
 */
function getLocaleFromPath(pathname: string, supported: Set<string>): string | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && supported.has(firstSegment) ? firstSegment : null;
}

type ParsedSitemapLocs = {
  urlLocs: string[];
  sitemapLocs: string[];
};

/**
 * Parse sitemap XML text and extract page and nested sitemap `loc` values.
 * @param xmlText Raw XML payload.
 * @returns Parsed sitemap location groups.
 */
function parseSitemapLocs(xmlText: string): ParsedSitemapLocs {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");
  if (doc.getElementsByTagName("parsererror").length > 0) {
    return { urlLocs: [], sitemapLocs: [] };
  }

  const urlLocs: string[] = [];
  const sitemapLocs: string[] = [];
  const locElements = Array.from(doc.getElementsByTagName("loc"));

  for (const locElement of locElements) {
    const parent = locElement.parentElement?.localName;
    const value = locElement.textContent?.trim();
    if (!value) continue;
    if (parent === "url") urlLocs.push(value);
    if (parent === "sitemap") sitemapLocs.push(value);
  }

  return { urlLocs, sitemapLocs };
}

/**
 * Convert a URL-like string to a same-origin URL.
 * @param value URL string (absolute or relative).
 * @returns Same-origin URL or null when invalid/cross-origin.
 */
function sameOriginUrl(value: string): URL | null {
  try {
    const url = new URL(value, location.origin);
    return url.origin === location.origin ? url : null;
  } catch {
    return null;
  }
}

/**
 * Extract a sitemap location path without trusting its origin for redirects.
 * @param value Sitemap location value.
 * @returns Pathname when URL is parseable, else null.
 */
function sitemapLocPath(value: string): string | null {
  try {
    return new URL(value, location.origin).pathname;
  } catch {
    return null;
  }
}

/**
 * Convert a nested sitemap location to a same-origin URL.
 * This preserves path/query but forces current origin, so absolute production
 * URLs in sitemap index still work in local dev (e.g. localhost).
 * @param value Sitemap location value.
 * @returns Same-origin sitemap URL, or null when invalid/unsafe.
 */
function nestedSitemapUrl(value: string): URL | null {
  try {
    const parsed = new URL(value, location.origin);
    if (!parsed.pathname.endsWith(".xml")) return null;
    if (!parsed.pathname.startsWith("/sitemap")) return null;
    return new URL(`${location.origin}${parsed.pathname}${parsed.search}`);
  } catch {
    return null;
  }
}

/**
 * Fetch text content from a same-origin URL.
 * Cross-origin and redirect responses are rejected.
 * @param url URL to fetch.
 * @returns Response text, or null on failure.
 */
async function fetchTextFromSameOrigin(url: URL | string): Promise<string | null> {
  const absolute = typeof url === "string" ? sameOriginUrl(url) : url;
  if (!absolute) return null;
  if (absolute.origin !== location.origin) return null;

  try {
    const response = await fetch(absolute.toString(), {
      credentials: "same-origin",
      redirect: "error"
    });
    if (!response.ok) return null;
    return await response.text();
  } catch {
    return null;
  }
}

/**
 * Build a set of allowed localized paths from generated sitemap files.
 * Falls back to locale roots when sitemap is unavailable.
 * @param supported Supported locale codes.
 * @returns Allowed localized path set (with slash variants).
 */
async function getAllowedLocalizedPathsFromSitemap(
  supported: Set<string>
): Promise<Set<string>> {
  const fallback = new Set<string>();
  for (const locale of supported) {
    addPathVariants(fallback, `/${locale}`);
  }

  const indexXml = await fetchTextFromSameOrigin("/sitemap-index.xml");
  if (!indexXml) {
    return fallback;
  }

  const fromIndex = parseSitemapLocs(indexXml);
  const allPageLocs = [...fromIndex.urlLocs];

  if (fromIndex.sitemapLocs.length > 0) {
    const nestedXmlTexts = await Promise.all(
      fromIndex.sitemapLocs.map(async (loc) => {
        const nestedUrl = nestedSitemapUrl(loc);
        if (!nestedUrl) return null;
        return await fetchTextFromSameOrigin(nestedUrl);
      })
    );

    for (const nestedXml of nestedXmlTexts) {
      if (!nestedXml) continue;
      const parsedNested = parseSitemapLocs(nestedXml);
      allPageLocs.push(...parsedNested.urlLocs);
    }
  }

  const allowed = new Set<string>();
  for (const loc of allPageLocs) {
    const pathname = sitemapLocPath(loc);
    if (!pathname) continue;
    addPathVariants(allowed, pathname);
  }

  // Ensure locale roots are always available as a safe fallback.
  for (const locale of supported) {
    addPathVariants(allowed, `/${locale}`);
  }

  if (allowed.size === 0) {
    return fallback;
  }
  return allowed;
}

/**
 * Immediately invoked redirect logic (first visit only).
 * @param supported Array of supported locale codes (e.g. ["en", "it"]).
 * @param defaultLocale The default locale (e.g. "en").
 */
async function redirectToPreferredLocale(
  supported: Set<string>,
  defaultLocale: string
): Promise<void> {
  const localeInPath = getLocaleFromPath(location.pathname, supported);
  if (localeInPath) {
    // User is already on a localized page: keep it and store as preference.
    setStoredLanguage(localeInPath);
    return;
  }

  const stored = getStoredLanguage();
  const preferred =
    stored && supported.has(stored)
      ? stored
      : detectLanguage(supported, defaultLocale);

  setStoredLanguage(preferred);

  // Build the new URL client-side (without server-only Astro i18n modules)
  const pathWithoutLocale = getPathWithoutLocale(location.pathname, supported);
  const localizedPath = buildLocalePath(preferred, pathWithoutLocale);
  const allowedPaths = await getAllowedLocalizedPathsFromSitemap(supported);
  const safeTargetPath = allowedPaths.has(localizedPath)
    ? localizedPath
    : `/${preferred}/`;
  const redirectTarget = buildRedirectTarget(safeTargetPath, supported);
  if (redirectTarget && location.pathname !== safeTargetPath) {
    location.replace(redirectTarget);
  }
}

// Immediately run: need supported/locales from page
// Read supported locales + defaultLocale from a global or data attribute
// Example: __ASTRO_LOCALES = { supported: ["en","it"], default: "en" }
const globalConfig = (window as any).__ASTRO_LOCALES;
if (
  globalConfig &&
  Array.isArray(globalConfig.supported) &&
  typeof globalConfig.default === "string"
) {
  const supported = getSafeSupportedLocales(globalConfig.supported);
  const defaultLocale = globalConfig.default.toLowerCase();

  if (supported.has(defaultLocale)) {
    void redirectToPreferredLocale(supported, defaultLocale);
  }
}
