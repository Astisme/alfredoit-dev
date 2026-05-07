const menu = document.getElementById("mobile-arc-items");
const toggle = document.getElementById("mobile-arc-toggle");
const themeButton = document.getElementById("mobile-theme-button");
const mobileLightTheme = document.getElementById("mobile-light-theme");
const mobileDarkTheme = document.getElementById("mobile-dark-theme");
const langButton = document.getElementById("mobile-lang-button");
const mobileMenu = document.querySelector(".mobile-arc-menu") as HTMLElement | null;

const updateBottomOffset = () => {
  if (!mobileMenu) return;
  const footer = document.querySelector("footer");
  if (!footer) return;
  const footerRect = footer.getBoundingClientRect();
  const offset = Math.max(14, Math.round(footerRect.height));
  mobileMenu.style.setProperty("--mobile-arc-bottom-offset", `${offset}px`);
};

if (menu && toggle) {
  updateBottomOffset();
  globalThis.addEventListener("resize", updateBottomOffset);
  toggle.textContent = "+";
  let autoCloseTimer: number | undefined;
  let hideMenuTimer: number | undefined;
  const hideDelay = 260;

  const closeMenu = (immediate = false) => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.textContent = "+";
    if (autoCloseTimer) {
      globalThis.clearTimeout(autoCloseTimer);
      autoCloseTimer = undefined;
    }
    if (hideMenuTimer) {
      globalThis.clearTimeout(hideMenuTimer);
      hideMenuTimer = undefined;
    }
    if (immediate) {
      menu.classList.add("is-hidden");
      return;
    }
    hideMenuTimer = globalThis.setTimeout(() => {
      menu.classList.add("is-hidden");
      hideMenuTimer = undefined;
    }, hideDelay);
  };

  const openMenu = () => {
    if (hideMenuTimer) {
      globalThis.clearTimeout(hideMenuTimer);
      hideMenuTimer = undefined;
    }
    menu.classList.remove("open");
    menu.classList.remove("is-hidden");
    void (menu as HTMLElement).offsetHeight;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => menu.classList.add("open"));
    });
    toggle.setAttribute("aria-expanded", "true");
    toggle.textContent = "-";
    autoCloseTimer = globalThis.setTimeout(() => closeMenu(), 5000);
  };

  const touchMenu = () => {
    if (!menu.classList.contains("open")) return;
    if (autoCloseTimer) globalThis.clearTimeout(autoCloseTimer);
    autoCloseTimer = globalThis.setTimeout(() => closeMenu(), 5000);
  };

  const syncThemeButtonState = () => {
    if (!themeButton || !mobileLightTheme || !mobileDarkTheme) return;
    const html = document.documentElement;
    const lightTip = themeButton.getAttribute("data-light-tip") ?? "Turn on the lights";
    const darkTip = themeButton.getAttribute("data-dark-tip") ?? "Turn off the lights";
    const isDark = html.dataset.theme === "dark";
    themeButton.setAttribute("title", isDark ? lightTip : darkTip);
    themeButton.setAttribute("aria-label", isDark ? lightTip : darkTip);
    mobileLightTheme.classList.toggle("hidden", !isDark);
    mobileDarkTheme.classList.toggle("hidden", isDark);
  };

  syncThemeButtonState();
  new MutationObserver(syncThemeButtonState).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"]
  });

  toggle.addEventListener("click", () => {
    const isOpen = menu.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  });

  menu.addEventListener("pointerdown", touchMenu);
  menu.addEventListener("keydown", touchMenu);

  themeButton?.addEventListener("click", () => {
    const themeSelection = document.getElementById("theme-selection");
    themeSelection?.dispatchEvent(new Event("click", { bubbles: true }));
    syncThemeButtonState();
    closeMenu();
  });

  langButton?.addEventListener("click", () => closeMenu());
  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => closeMenu());
  });

  const searchParams = new URLSearchParams(location.search);
  if (searchParams.size > 0 && langButton instanceof HTMLAnchorElement) {
    const url = new URL(langButton.href);
    searchParams.forEach((value, key) => url.searchParams.set(key, value));
    langButton.href = url.toString();
  }
}
