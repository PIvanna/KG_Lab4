const getElement = (selector) => document.querySelector(selector);

const canvas = getElement("#myCanvas");
const ctx = canvas.getContext("2d");

const form_Sys = {
  form: getElement('form[name="division-form"]'),
  division_input: getElement("#division-input"),
  button: getElement("#button-division"),
  size_coord_input: getElement("#size-coord-input"),
};

const form_rel = {
  form: getElement('form[name="form_relevant"]'),
  polygonal_input: getElement("#polygonal-input"),
  curve_input: getElement("#curve-input"),
  x_input: getElement("#x-input"),
  y_input: getElement("#y-input"),
  points_color_input: getElement("#points-color-input"),
  relevant_color_input: getElement("#relevant-color-input"),
  button_reset_rel: getElement("#button-reset-rel"),
  button_create_rel: getElement("#button-create-rel"),
  button_addPoint: getElement("#button-addPoint"),
};

let widthCan = canvas.width;
let heightCan = canvas.height;
let centerX = widthCan / 2;
let centerY = heightCan / 2;
let idCount = 0;
let dimensions = 0;
let count_part = 0;
let coord_size = 0;

function drawLine(x_start, y_start, x_end, y_end, color = "black") {
  ctx.beginPath();
  ctx.moveTo(x_start, y_start);
  ctx.lineTo(x_end, y_end);
  ctx.strokeStyle = color;
  ctx.stroke();
}

function drawCircle(x, y, r, fi_1, fi_2, direction, color) {
  ctx.beginPath();
  ctx.arc(x, y, r, fi_1, fi_2, direction);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.stroke();
}

class PointRelObj {
  static count = 0;

  constructor(x, y, colorPoi, colorRel) {
    this.id = PointRelObj.count++;

    this.x = x;
    this.y = y;
    this.colorPoi = colorPoi;
    this.colorRel = colorRel;
  }
}

class PointPoiObj {
  static count = 0;

  constructor(x, y, colorPoi, colorVec) {
    this.id = PointPoiOb.count++;

    this.x = x;
    this.y = y;
    this.colorPoi = colorPoi;
    this.colorVec = colorVec;
  }
}

class Points {
  constructor(polygonalColor, polygonalFigColor, pointPoiObj) {
    this.polygonalColor = polygonalColor;
    this.polygonalFigColor = polygonalFigColor;
    this.pointPoiObj = pointPoiObj;
  }
}

class Relevant {
  constructor(polygonalColor, pointRelObj) {
    this.polygonalColor = polygonalColor;
    this.pointRelObj = pointRelObj;
  }
}

class Curve {
  static count = 0;

  constructor(name, type, method, colorCurve, relevantObj, pointsObj) {
    this.id = Curve.count++;
    this.name = name;
    this.type = type;
    this.method = method;
    this.colorCurve = colorCurve;
    this.relevantObj = relevantObj;
    this.pointsObj = pointsObj;
  }
}

const curves = [];
let currentCurve = null;

document.addEventListener("DOMContentLoaded", function () {
  let curveData = localStorage.getItem("currentCurve");

  if (curveData) {
    let curve = JSON.parse(curveData);

    currentCurve = new Curve(
      curve.name,
      curve.method,
      curve.manage,
      null,
      null,
      null
    );
    [
      "Name : " + curve.name,
      "Method : " + curve.method,
      "Manage : " + curve.manage,
    ].forEach(
      (text, i) => (getElement("#info-curve").children[i].textContent = text)
    );
  }
});

let points = [];
let pointsRelArr = [];

function editPoint() {
  console.log(event.target);
}

function delPoint() {
  let clickedElemToDel = event.target;
  const pointId = clickedElemToDel.dataset.pointId;
  const pointtIndex = pointsRelArr.findIndex((point) => point.id == pointId);
  if (pointtIndex !== -1) {
    const elemToDelete = clickedElemToDel.closest(".point-elem");
    elemToDelete.remove();
    pointsRelArr.splice(pointtIndex, 1);
  }
}

