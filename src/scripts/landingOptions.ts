const containers = document.querySelectorAll(".typed-text-container");
if(containers.length == 0) {
  throw new Error("No typed-text-container found");
}
const headings = document.querySelectorAll(".typed-text-container > .typed-text > h2");
if(headings.length == 0) {
  throw new Error("No heading found");
} else if(containers.length != headings.length) {
  console.error({containers,headings});
  throw new Error("Number of containers and headings do not match");
}

const select = document.getElementById("select-heading");
if(select == null) {
  throw new Error("select-heading not found");
}

//Create an option for each heading
const idifyText = (text : string) => {
  return text.toLowerCase().replace(/ /g,'-').replace('?','');
}
for(let i=0; i<headings.length; i++){
  const option = document.createElement("option");
  const heading = headings[i];
  if(heading == null){
    continue;
  }
  const text = idifyText(heading.innerText);
  option.value = text;
  option.text = heading.innerText
  select.appendChild(option);

  //hide all containers except the first
  if(i > 0) {
    containers[i].style.display = "none";
  }
}
