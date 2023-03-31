const timeline = document.getElementById("timeline");
if(timeline == null) {
  throw new Error("timeline is null");
}
timeline.setAttribute("style", `--perc: 0%;`);

// https://stackoverflow.com/a/73708272/15039921
const scrollMaxValue = () => {
  const body = document.body;
  const html = document.documentElement;
  const documentHeight = Math.max(
    body.scrollHeight, body.offsetHeight,
    //timeline.scrollHeight, timeline.offsetHeight,
    html.clientHeight, html.scrollHeight, html.offsetHeight
  );
  const windowHeight = window.innerHeight || html.clientHeight || body.clientHeight;
  return documentHeight - windowHeight;
};
const pageHeight = scrollMaxValue();//px
document.documentElement.style.setProperty('--page-height', `${pageHeight}`);

const cardHolder = document.getElementById("timecard-holder");
if(cardHolder == null) {
  throw new Error("cardHolder is null");
}
const cards = cardHolder.children!!;
const cardsArray = Array.from(cards);
const cardsNumber = cards.length || 1;
const percPerCard = 100 / cardsNumber;

let activeCardNum: number | null = null;
let scrolledToTheEnd: boolean = false;
//capture window-scroll and update the perc variable
const scrollHandler = () => {
  //console.log("scrolling");
  const y = window.scrollY;
  const midperc = y / pageHeight * 100;
  const perc = midperc > 0 && midperc < 100 ? midperc : (midperc <= 0 ? 0 : 100);
  scrolledToTheEnd = scrolledToTheEnd || perc >= 95;
  //const currentPerc = Number(timeline.style.getPropertyValue("--perc").replace("%",""));
  //const newPerc = currentPerc + perc;
  //const fixedNewPerc = newPerc > 0 ? 0 : newPerc % 100;

  timeline.setAttribute("style", `--perc: ${perc}%;`);
  //console.log({midperc,perc});
  //timeline.setAttribute("style", `--perc: ${fixedNewPerc}%;`);

  cardsArray.forEach(card => {
    const cardNumber = card.style.order;
    if(cardNumber == null) {
      throw new Error("cardNumber is null");
    }
    const cardNumberInt = parseInt(cardNumber);

    if(!scrolledToTheEnd && activeCardNum != null && (cardNumberInt < activeCardNum-1 || cardNumberInt > activeCardNum+1)){
      // this card is not in the active card's range and it is already hidden
      return;
    }

    if(perc < 100 && !scrolledToTheEnd){
      if((perc >= percPerCard*cardNumberInt && perc < percPerCard*(cardNumberInt + 1))){
        //|| (perc === 100 && cardNumberInt === cardsNumber - 1)) {
        card.style.visibility = "visible";
        card.style.opacity = "1";
        activeCardNum = cardNumberInt;
      }
      else {
        card.style.visibility = "hidden";
        card.style.opacity = "0";
      }
    }
    else {
      //the user has scrolled to the bottom of the page
      //show all cards
      card.style.visibility = "visible";
      card.style.opacity = "1";
    }
  });//cardsArray.forEach
};//document.addEventListener
document.addEventListener("scroll", scrollHandler);


//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
/*
// when the user holds the point-on-line-wrapper, scroll the page
// thanks to https://stackoverflow.com/a/58358759/15039921
let mousePosition = null;
const pointOnLineWrapper = document.getElementById("point-on-line-wrapper");
if(pointOnLineWrapper == null) {
  throw new Error("pointOnLineWrapper is null");
}
const pointBaseline = pointOnLineWrapper.getBoundingClientRect().top;

const mousemoveHandler = (event) => {
  const dy = event.clientY - mousePosition.clientY;
  mousePosition = event;

  if(dy === 0)
    return;

  //const isMovingUp = dy < 0;
  const currentPercNum = Number(timeline.style.getPropertyValue("--perc").replace("%", ""));
  //const maxPx = Number(getComputedStyle(document.documentElement).getPropertyValue("--timeline-height").replace("px", ""));
  const maxPx = pageHeight;
  const currentPx = currentPercNum * maxPx / 100;
  //const pageHeight = document.documentElement.scrollHeight;
  //const mouseYperc = event.clientY * 100 / pageHeight;
  //const mouseYperc = dy * 100 / pageHeight;
  const mouseYperc = (event.clientY - pointBaseline) * 100 / pageHeight;
  const windowHeight = window.innerHeight;
  //const mouseYperc = event.clientY * 100 / windowHeight;
  const fixedMouseYperc = mouseYperc > 0 && mouseYperc < 100 ? mouseYperc : (mouseYperc <= 0 ? 0 : 100);
  //const fixedMouseYperc10 = fixedMouseYperc * 10 <= 100 ? fixedMouseYperc * 10 : 100;
     //const newPx = currentPx + dy;
     //const fixedPx = newPx > 0 && newPx < maxPx ? newPx : (newPx <= 0 ? 0 : maxPx);
     //const newPerc = fixedPx * 100 / maxPx;
     //timeline.setAttribute("style", `--perc: ${newPerc}%;`);
  timeline.setAttribute("style", `--perc: ${fixedMouseYperc}%;`);
  //timeline.setAttribute("style", `--perc: ${fixedMouseYperc10}%;`);
  //dy to perc
  const dyPerc = dy * 100 / maxPx;
  console.log({pageHeight,dy,currentPercNum,currentPx,mouseYperc,fixedMouseYperc,windowHeight,dyPerc,dy10:dy*10});
  window.scrollBy(0, dy*10);
};
const mouseupHandler = () => {
  mousePosition = null;
  pointOnLineWrapper.style.cursor = "grab";
  pointOnLineWrapper.style.removeProperty("user-select");
  document.removeEventListener("mousemove", mousemoveHandler);
  document.removeEventListener("mouseup", mouseupHandler);
  document.addEventListener("scroll", scrollHandler);
};
const mousedownHandler = (event) => {
  mousePosition = event;
  pointOnLineWrapper.style.cursor = "grabbing";
  pointOnLineWrapper.style.userSelect = "none";
  document.addEventListener("mousemove", mousemoveHandler);
  document.addEventListener("mouseup", mouseupHandler);
  document.removeEventListener("scroll", scrollHandler);
};

pointOnLineWrapper.addEventListener("mousedown", mousedownHandler);
*/
