const getElement = (selector) => document.querySelector(selector);

const form = getElement("form");
const inputName = getElement("#name_curve");
const blockError = getElement(".error");
let count;
let curvesArrayJSON = null;
let curvesArrayDeleted = null;

document.addEventListener("DOMContentLoaded", function () {
  if (localStorage.getItem("countCreatedCurve") !== null) {
    count = Number(localStorage.getItem("countCreatedCurve")); // Приводимо до числа
  } else {
    count = 0;
    localStorage.setItem("countCreatedCurve", count); // Зберігаємо як рядок
  }

  if (localStorage.getItem("curvesArrayJSON") == null) {
    localStorage.setItem("curvesArrayJSON", JSON.stringify([]));
  } else {
    curvesArrayJSON = JSON.parse(localStorage.getItem("curvesArrayJSON"));
    for (let i = 0; i < curvesArrayJSON.length; i++) {
      addElem(curvesArrayJSON[i], "#curves-list");
    }
    if (curvesArrayJSON.length == 0) {
      const emptyElements = document.getElementsByClassName("empty");
      if (emptyElements.length > 0) {
        emptyElements[0].style.display = "block";
      } else {
        emptyElements[0].style.display = "nonec";
      }
    }
  }

  if (localStorage.getItem("curvesArrayDeleted") == null) {
    localStorage.setItem("curvesArrayDeleted", JSON.stringify([]));
  } else {
    curvesArrayDeleted = JSON.parse(localStorage.getItem("curvesArrayDeleted"));
    for (let i = 0; i < curvesArrayDeleted.length; i++) {
      addElem(curvesArrayDeleted[i], "#deleted-elem");
    }
    if (curvesArrayDeleted.length == 0) {
      const emptyElements = document.getElementsByClassName("empty");
      if (emptyElements.length > 0) {
        emptyElements[1].style.display = "block";
      } else {
        emptyElements[1].style.display = "none";
      }
    }
  }
});

function openRed(event) {
  const elem = event.target;
  const index = curvesArrayJSON.findIndex(
    (curve) => curve.id === +elem.dataset.curveId
  );
  console.log(elem.dataset.curveId);

  if (index !== -1) {
    const curve = new GeneralCurveInfo(
      curvesArrayJSON[index].id,
      curvesArrayJSON[index].name,
      curvesArrayJSON[index].method,
      curvesArrayJSON[index].manage,
      "old"
    );
    localStorage.setItem("currentCurve", JSON.stringify(curve));
    window.location.href = "parametr/parametr.html";
  }
}

function delcurveTotally(event) {
  const elem = event.target;
  const index = curvesArrayDeleted.findIndex(
    (curve) => curve.id === +elem.dataset.curveId
  );
  if (index !== -1) {
    const elemToDelete = elem.closest(".curve-block");
    elemToDelete.remove();
    curvesArrayDeleted.splice(index, 1);
    localStorage.setItem(
      "curvesArrayDeleted",
      JSON.stringify(curvesArrayDeleted)
    );
    if (curvesArrayDeleted.length == 0) {
      document.getElementsByClassName("empty")[1].style.display = "block";
    }
  }
  closeDelWar();

}

function restoreCur(event) {
  const elem = event.target;
  const index = curvesArrayDeleted.findIndex(
    (curve) => curve.id === +elem.dataset.curveId
  );
  if (index !== -1) {
    const elemToDelete = elem.closest(".curve-block");
    elemToDelete.remove();
    curvesArrayJSON.push(curvesArrayDeleted[index]);
    addElem(curvesArrayDeleted[index], "#curves-list");
    curvesArrayDeleted.splice(index, 1);
    localStorage.setItem("curvesArrayJSON", JSON.stringify(curvesArrayJSON));
    localStorage.setItem(
      "curvesArrayDeleted",
      JSON.stringify(curvesArrayDeleted)
    );
    document.getElementsByClassName("empty")[0].style.display = "none";
    if (curvesArrayDeleted.length == 0) {
      document.getElementsByClassName("empty")[1].style.display = "block";
    }
  }
  

}

