import { isMobile } from "./helper.ts";

const timeline = document.getElementById("timeline");
if(timeline == null) {
  throw new Error("timeline is null");
}
timeline.setAttribute("style", `--perc: 0%;`);

const footer = document.querySelector('footer');
const footerSpacer = document.getElementById('footer-spacer');
if(footer == null || footerSpacer == null)
  throw new Error("footer or footerSpacer is null");

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
document.addEventListener("scroll", () => {
  const y = window.scrollY;
  const midperc = y / pageHeight * 100;
  let perc = midperc > 0 && midperc < 100 ? midperc : (midperc <= 0 ? 0 : 100);
  scrolledToTheEnd = scrolledToTheEnd || perc >= 95;

  if(perc < 98){
    timeline.setAttribute("style", `--perc: ${perc}%;`);
  }

  let interval;
  cardsArray.forEach(card => {
    const cardNumber = card.style.order;
    if(cardNumber == null) {
      throw new Error("cardNumber is null");
    }
    const cardNumberInt = parseInt(cardNumber);

    if(!scrolledToTheEnd && activeCardNum != null &&
         (cardNumberInt < activeCardNum-1 || cardNumberInt > activeCardNum+1)
      ){
      // this card is not in the active card's range and it is already hidden
      return;
    }

    if(scrolledToTheEnd){
      //the user has scrolled to the bottom of the page
      //show all cards
      card.style.visibility = "visible";
      card.style.opacity = "1";
      if(perc >= 98 && interval == null && isMobile()){
        interval = setInterval(() => {
          perc += 0.02;
          if(perc >= 100){
            clearInterval(interval);
            perc = 100;
          }
          console.log(perc);
          timeline.setAttribute("style", `--perc: ${perc}%;`);
        }, 20);
      }



      return;
    }

    if( (perc >= (percPerCard*cardNumberInt) &&
       perc < (percPerCard*(cardNumberInt +1 )) )
      ){
      //|| (perc === 100 && cardNumberInt === cardsNumber - 1)) {
      card.style.visibility = "visible";
      card.style.opacity = "1";
      activeCardNum = cardNumberInt;
    }
    else if ((cardNumberInt === activeCardNum + 1 || cardNumberInt === activeCardNum - 1) &&
             (perc < percPerCard * (activeCardNum+1)) && perc > percPerCard * (activeCardNum-1)
            ){
      card.style.visibility = "visible";
      card.style.opacity = "1";
    }
    else {
      card.style.visibility = "hidden";
      card.style.opacity = "0";
    }
  });//cardsArray.forEach
});
