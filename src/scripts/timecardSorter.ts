const holder = document.getElementById("timecard-holder");
if (holder == null) {
  throw new Error("holder is null");
}
const cards: HTMLCollection = holder.children;
const cardsArray = Array.from(cards);
let index = 0;

cardsArray
  .sort((a, b) => {
    const aDateBegin = a.getAttribute("data-datebegin");
    const bDateBegin = b.getAttribute("data-datebegin");
    if (aDateBegin == null || bDateBegin == null) {
      throw new Error("aDateBegin or bDateBegin is null");
    }
    const aParsedDate = Date.parse(aDateBegin);
    const bParsedDate = Date.parse(bDateBegin);
    return bParsedDate - aParsedDate;
  })
  .forEach((entry) => {
    entry.style.flex = "1 0 auto";
    entry.style.order = index.toString();
    if (index !== 0) {
      entry.style.visibility = "hidden";
      entry.style.opacity = "0";
    } else {
      entry.style.visibility = "visible";
      entry.style.opacity = "1";
    }
    index++;
  });
