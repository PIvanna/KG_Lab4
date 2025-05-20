function includeHTML(file, elementId) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      document.getElementById(elementId).innerHTML = data;
    })
    .catch((error) => console.error(`Error loading ${file}:`, error));
}

function loadMainContent(path) {
  const wrapper = document.querySelector(".main-wraper");
  fetch(path)
    .then((res) => {
      if (!res.ok) throw new Error(`File not found: ${path}`);
      return res.text(); 
    })
    .then((html) => {
      wrapper.innerHTML = html;
    })
    .catch((err) => {
      console.error(err);
      wrapper.innerHTML = "<h2>Сторінку не знайдено</h2>";
    });
}

function includeHTML(file, elementId) {
  fetch(file)
    .then((response) => response.text())
    .then((data) => {
      const target = document.getElementById(elementId);
      if (target) {
        target.innerHTML = data;
      }
    })
    .catch((error) => console.error(`Error loading ${file}:`, error));
}

document.addEventListener("DOMContentLoaded", () => {
  includeHTML("components/header.html", "header-placeholder");
  loadMainContent("head.html");

  // Клік по пункту меню
  document.querySelectorAll(".toggle[data-file]").forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const file = link.getAttribute("data-file");
      loadMainContent(file);
      // Позначити активний
      document
        .querySelectorAll(".toggle")
        .forEach((el) => el.classList.remove("active"));
      link.classList.add("active");
    });
  });

});
