const html = document.documentElement;
const themeSelection = document.getElementById("theme-selection");
const light = document.getElementById("light-theme");
const dark = document.getElementById("dark-theme");
if(themeSelection == null || light == null || dark == null) {
  throw new Error("theme-selection, light or dark is null");
}
// check preferred color scheme and set dataset dark/light to html tag
const savedTheme = localStorage.getItem("theme");
if(savedTheme != null){
  html.dataset.theme = savedTheme;
  if (savedTheme == "dark") {
    light.classList.remove("hidden");
  } else {
    dark.classList.remove("hidden");
  }
} else {
  const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

  if (prefersDarkScheme.matches) {
    html.dataset.theme = "dark";
    localStorage.setItem("theme", "dark");
  } else {
    html.dataset.theme = "light";
    localStorage.setItem("theme", "light");
  }
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

// create spacebar listener to change color scheme
// if page is not contacts
const path = window.location.pathname.toString();
if (!path.includes("contacts")){
  document.addEventListener("keydown", e => {
    e.preventDefault();
    if (e.code === "Space") {
      html.dataset.theme === "dark" ? update("light") : update("dark");
    }
  });
}
