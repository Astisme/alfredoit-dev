// if on mobile, hide the language selector
const isMobile = window.matchMedia("only screen and (max-width: 768px)");
if(isMobile.matches) {
  document.querySelectorAll("#language-selection > a")
    .forEach(button => button.classList.add("hidden"));
}
