const h1 = document.getElementById("hacker-text");

if (h1 == null) {
  throw new Error("Could not find any hacker-text");
}

const alphabet = "abcdefghijklmnopqrstuvwxyz";
const intervalTime = 30;
const original = h1.innerText;

const phone = window.matchMedia("(hover: none)");
const event = phone.matches ? "click" : "mouseover";

h1.addEventListener(event, () => {
  let interval;
  const lettersNumber = h1.innerText.length;
  const totalTime = 100 * (lettersNumber + 1);

  for (let i = 0; i < lettersNumber; i++) {
    setTimeout(() => {
      if (interval != null) {
        clearInterval(interval);
      }
      interval = setInterval(() => {
        h1.innerText = h1.innerText.split("").map((_, index) =>
          index <= i
            ? original[index]
            : alphabet[Math.floor(Math.random() * alphabet.length)]
        ).join("");
      }, intervalTime);
    }, 100 * (i + 1));
  }

  //backup
  setTimeout(() => {
    if (interval != null) {
      clearInterval(interval);
    }
  }, totalTime);
});
