"use strict";

const colorModeElement = document.getElementById("colorMode");
const icon = colorModeElement.firstElementChild;
const body = document.body;

colorModeElement.addEventListener("click", () => {
	toggleDarkRecursively(body);

	colorModeElement.classList.toggle("btn-light");
	colorModeElement.classList.toggle("btn-dark-custom");
	icon.classList.toggle("fa-sun");
	icon.classList.toggle("fa-moon");
});

function toggleDarkRecursively(element) {
	if(element === colorModeElement)
		return;
	for(const children of element.children){
		toggleDarkRecursively(children);
	}
	element.classList.toggle("dark");
}