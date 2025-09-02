const dropdown = document.getElementById("dropdown");
const selected = dropdown.querySelector(".dropdown-selected");
const options = dropdown.querySelectorAll(".dropdown-option");

// Toggle dropdown
selected.addEventListener("click", () => {
    dropdown.classList.toggle("open");
});

// Option selection
options.forEach(option => {
    option.addEventListener("click", () => {
        selected.textContent = option.textContent;
        dropdown.classList.remove("open");
    });
});

// Close if clicked outside
document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove("open");
    }
});
