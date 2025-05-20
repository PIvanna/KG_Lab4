const getElement = document.querySelector.bind(document);

function changeDisplayFlex(elem) {
  elem.style.display =
    getComputedStyle(elem).display !== "flex" ? "flex" : "none";
}

function changeDisplayBlock(elem) {
  elem.style.display =
    getComputedStyle(elem).display !== "block" ? "block" : "none";
}
