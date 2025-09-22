const containers = document.querySelectorAll(".typed-text-container");
if (containers.length == 0) {
  throw new Error("No typed-text-container found");
}
let activeContainer = containers[0];

let taggedArray = [];
let typingInterval = null;

const getTypedHTMLElement = () => {
  const typedText = activeContainer.querySelector(".typed-text");
  if (typedText == null) throw new Error("No typed-text found");
  return typedText;
};

const resetText = () => {
  const typedText = getTypedHTMLElement();

  let currentHTML = typedText.innerHTML;
  currentHTML = currentHTML.substring(0, currentHTML.length - 4); //remove trailing </p>
  typedText.innerHTML = currentHTML + taggedArray.join("");
  taggedArray = [];
};

const typingAnimation = () => {
  const typedText = getTypedHTMLElement();

  const typedTextHTML = typedText.innerHTML;
  const h2tagIndex = typedTextHTML.indexOf("</h2>") + 5;
  const textArray = typedTextHTML
    .substring(h2tagIndex, typedTextHTML.length)
    .split("").filter((x) => x !== "\n");
  typedText.innerHTML = typedTextHTML.substring(0, h2tagIndex);
  //taggedArray contains everything in textArray but has the opening and closing HTML tags as a single element of the array
  taggedArray = [];

  let i = 0;
  while (i < textArray.length) {
    if (textArray[i] === "<") {
      let tag = "";
      while (textArray[i] !== ">") {
        tag += textArray[i];
        i++;
      }
      tag += ">";
      taggedArray.push(tag);
    } else {
      taggedArray.push(textArray[i]);
    }
    i++;
  }

  let shownText = "" + typedText.innerHTML;
  const wpm = 2000;
  const msPerWord = 60000 / wpm;
  const msPerLetter = msPerWord / 5;

  typingInterval = setInterval(() => {
    const newLetter = taggedArray.shift();
    if (newLetter == null) {
      clearInterval(typingInterval);
      return;
    }
    shownText += newLetter;
    typedText.innerHTML = shownText;
  }, msPerLetter);
};

addEventListener("message", (e) => {
  if (e.origin != location.origin || e.data.what !== "select") {
    return;
  }
  if (typingInterval != null) {
    resetText();
    clearInterval(typingInterval);
  }
  //when the select is changed, hide the current container and show the one selected
  const selected = e.data.id;
  //get index of selected container
  const selectedContainer = containers[
    Array.from(containers).findIndex((container) =>
      container.querySelector(`#${selected}`) !== null
    )
  ];

  activeContainer.style.display = "";
  selectedContainer.style.display = "block";
  activeContainer = selectedContainer;

  typingAnimation();
});
