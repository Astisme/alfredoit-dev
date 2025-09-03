const languageSessionKey = "language";
import { WEBSITE_URL } from "@config";
//const WEBSITE_URL = 'http://localhost:3000/';

function setSessionLanguage(language: str) {
  if (language == null) return;
  window.localStorage.setItem(languageSessionKey, language);
}

function getLanguage() {
  const language = window.localStorage.getItem(languageSessionKey);
  if (language != null && language.length >= 2) {
    return [language, false];
  }
  if (navigator.languages && navigator.languages.length) {
    const navLang = navigator.languages[0];
    setSessionLanguage(navLang);
    return [navLang, true];
  }
  const userLanguage = navigator.userLanguage || navigator.language ||
    navigator.browserLanguage || "en";
  setSessionLanguage(userLanguage);
  return [userLanguage, true];
}

function getCurrentPage() {
  return document.URL || window.location.href || `${WEBSITE_URL}`;
}

const langoutput = getLanguage();
const lang = langoutput[0].substring(0, 2);
const wasInferred = langoutput[1];
const html = document.documentElement;
if (html == null) {
  throw new Error("Could not find html tag");
}

//get lang on html
const htmlLang = html.lang;
//console.log({lang, htmlLang, wasInferred});
if (wasInferred && htmlLang != lang) {
  //setSessionLanguage('it');
  const url = getCurrentPage();
  if (url.includes(WEBSITE_URL)) {
    //const thisUrl = url.substring(url.indexOf('http://localhost:3000/')+22);
    const thisUrl = url.substring(
      url.indexOf(WEBSITE_URL) + WEBSITE_URL.length,
    );
    //this removes everything after /it or get all the url from the en version
    const newLang = lang === "en" ? "it" : "en";
    let thisPage = newLang === "it"
      ? thisUrl.substring(0, thisUrl.indexOf("/it"))
      : thisUrl;
    //remove trailing /
    thisPage = thisPage.endsWith("/")
      ? thisPage.substring(0, thisPage.length - 1)
      : thisPage;
    //remove queries
    thisPage = thisPage.split("?")[0];
    setSessionLanguage(lang);
    window.location = `/${thisPage}/${lang !== "en" ? lang : ""}`;
  }
}

//set listeners for language selection to prevent keeping the user stuck to browserLanguage
const languageLinks = document.querySelectorAll("#language-selection > a");
for (const langLink of languageLinks) {
  langLink.addEventListener("click", () => {
    const newLang = langLink.dataset.languageTo;
    setSessionLanguage(newLang);
  });
}