function addElemPoint(pointInfo) {
  const list_wraper = getElement("#list-wraper");
  const point_elem = document.createElement("div");
  const div = document.createElement("div");
  const buttons_point = document.createElement("div");
  const edit_point = document.createElement("button");
  const delete_point = document.createElement("button");

  edit_point.onclick = editPoint;
  delete_point.onclick = delPoint;
  let icon_curve = [];
  for (let i = 0; i < 2; i++) {
    let img = document.createElement("img");
    img.className = "icon-curve";
    icon_curve.push(img);
  }
  icon_curve[0].dataset.pointId = pointInfo.id;
  icon_curve[1].dataset.pointId = pointInfo.id;
  let point_description = [];
  for (let i = 0; i < 4; i++) {
    let p = document.createElement("p");
    p.className = "point-description";
    point_description.push(p);
  }

  point_elem.className = "point-elem";
  buttons_point.className = "buttons-point";
  edit_point.className = "edit-point";
  delete_point.className = "delete-point";
  edit_point.type = "button";
  delete_point.type = "button";
  icon_curve[0].src = "../images/2202989.webp";
  icon_curve[1].src = "../images/1214428.png";

  edit_point.append(icon_curve[0]);
  delete_point.append(icon_curve[1]);
  buttons_point.append(edit_point, delete_point);

  [
    "X : " + pointInfo.x,
    "Y : " + pointInfo.y,
    "Color : " + pointInfo.colorPoi,
    "Color relevant : " + pointInfo.colorRel,
  ].forEach((text, i) => (point_description[i].textContent = text));
  div.append(point_description[0], point_description[1]);
  div.style.display = "flex";
  point_elem.append(
    div,
    point_description[2],
    point_description[3],
    buttons_point
  );
  console.log(point_elem);

  list_wraper.append(point_elem);
}

function createPointRel() {
  let pointsObj = new PointRelObj(
    form_rel.x_input.value,
    form_rel.y_input.value,
    form_rel.points_color_input.value,
    form_rel.relevant_color_input.value
  );
  pointsRelArr.push(pointsObj);
  addElemPoint(pointsObj);
  form_rel.x_input.value = 0;
  form_rel.y_input.value = 0;
  form_rel.polygonal_input.value = "#000000";
  form_rel.curve_input.value = "#000000";
}

function checkPointForm() {
  createPointRel();
}

function createRelCurve() {
  currentCurve.colorCurve = form_rel.curve_input.value;
  let relevantCurve = new Relevant(
    form_rel.polygonal_input.value,
    pointsRelArr
  );
  currentCurve.relevantObj = relevantCurve;
  console.log(currentCurve);
}

function checkRelForm() {
  createRelCurve();
}

function stopScale() {
  let countPartValue = form_Sys.division_input.value;
  let cordSizeValue = form_Sys.size_coord_input.value;

  if (countPartValue > 0 && countPartValue < 20 && cordSizeValue > 0) {
    resetCanva();
    count_part = countPartValue * 2 + 1;
    coord_size = +cordSizeValue;
    dimensions = widthCan / count_part;

    points = [
      {
        x: centerX + (2 * +dimensions) / +coord_size,
        y: centerY - (3 * +dimensions) / +coord_size,
      },
      {
        x: centerX + (3 * +dimensions) / +coord_size,
        y: centerY - (1 * +dimensions) / +coord_size,
      },
      {
        x: centerX + (4 * +dimensions) / +coord_size,
        y: centerY - (1 * +dimensions) / +coord_size,
      },
      {
        x: centerX + (5 * +dimensions) / +coord_size,
        y: centerY - (3 * +dimensions) / +coord_size,
      },
    ];

    drawSystem();
    draw();
    Array.from(form_rel.form).forEach((element) => {
      element.disabled = false;
    });
  } else {
  }
}