function delcurve(event) {
  const elem = event.target;
  const index = curvesArrayJSON.findIndex(
    (curve) => curve.id === +elem.dataset.curveId
  );
  if (index !== -1) {
    const elemToDelete = elem.closest(".curve-block");
    elemToDelete.remove();
    curvesArrayDeleted.push(curvesArrayJSON[index]);
    addElem(curvesArrayJSON[index], "#deleted-elem");

    curvesArrayJSON.splice(index, 1);
    localStorage.setItem("curvesArrayJSON", JSON.stringify(curvesArrayJSON));
    localStorage.setItem(
      "curvesArrayDeleted",
      JSON.stringify(curvesArrayDeleted)
    );
    if (curvesArrayJSON.length == 0) {
      document.getElementsByClassName("empty")[0].style.display = "block";
    }
    document.getElementsByClassName("empty")[1].style.display = "none";
  }
  closeDelWar();
}

function showBigCanvas(elemInfo) {
  const wrapper_shadow = getElement("#wrapper-shadow");
  const canvas_big_wraper = getElement("#canvas-big-wraper");

  wrapper_shadow.style.display = "flex";
  canvas_big_wraper.style.display = "flex";
  const canvas = document.createElement("canvas");
  canvas.style.width = "400px";
  canvas.style.height = "400px";
  canvas.style.margin = "auto";
  canvas.width = "500";
  canvas.height = "500";
  const newCtx = canvas.getContext("2d");
  const img = new Image();
  if (elemInfo.canvasInfo != undefined) {
    img.src = elemInfo.canvasInfo;
    img.onload = function () {
      newCtx.drawImage(img, 0, 0, canvas.width, canvas.height); // Масштабуємо зображення
    };
  } else {
    console.error("elemInfo.canvasInfo is undefined or invalid.");
  }
  canvas_big_wraper.append(canvas);
}

function showDeleted() {
  const wrapper_shadow = getElement("#wrapper-shadow");
  const deleted_all = getElement("#deleted-all");
  wrapper_shadow.style.display = "flex";
  deleted_all.style.display = "flex";
}

function openDelWar(type, name){
  const eventClick = event;
  const wrapper_shadow = getElement("#wrapper-shadow");
  const modal_del = getElement("#modal-del");
  wrapper_shadow.style.display = "flex";
  modal_del.style.display = "flex";
  const deleted_all = getElement("#deleted-all");
  if (deleted_all.style.display == "flex") {
    deleted_all.style.display = "none";
  }
  const ok = getElement("#ok");

  if(type == "forever"){  
    ok.onclick = () => delcurveTotally(eventClick);
  } else if(type == "one"){
    ok.onclick = () => delcurve(eventClick);
  }
}

function closeDelWar(){
  const wrapper_shadow = getElement("#wrapper-shadow");
  const modal_del = getElement("#modal-del");
  wrapper_shadow.style.display = "none";
  modal_del.style.display = "none";
  const deleted_all = getElement("#deleted-all");
 
}

function closeDelAll() {
  const wrapper_shadow = getElement("#wrapper-shadow");
  const deleted_all = getElement("#deleted-all");
  wrapper_shadow.style.display = "none";
  deleted_all.style.display = "none";
}

function closeSys() {
  const wrapper_shadow = getElement("#wrapper-shadow");
  const canvas_big_wraper = getElement("#canvas-big-wraper");
  const deleted_all = getElement("#deleted-all");

  canvas_big_wraper.querySelector("canvas").remove();
  canvas_big_wraper.style.display = "none";
  if (deleted_all.style.display != "flex") {
    wrapper_shadow.style.display = "none";
  }
}

