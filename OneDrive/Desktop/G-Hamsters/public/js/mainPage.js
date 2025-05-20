document.addEventListener("DOMContentLoaded", function () {
  const toggles = document.querySelectorAll(".sidebar .toggle");
console.log(toggles)
  toggles.forEach((toggle) => {
    toggle.addEventListener("click", function (e) {
      e.preventDefault();
      const next = this.nextElementSibling;

      if (next && next.classList.contains("sub-menu")) {
        next.classList.toggle("active");
        this.classList.toggle("open");
      }
    });
  });
});
