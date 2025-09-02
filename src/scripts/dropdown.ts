const dropdown = document.getElementById("dropdown");
if(dropdown == null)
    throw new Error('could not find dropdown');
const selected = dropdown.querySelector(".dropdown-selected");
const optionEls = dropdown.querySelectorAll(".dropdown-option");
if(selected == null || optionEls == null)
    throw new Error('could not initialize variables');

// helper: hide all containers, show one
function showContainer(id) {
    document.querySelectorAll("[data-dropdown-id]").forEach(c => {
        console.log(c);
        c.style.display = (c.getAttribute("data-dropdown-id") === id) ? "block" : "none";
    });
}

// init
const firstId = optionEls[0]?.dataset.id;
showContainer(firstId);

// open/close dropdown
selected.addEventListener("click", () => {
    dropdown.classList.toggle("open");
});

// select option
optionEls.forEach(opt => {
    opt.addEventListener("click", () => {
        const text = opt.textContent;
        const id = opt.dataset.id;
        selected.textContent = text;
        dropdown.classList.remove("open");
        showContainer(id);
    });
});

// close if clicked outside
document.addEventListener("click", (e) => {
    if (!dropdown.contains(e?.target)) {
        dropdown.classList.remove("open");
    }
});
