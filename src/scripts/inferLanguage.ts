/**
 * Client-side language detection & redirect (first-visit only).
 * 
 * This script:
 *  - Is invoked immediately when loaded.
 *  - Checks localStorage for a stored language; if found, does nothing.
 *  - If not found, detects browser language, compares to supported locales, and redirects to appropriate locale route.
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

/**
 * Immediately invoked redirect logic (first visit only).
 * @param supported Array of supported locale codes (e.g. ["en", "it"]).
 * @param defaultLocale The default locale (e.g. "en").
 */
function redirectToPreferredLocale(
  supported: string[],
  defaultLocale: string
): void {
  {
    // If already stored and valid, skip
    const stored = getStoredLanguage();
    if (stored && supported.includes(stored)) {
      return;
    }
  }

  // Detect & store
  const detected = detectLanguage(supported, defaultLocale);
  setStoredLanguage(detected);

  // If document html lang matches, skip redirect
  const htmlLang = document.documentElement.lang;
  if (htmlLang === detected) {
    return;
  }

  // Build the new URL client-side (without server-only Astro i18n modules)
  const oldUrl = new URL(location.href);
  const pathWithoutLocale = getPathWithoutLocale(location.pathname, supported);
  const localizedPath = buildLocalePath(detected, pathWithoutLocale);
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
