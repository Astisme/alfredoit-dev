const html = document.documentElement;
const themeSelection = document.getElementById("theme-selection");
const light = document.getElementById("light-theme");
const dark = document.getElementById("dark-theme");
if(themeSelection == null || light == null || dark == null) {
  throw new Error("theme-selection, light or dark is null");
}

const currentTheme = localStorage.getItem("theme");
if (currentTheme == "dark") {
  light.classList.remove("hidden");
} else {
  dark.classList.remove("hidden");
}

const update = (theme: string) => {
  const oldTheme = html.dataset.theme;
  if(oldTheme == theme) return;
  html.dataset.theme = theme;
  localStorage.setItem("theme", theme);
  light.classList.toggle("hidden");
  dark.classList.toggle("hidden");
};

themeSelection.addEventListener("click", () => {
  html.dataset.theme === "dark" ? update("light") : update("dark");
});

// listen for changes to color scheme preference
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");
prefersDarkScheme.addEventListener("change", mediaQuery => {
  mediaQuery.matches ? update("dark") : update("light");
});