function drawSystem() {
  drawLine(0, centerY, widthCan, centerY);
  drawLine(centerX, 0, centerX, heightCan);

  drawLine(widthCan, centerY, widthCan - 10, centerY - 10);
  drawLine(widthCan, centerY, widthCan - 10, centerY + 10);

  drawLine(centerX, 0, centerX - 10, 10);
  drawLine(centerX, 0, centerX + 10, 10);

  drawCircle(centerX, centerY, 3, 0, 2 * Math.PI, true, "black");

  for (let i = 0, j = 0; i < widthCan; i += dimensions, j += coord_size) {
    if (i != 0) {
      count_part < 10 ? (ctx.font = "16px Arial") : (ctx.font = "12px Arial");
      ctx.fillStyle = "black";
      ctx.fillText(j, centerX + i - 4, centerY + 20);
      ctx.fillText(j, centerX - 25, centerY - i + 5);
    }

    drawLine(centerX + i, centerY - 5, centerX + i, centerY + 5);
    drawLine(centerX - i, centerY - 5, centerX - i, centerY + 5);
    drawLine(0, centerY - i, widthCan, centerY - i, "grey");
    drawLine(0, centerY + i, widthCan, centerY + i, "grey");

    drawLine(centerX - 5, centerY + i, centerX + 5, centerY + i);
    drawLine(centerX - 5, centerY - i, centerX + 5, centerY - i);
    drawLine(centerX + i, 0, centerX + i, heightCan, "grey");
    drawLine(centerX - i, 0, centerX - i, heightCan, "grey");
  }

  ctx.font = "20px Arial";
  ctx.fillStyle = "black";

  ctx.fillText("X", widthCan - 20, centerY - 10);

  ctx.fillText("Y", centerX + 10, 20);
}

function resetCanva() {
  ctx.clearRect(0, 0, widthCan, heightCan);
  form_Sys.division_input.value = 0;
  form_Sys.size_coord_input.value = 0;
  Array.from(form_rel.form).forEach((element) => {
    element.disabled = true;
  });
  form_rel.x_input.value = 0;
  form_rel.y_input.value = 0;
  form_rel.polygonal_input.value = "#000000";
  form_rel.curve_input.value = "#000000";
  pointsRelArr = [];
  const list_wraper = getElement("#list-wraper");
  list_wraper.innerHTML = "";
  currentCurve.colorCurve = null;
  currentCurve.relevantObj = null;
  currentCurve.pointsObj = null;
}

function calculateTangents(P0, P3, scale = 0.4) {
  let tangentX = (P3.x - P0.x) * scale;
  let tangentY = (P3.y - P0.y) * scale;

  let P1 = {
    x: P0.x + tangentX,
    y: P0.y + tangentY,
  };

  let P2 = {
    x: P3.x - tangentX,
    y: P3.y - tangentY,
  };

  return { P1, P2 };
}

let draggingPoint = null;
function draw() {
  resetCanva();
  drawSystem();

  ctx.strokeStyle = "#aaa";
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.lineTo(points[1].x, points[1].y);
  ctx.lineTo(points[2].x, points[2].y);
  ctx.lineTo(points[3].x, points[3].y);
  ctx.stroke();

  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  ctx.bezierCurveTo(
    points[1].x,
    points[1].y,
    points[2].x,
    points[2].y,
    points[3].x,
    points[3].y
  );
  ctx.stroke();

  ctx.fillStyle = "blue";
  points.forEach((p) => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, 4, 0, Math.PI * 2);
    ctx.fill();
  });
}

function getMousePos(evt) {
  let rect = canvas.getBoundingClientRect();

  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top,
  };
}

canvas.addEventListener("mousedown", (e) => {
  let mousePos = getMousePos(e);

  points.forEach((point) => {
    if (Math.hypot(point.x - mousePos.x, point.y - mousePos.y) < 8) {
      draggingPoint = point;
    }
  });
});

canvas.addEventListener("mousemove", (e) => {
  if (draggingPoint) {
    let mousePos = getMousePos(e);
    draggingPoint.x = mousePos.x;
    draggingPoint.y = mousePos.y;
    draw();
  }
});

canvas.addEventListener("mouseup", () => {
  draggingPoint = null;
});
