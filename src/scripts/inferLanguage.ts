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
 *  - `astro:i18n` module available to compute localized URLs (`getRelativeLocaleUrl`).
 */

import { getRelativeLocaleUrl } from "astro:i18n";
import { WEBSITE_URL } from "@config";

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
    (navigator as any).userLanguage ??
    defaultLocale;

  const shortCode = browserLang.substring(0, 2).toLowerCase();
  if (supported.includes(shortCode)) {
    return shortCode;
  }
  return defaultLocale;
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

  // Build the new URL via Astro i18n helper
  const oldUrl = new URL(location.href);
  const newRelativeUrl = getRelativeLocaleUrl(detected, location.pathname.slice(3));
  const newUrl = new URL(`${oldUrl.origin}${newRelativeUrl}`);
  if (newUrl && location.pathname !== newUrl) {
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
