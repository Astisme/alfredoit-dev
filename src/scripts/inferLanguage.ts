const languageSessionKey = "language";
import { WEBSITE_URL } from "../config";

function setSessionLanguage(language: str){
  if(language == null) return
  window.localStorage.setItem(languageSessionKey, language); 
}

function getLanguage(){
  const language = window.localStorage.getItem(languageSessionKey);
  if (language != null) {
    return language;
  }
  if (navigator.languages && navigator.languages.length) {
    const navLang = navigator.languages[0];
    setSessionLanguage(navLang);
    return navLang;
  }
  const userLanguage = navigator.userLanguage || navigator.language || navigator.browserLanguage || 'en';
  setSessionLanguage(userLanguage);
  return userLanguage;
}

function getCurrentPage(){
  return document.URL || window.location.href || `${WEBSITE_URL}`;
}

const lang = getLanguage().substring(0,2);
const html = document.documentElement;
if(html == null)
  throw new Error("Could not find html tag");
  
//get lang on html
const htmlLang = html.lang;
console.log({lang, htmlLang});
if(!lang.includes(htmlLang)){
  //setSessionLanguage('it');
  const url = getCurrentPage();
  //const thisUrl = url.substring(url.indexOf('http://localhost:3000/')+22);
  const thisUrl = url.substring(url.indexOf(WEBSITE_URL)+WEBSITE_URL.length);
  console.log({thisUrl});
  //redirect
  const newLang = lang === 'en' ? 'it' : 'en';
  const thisPage = newLang === 'it' ? thisUrl.substring(0,thisUrl.indexOf('it')) : thisUrl;
  console.log({thisPage, newLang});
  setSessionLanguage(newLang);
  window.location = `${thisPage}/${newLang !== 'en' ? newLang : ''}`
}

//set listeners for language selection to prevent keeping the user stuck to browserLanguage
const languageLinks = document.querySelectorAll('#language-selection > a');
for(const langLink of languageLinks){
  langLink.addEventListener('click', () => {
    const newLang = langLink.dataset.languageTo;
    setSessionLanguage(newLang);
  });
}
