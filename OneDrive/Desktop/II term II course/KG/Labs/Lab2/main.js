const getElement = selector => document.querySelector(selector);

const form = getElement("form");
const inputName = getElement("#name_curve");
const blockError = getElement(".error");

class GeneralCurveInfo {
  constructor(name, method, manage) {
    this.name = name;
    this.method = method;
    this.manage = manage;
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
  if (checkForm()) {
    const curve = new GeneralCurveInfo(inputName.value, getSelectedRadioTypeValue(), getSelectedRadioManageValue());
    localStorage.setItem("currentCurve", JSON.stringify(curve));
    window.location.href = "parametr/parametr.html"; 
    resetForm(); 
  } else {
    blockError.style.display = "block";
  }
}