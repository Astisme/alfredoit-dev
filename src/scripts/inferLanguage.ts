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
function detectLanguage(supported: string[], defaultLocale: string): string {
  const browserLang =
    (navigator.languages && navigator.languages[0]) ??
    navigator.language ??
    defaultLocale;

  const shortCode = browserLang.substring(0, 2).toLowerCase();
  if (supported.includes(shortCode)) {
    return shortCode;
  }
  return defaultLocale;
}

function getPathWithoutLocale(pathname: string, supported: string[]): string {
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return "/";
  if (supported.includes(segments[0])) {
    const rest = segments.slice(1).join("/");
    return rest ? `/${rest}` : "/";
  }
  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

function buildLocalePath(locale: string, pathWithoutLocale: string): string {
  return pathWithoutLocale === "/"
    ? `/${locale}/`
    : `/${locale}${pathWithoutLocale}`;
}

function hasLocalePrefix(pathname: string, supported: string[]): boolean {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return !!firstSegment && supported.includes(firstSegment);
}

function getLocaleFromPath(pathname: string, supported: string[]): string | null {
  const firstSegment = pathname.split("/").filter(Boolean)[0];
  return firstSegment && supported.includes(firstSegment) ? firstSegment : null;
}

/**
 * Immediately invoked redirect logic (first visit only).
 * @param supported Array of supported locale codes (e.g. ["en", "it"]).
 * @param defaultLocale The default locale (e.g. "en").
 */
function redirectToPreferredLocale(
  supported: string[],
  defaultLocale: string
): void {
  const localeInPath = getLocaleFromPath(location.pathname, supported);
  if (localeInPath) {
    // User is already on a localized page: keep it and store as preference.
    setStoredLanguage(localeInPath);
    return;
  }

  const stored = getStoredLanguage();
  const preferred =
    stored && supported.includes(stored)
      ? stored
      : detectLanguage(supported, defaultLocale);

  setStoredLanguage(preferred);

  // Build the new URL client-side (without server-only Astro i18n modules)
  const oldUrl = new URL(location.href);
  const pathWithoutLocale = getPathWithoutLocale(location.pathname, supported);
  const localizedPath = buildLocalePath(preferred, pathWithoutLocale);
  const newUrl = new URL(`${oldUrl.origin}${localizedPath}`);
  if (location.pathname !== newUrl.pathname) {
    if(oldUrl.searchParams.size > 0)
      newUrl.search = oldUrl.search;
    location.replace(newUrl);
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
  redirectToPreferredLocale(globalConfig.supported, globalConfig.default);
}