function addElem(elemInfo, list) {
  const list_wraper = getElement(list);
  const curve_block = document.createElement("div");
  const name_curve = document.createElement("p");
  const item_curve = document.createElement("div");
  const canvas_curve = document.createElement("div");
  const canvas = document.createElement("canvas");
  const info_curve = document.createElement("div");
  const buttons_curve = document.createElement("div");
  const edit_curve = document.createElement("button");
  const delete_curve = document.createElement("button");
  canvas.style.width = "130px";
  canvas.style.height = "130px";

  canvas.width = "300";
  canvas.height = "300";
  const newCtx = canvas.getContext("2d");
  const img = new Image();
  let isCanvasEmpty = true;

  if (elemInfo.canvasInfo != undefined) {
    img.src = elemInfo.canvasInfo;
    img.onload = function () {
      newCtx.drawImage(img, 0, 0, canvas.width, canvas.height); // Масштабуємо зображення
    };
    isCanvasEmpty = false;
  } else {
    canvas_curve.innerHTML = `<p class = description-curve">There is not system</p>`;
  }

  let icon_curve = [];
  for (let i = 0; i < 2; i++) {
    let img = document.createElement("img");
    img.className = "icon-curve";
    icon_curve.push(img);
  }
  icon_curve[0].dataset.curveId = elemInfo.id;
  icon_curve[1].dataset.curveId = elemInfo.id;
  let info_curves = [];
  for (let i = 0; i < 2; i++) {
    let p = document.createElement("p");
    p.className = "description-curve";
    info_curves.push(p);
  }

  curve_block.className = "curve-block";
  name_curve.className = "name-curve";
  item_curve.className = "item-curve";
  canvas_curve.className = "canvas-curve";
  info_curve.className = "info-curve";
  buttons_curve.className = "buttons-curve";
  delete_curve.className = "delete-curve";
  edit_curve.className = "edit-curve";
  delete_curve.type = "button";
  edit_curve.type = "button";
  console.log(list);
  if (list == "#deleted-elem") {
    edit_curve.onclick = restoreCur;
    delete_curve.onclick = () => openDelWar("forever", elemInfo.name);
    icon_curve[0].src = "../images/back-flat-color-outline-icon-free-png.webp";
    canvas.onclick = () => showBigCanvas(elemInfo);
    // document.getElementsByClassName("empty")[0].style.display = "block";
  } else {
    edit_curve.onclick = openRed;
    delete_curve.onclick = () => openDelWar("one", elemInfo.name);
    icon_curve[0].src = "../images/2202989.webp";
    canvas.onclick = () => showBigCanvas(elemInfo);
    // document.getElementsByClassName("empty")[1].style.display = "block";
  }
  icon_curve[1].src = "../images/1214428.png";

  name_curve.textContent = elemInfo.name;
  edit_curve.append(icon_curve[0]);
  delete_curve.append(icon_curve[1]);
  buttons_curve.append(edit_curve, delete_curve);

  ["Type: " + elemInfo.type, "Method: " + elemInfo.method].forEach(
    (text, i) => (info_curves[i].textContent = text)
  );
  info_curve.append(info_curves[0], info_curves[1], buttons_curve);
  if (isCanvasEmpty) {
    canvas_curve.innerHTML = "There is not system";
  } else {
    canvas_curve.append(canvas);
  }
  item_curve.append(canvas_curve, info_curve);
  curve_block.append(name_curve, item_curve);

  list_wraper.append(curve_block);
}

class GeneralCurveInfo {
  constructor(id = count, name, method, manage, send = "new") {
    console.log(count);
    this.id = id;
    this.name = name;
    this.method = method;
    this.manage = manage;
    this.send = send;
  }
}

function startsWithLetter(str) {
  return /^[A-Za-z][A-Za-z0-9_]+$/.test(str);
}

function getSelectedRadioTypeValue() {
  const selectedRadio = getElement('input[name="type-curve"]:checked');
  return selectedRadio ? selectedRadio.value : null;
}

function getSelectedRadioManageValue() {
  const selectedRadio = getElement('input[name="type-man"]:checked');
  return selectedRadio ? selectedRadio.value : null;
}

function checkForm() {
  return startsWithLetter(inputName.value);
}

function resetForm() {
  inputName.value = "";
  blockError.style.display = "none";
  document.querySelector('input[name="type-curve"]').checked = true;
  document.querySelector('input[name="type-man"]').checked = true;
}

function createCurve() {
  console.log("hi");
  if (checkForm()) {
    console.log(count);
    const curve = new GeneralCurveInfo(
      count,
      inputName.value,
      getSelectedRadioTypeValue(),
      getSelectedRadioManageValue()
    );
    localStorage.setItem("countCreatedCurve", JSON.stringify(++count));
    localStorage.setItem("currentCurve", JSON.stringify(curve));
    window.location.href = "parametr/parametr.html";
    resetForm();
  } else {
    blockError.style.display = "block";
  }
}
