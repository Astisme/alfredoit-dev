const holder = document.getElementById("timecard-holder");
if(holder == null) {
  throw new Error("holder is null");
}
const cards: HTMLCollection = holder.children;
let cardsArray = Array.from(cards);

// if the user is on mobile device, remove the wrapper (data-is-wrapper="true")
const isMobile = window.matchMedia("only screen and (max-width: 768px)").matches;
if(isMobile) {
  //const wrappers = document.querySelectorAll("[data-is-wrapper='true']");
  const removeWrappers = htmlElements => {
    const elementsArray = Array.from(htmlElements);
    elementsArray.forEach(entry => {
      const probableWrapper = entry.children[0];
      if(probableWrapper.dataset !== undefined && probableWrapper.dataset["iswrapper"] === "true") {
        let children = probableWrapper.getElementsByTagName("article")[0].children;
        const childrenArray = Array.from(children);
        children = removeWrappers(children);
        elementsArray.push(...children);
        elementsArray.splice(elementsArray.indexOf(entry), 1);

        holder.append(...children);
        holder.removeChild(entry);

        const wrapperLink = probableWrapper.getElementsByTagName("a")[0].href;
        for (const child of children) {
          const usefulFather = child.children[0];
          const header = usefulFather.getElementsByTagName("h3")[0];

          const a = document.createElement("a");
          a.href = wrapperLink;
          a.target = "_blank";

          usefulFather.insertBefore(a, header);
          usefulFather.removeChild(header);
          //show the header inside the link
          a.append(header);
        }
      }
    });
    return elementsArray;
  }

  console.log({when:"before",cardsArray,cards});
  cardsArray = removeWrappers(cards);
  console.log({when:"after",cardsArray,cards});
}

let index = 0;


cardsArray
.sort((a, b) => {
  const aDateBegin = a.getAttribute("data-datebegin");
  const bDateBegin = b.getAttribute("data-datebegin");
  if(aDateBegin == null || bDateBegin == null) {
    console.log({a,aDateBegin,b,bDateBegin});
    throw new Error("aDateBegin or bDateBegin is null");
  }
  const aParsedDate = Date.parse(aDateBegin);
  const bParsedDate = Date.parse(bDateBegin);
  return bParsedDate - aParsedDate;
})
.forEach(entry => {
  entry.style.flex = "1 0 auto";
  entry.style.order = index.toString()
  if(index !== 0) {
    entry.style.visibility = "hidden";
    entry.style.opacity = "0";
  }
  else {
    entry.style.visibility = "visible";
    entry.style.opacity = "1";
  }
  index++;
});
