const getElement = (selector) => document.querySelector(selector);

const canvas = getElement("#myCanvas");
const ctx = canvas.getContext("2d");

let isSystem = false;
let t_min = 0;
let t_max = 1;
let t_step = 0.1;
let smoothedCurves = [];
let chunkedPointsArr = [];

const form_Sys = {
  form: getElement('form[name="division-form"]'),
  division_input: getElement("#division-input"),
  button: getElement("#button-division"),
  size_coord_input: getElement("#size-coord-input"),
};

const form_rel = {
  form: getElement('form[name="form_relevant"]'),
  relavant_wraper: getElement("#relavant_wraper"),
  label_polygonal_input: getElement('label[for="polygonal-input"]'),
  polygonal_input: getElement("#polygonal-input"),
  label_curve_input: getElement(`label[for="curve-input"]`),
  curve_input: getElement("#curve-input"),
  x_input: getElement("#x-input"),
  y_input: getElement("#y-input"),
  points_color_input: getElement("#points-color-input"),
  relevant_color_input: getElement("#relevant-color-input"),
  button_reset_rel: getElement("#button-reset-rel"),
  button_create_rel: getElement("#button-create-rel"),
  button_addPoint: getElement("#button-addPoint"),
  button_editPoint: getElement("#button-editPoint"),
  pointPolyg_wraper: getElement("#pointPolyg-wraper"),
  polygonal_chain_radio: getElement("#polygonal-chain-radio"),
  polygonal_radio: getElement("#polygonal-radio"),
  polygonal_chain_color: getElement("#polygonal-chain-color"),
  polygonal_color: getElement("#polygonal-color"),
};

const wraper_shadow = getElement("#wrapper-shadow");
const options_wraper = getElement("#options-wraper");
const matrix_wraper = getElement("#matrix-wraper");
const coord_wraper = getElement("#coord-wraper");

let widthCan = canvas.width;
let heightCan = canvas.height;
let centerX = widthCan / 2;
let centerY = heightCan / 2;
let idCount = 0;
let dimensions = 0;
let count_part = 0;
let coord_size = 0;
let pointEdit = false;
let pointRelevantMan = [];
let pointPointMan = [];
let curvesArrayJSON;
let idCurve;
let NMain;

let scale = 100,
  offsetX = canvas.width / 2,
  offsetY = canvas.height / 2;
let lastMouseX = 0,
  lastMouseY = 0;
let baseStep = 100;
let isDragging = false;
let isPanMode = false;
let prevStep = 100;
let scaleForMath = 1;

function drawLine(x_start, y_start, x_end, y_end, color = "black", lineW = 1) {
  ctx.beginPath();
  ctx.moveTo(x_start, y_start);
  ctx.lineWidth = lineW;
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

function transferCoordsX(coord) {
  return ((coord * canvas.width) / canvas.width / getStepValue()) * baseStep;
}

function transferCoordsY(coord) {
  return -(
    ((coord * canvas.height) / canvas.height / getStepValue()) *
    baseStep
  );
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
    this.id = PointPoiObj.count++;

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

  constructor(
    id,
    name,
    type,
    method,
    colorCurve,
    relevantObj,
    pointsObj,
    canvasInfo
  ) {
    this.id = id;
    this.name = name;
    this.type = type;
    this.method = method;
    this.colorCurve = colorCurve;
    this.relevantObj = relevantObj;
    this.pointsObj = pointsObj;
    this.canvasInfo = this.canvasInfo;
  }
}

const curves = [];
let currentCurve = null;

document.addEventListener("DOMContentLoaded", function () {
  let curveData = localStorage.getItem("currentCurve");

  curvesArrayJSON = JSON.parse(localStorage.getItem("curvesArrayJSON")) || [];

  if (curvesArrayJSON.length > 0) {
    console.log("Отримані дані:", curvesArrayJSON);
  } else {
    console.log("Даних немає.");
  }

  if (curveData) {
    let curve = JSON.parse(curveData);
    idCurve = curve.id;
    console.log(curve);
    currentCurve = new Curve(
      idCurve,
      curve.name,
      curve.method,
      curve.manage,
      null,
      null,
      null,
      null
    );

    if (curve.send == "old") {
      const index = curvesArrayJSON.findIndex(
        (curveSpe) => curveSpe.id === currentCurve.id
      );
      console.log(curve);
      if (index !== -1) {
        console.log(curvesArrayJSON[index]);

        currentCurve = curvesArrayJSON[index];
        console.log(currentCurve);

        form_rel.curve_input.value = currentCurve.colorCurve
          ? currentCurve.colorCurve
          : "#000000";

        if (currentCurve.method == "Relevant") {
          pointsRelArr = structuredClone(
            currentCurve.relevantObj?.pointRelObj || []
          );
          pointsStaticArr = structuredClone(
            currentCurve.relevantObj?.pointRelObj || []
          );

          form_rel.polygonal_input.value =
            currentCurve.relevantObj?.polygonalColor || "#000000";

          for (let i = 0; i < pointsRelArr.length; i++) {
            addElemPoint(pointsRelArr[i]);
          }
        } else if (currentCurve.method == "Points") {
          pointsPoiArr = structuredClone(
            currentCurve.pointsObj?.pointPoiObj || []
          );
          pointsStaticArr = structuredClone(
            currentCurve.pointsObj?.pointPoiObj || []
          );
          if (currentCurve.pointsObj.polygonalColor !== null) {
            form_rel.polygonal_chain_color.value =
              currentCurve.pointsObj.polygonalColor;
            form_rel.polygonal_chain_radio.checked = true;
          }

          if (currentCurve.pointsObj.polygonalFigColor !== null) {
            console.log(form_rel.polygonal_radio.value);
            form_rel.polygonal_color.value =
              currentCurve.pointsObj.polygonalFigColor;
            form_rel.polygonal_radio.checked = true;
            console.log(form_rel.polygonal_radio.value);
          }
          console.log(pointsPoiArr);

          for (let i = 0; i < pointsPoiArr.length; i++) {
            addElemPoint(pointsPoiArr[i]);
          }
        }
      }
    }
    if (currentCurve.method == "Relevant") {
      form_rel.label_polygonal_input.style.display = "block";
      form_rel.polygonal_input.style.display = "block";
      form_rel.pointPolyg_wraper.style.display = "none";
      form_rel.relavant_wraper.style.display = "block";
    } else if (currentCurve.method == "Points") {
      form_rel.label_polygonal_input.style.display = "none";
      form_rel.polygonal_input.style.display = "none";
      form_rel.pointPolyg_wraper.style.display = "flex";
      form_rel.relavant_wraper.style.display = "none";
    }
    [
      "Name : " + currentCurve.name,
      "Method : " + currentCurve.type,
      "Manage : " + currentCurve.method,
    ].forEach(
      (text, i) => (getElement("#info-curve").children[i].textContent = text)
    );
  }
});

let pointsRelArr = [];
let pointsPoiArr = [];
let pointsStaticArr = [];
let mainBezierRel = [];

function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

function bernstein(n, i, t) {
  return (
    (factorial(n) / (factorial(i) * factorial(n - i))) *
    Math.pow(t, i) *
    Math.pow(1 - t, n - i)
  );
}

function ensureSmoothBezier(segment, nextSegment, q = 1) {
  if (!nextSegment)
    return { updatedCurrent: segment, updatedNext: nextSegment };

  let [P0, P1, P2, P3] = segment;
  let [Q0, Q1, Q2, Q3] = nextSegment;
  console.log(P3, Q0);
  let newP3X = (+P2.x + q * +Q1.x) / (1 + q);
  let newP3Y = (+P2.y + q * +Q1.y) / (1 + q);
  console.log(P2.x);
  console.log(Q1.x);
  console.log(Q1.y);
  console.log(P2.y);
  console.log(newP3X);
  console.log(newP3Y);
  P3.x = newP3X;
  P3.y = newP3Y;
  Q0.x = newP3X;
  Q0.y = newP3Y;

  console.log(P3, Q0);

  return { updatedCurrent: segment, updatedNext: nextSegment };
}

function bezierCurve(t, P0, P1, P2, P3) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const p = {
    x:
      Math.round(
        (uuu * P0.x + 3 * uu * t * P1.x + 3 * u * tt * P2.x + ttt * P3.x) * 100
      ) / 100,
    y:
      Math.round(
        (uuu * P0.y + 3 * uu * t * P1.y + 3 * u * tt * P2.y + ttt * P3.y) * 100
      ) / 100,
  };

  return p;
}

function linearBezier(t, P0, P1) {
  return {
    x: (1 - t) * P0.x + t * P1.x,
    y: (1 - t) * P0.y + t * P1.y,
  };
}

function quadraticBezier(t, P0, P1, P2) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;

  return {
    x: uu * P0.x + 2 * u * t * P1.x + tt * P2.x,
    y: uu * P0.y + 2 * u * t * P1.y + tt * P2.y,
  };
}

function autoT(points) {
  let bezierCurveArr = [];
  for (t = t_min; t <= t_max; t += t_step) {
    bezierCurveArr.push(
      bezierCurve(t, points[0], points[1], points[2], points[3])
    );
  }
  return bezierCurveArr;
}

function binomialCoefficient(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}

function computeNMatrix(n) {
  let N = [];

  for (let i = 0; i <= n; i++) {
    let row = [];
    for (let j = 0; j <= n; j++) {
      if (i + j <= n) {
        row.push(
          binomialCoefficient(n, j) *
            binomialCoefficient(n - j, n - i - j) *
            Math.pow(-1, n - i - j)
        );
      } else {
        row.push(0);
      }
    }
    N.push(row);
  }
  NMain = N;

  return N;
}

function multiplyMatrixVector(matrix, vector) {
  if (!Array.isArray(matrix) || !Array.isArray(vector)) {
    throw new Error("Matrix or vector is not an array");
  }

  return matrix.map((row, rowIndex) => {
    if (!Array.isArray(row)) {
      console.error(`Row ${rowIndex} is not an array`, row);
      throw new Error("Expected row to be an array");
    }

    let sum = 0;
    for (let i = 0; i < row.length; i++) {
      sum += row[i] * (vector[i] ?? 0);
    }
    return sum;
  });
}

function bezierMatrix(points, t) {
  let n = points.length - 1;
  let T = [];

  for (let i = n; i >= 0; i--) {
    T.push(Math.pow(t, i));
  }

  let N = computeNMatrix(n);
  let P_x = points.map((p) => p.x);
  let P_y = points.map((p) => p.y);

  let B_x = multiplyMatrixVector([T], multiplyMatrixVector(N, P_x))[0];
  let B_y = multiplyMatrixVector([T], multiplyMatrixVector(N, P_y))[0];

  return { x: B_x, y: B_y };
}

function autoM(points) {
  let bezierCurveArr = [];
  for (let t = t_min; t <= t_max; t += t_step) {
    console.log("points", points);
    let curve = bezierMatrix(points, t);
    bezierCurveArr.push(curve);
  }
  return bezierCurveArr;
}

function bezierDeCasteljauRecursive(points, t) {
  if (points.length === 1) {
    return points[0];
  }

  let newPoints = [];
  for (let i = 0; i < points.length - 1; i++) {
    newPoints.push({
      x: (1 - t) * points[i].x + t * points[i + 1].x,
      y: (1 - t) * points[i].y + t * points[i + 1].y,
    });
  }

  return bezierDeCasteljauRecursive(newPoints, t);
}

function autoR(points) {
  let bezierCurveArr = [];
  for (let t = t_min; t <= t_max; t += t_step) {
    bezierCurveArr.push(bezierDeCasteljauRecursive(points, t));
  }
  return bezierCurveArr;
}

function splitArrayIntoChunks(array) {
  let result = [];
  let i = 0;
  for (i = 0; i < array.length - 3; i += 3) {
    let P0 = array[i],
      P1 = array[i + 1],
      P2 = array[i + 2],
      P3 = array[i + 3];
    let chunk = [];
    chunk.push(P0, P1, P2, P3);

    result.push(chunk);
  }

  let chunk = [];

  for (; i < array.length; i++) {
    chunk.push(array[i]);
  }
  result.push(chunk);

  if (result[result.length - 1].length === 1 && result.length !== 1) {
    result.length = result.length - 1;
  }

  return result;
}

function exceptionClue(chunkedPoints, points) {
  const lastSegment = chunkedPoints[chunkedPoints.length - 1];
  const remainingPointsCount = lastSegment.length;
  if (chunkedPoints.length > 1) {
    switch (remainingPointsCount) {
      case 2:
        const [P1, P2] = lastSegment;
        const interpPoints = [
          new PointRelObj(
            P1.x + ((P2.x - P1.x) * 1) / 3,
            P1.y + ((P2.y - P1.y) * 1) / 3,
            "red",
            "blue"
          ),
          new PointRelObj(
            P1.x + ((P2.x - P1.x) * 2) / 3,
            P1.y + ((P2.y - P1.y) * 2) / 3,
            "red",
            "blue"
          ),
        ];
        chunkedPoints[chunkedPoints.length - 1] = [P1, ...interpPoints, P2];
        const indexP1 = points.findIndex((point) => point.id === P1.id);
        if (indexP1 !== -1) {
          points.splice(indexP1 + 1, 0, ...interpPoints);
        }
        break;
      case 3:
        const [pointP1, pointP2, pointP3] = lastSegment;
        const mid2 = new PointRelObj(
          (pointP2.x + pointP3.x) / 2,
          (pointP2.y + pointP3.y) / 2,
          "red",
          "blue"
        );
        chunkedPoints[chunkedPoints.length - 1] = [
          pointP1,
          pointP2,
          mid2,
          pointP3,
        ];
        const indexP2 = points.findIndex((point) => point.id === pointP2.id);
        if (indexP2 !== -1) {
          points.splice(indexP2 + 1, 0, mid2);
        }
        break;
    }
  }
  return chunkedPoints;
}

function prepareCurve(points) {
  for (let i = 0; i < points.length - 1; i++) {
    let segment = points[i];
    let nextSegment = points[i + 1];
    if (segment.length >= 4) {
      const { updatedCurrent, updatedNext } = ensureSmoothBezier(
        segment,
        nextSegment
      );
      points[i] = updatedCurrent;
      points[i + 1] = updatedNext;
    }
  }
}

function buildFirstSegment(points) {
  let tempArr = [];
  switch (points[0].length) {
    case 2:
      for (t = t_min; t <= t_max; t += t_step) {
        tempArr.push(linearBezier(t, points[0][0], points[0][1]));
      }
      return tempArr;
    case 3:
      for (t = t_min; t <= t_max; t += t_step) {
        tempArr.push(
          quadraticBezier(t, points[0][0], points[0][1], points[0][2])
        );
      }
      return tempArr;
    case 4:
      console.log(points[0].length);

      for (t = t_min; t <= t_max; t += t_step) {
        tempArr.push(
          bezierCurve(t, points[0][0], points[0][1], points[0][2], points[0][3])
        );
      }
      return tempArr;
  }
}

function parametricBuild(points) {
  let chunkedPoints = splitArrayIntoChunks(points);
  smoothedCurves = [];
  chunkedPoints = exceptionClue(chunkedPoints, points);
  if (chunkedPoints.length > 1) {
    prepareCurve(chunkedPoints);
    smoothedCurves = chunkedPoints.map((segment) => autoT(segment));
  } else {
    smoothedCurves.push(buildFirstSegment(chunkedPoints));
  }

  draw(smoothedCurves, chunkedPoints);
}

function recursiveBuild(points) {
  console.log("recursive");
  let chunkedPoints = splitArrayIntoChunks(points);
  smoothedCurves = [];
  chunkedPoints = exceptionClue(chunkedPoints, points);
  if (chunkedPoints.length > 1) {
    prepareCurve(chunkedPoints);
  }
  smoothedCurves = chunkedPoints.map((segment) => autoR(segment));
  draw(smoothedCurves, chunkedPoints);
}

function matrixBuild(points) {
  console.log("matrix");
  let chunkedPoints = splitArrayIntoChunks(points);
  chunkedPoints = [];
  chunkedPoints = exceptionClue(chunkedPoints, points);
  if (chunkedPoints.length > 1) {
    prepareCurve(chunkedPoints);
  }
  smoothedCurves = chunkedPoints.map((segment) => autoM(segment));
  draw(smoothedCurves, chunkedPoints);
}

function editPoint() {
  let currentPoint = Number(localStorage.getItem("currentPoint"));
  let icons_curve = document.getElementsByClassName("icon-curve");
  let iconsArray = Array.from(icons_curve);
  const iconIndex = iconsArray.findIndex(
    (icon) => icon.dataset.pointId == currentPoint
  );
  if (currentCurve.method == "Relevant") {
    const pointtIndex = pointsRelArr.findIndex(
      (point) => point.id == currentPoint
    );
    if (pointtIndex !== -1) {
      pointsRelArr[pointtIndex].x = +form_rel.x_input.value;
      pointsRelArr[pointtIndex].y = +form_rel.y_input.value;
      pointsRelArr[pointtIndex].colorPoi = form_rel.points_color_input.value;
      pointsStaticArr[pointtIndex].x = +form_rel.x_input.value;
      pointsStaticArr[pointtIndex].y = +form_rel.y_input.value;
      pointsStaticArr[pointtIndex].colorPoi = form_rel.points_color_input.value;
    }
    if (iconIndex !== -1) {
      const elemToEdit = iconsArray[iconIndex].closest(".point-elem");
      const point_descriptions =
        elemToEdit.getElementsByClassName("point-description");
      [
        "X : " + pointsRelArr[pointtIndex].x,
        "Y : " + pointsRelArr[pointtIndex].y,
        "Color : " + pointsRelArr[pointtIndex].colorPoi,
      ].forEach((text, i) => (point_descriptions[i].textContent = text));
    }
  } else if (currentCurve.method == "Points") {
    const pointtIndex = pointsPoiArr.findIndex(
      (point) => point.id == currentPoint
    );
    if (pointtIndex !== -1) {
      pointsPoiArr[pointtIndex].x = +form_rel.x_input.value;
      pointsPoiArr[pointtIndex].y = +form_rel.y_input.value;
      pointsPoiArr[pointtIndex].colorPoi = form_rel.points_color_input.value;
      pointsStaticArr[pointtIndex].x = +form_rel.x_input.value;
      pointsStaticArr[pointtIndex].y = +form_rel.y_input.value;
      pointsStaticArr[pointtIndex].colorPoi = form_rel.points_color_input.value;
    }
    if (iconIndex !== -1) {
      const elemToEdit = iconsArray[iconIndex].closest(".point-elem");
      const point_descriptions =
        elemToEdit.getElementsByClassName("point-description");
      [
        "X : " + pointsPoiArr[pointtIndex].x,
        "Y : " + pointsPoiArr[pointtIndex].y,
        "Color : " + pointsPoiArr[pointtIndex].colorPoi,
      ].forEach((text, i) => (point_descriptions[i].textContent = text));
    }
  }

  form_rel.button_editPoint.style.display = "none";
  form_rel.button_addPoint.style.display = "block";
  form_rel.x_input.value = 0;
  form_rel.y_input.value = 0;
  form_rel.points_color_input.value = "#000000";
}

function showEditPoint(event) {
  localStorage.setItem(
    "currentPoint",
    JSON.stringify(+event.target.dataset.pointId)
  );
  const pointId = event.target.dataset.pointId;
  if (currentCurve.method == "Relevant") {
    const pointtIndex = pointsStaticArr.findIndex(
      (point) => point.id == pointId
    );
    if (pointtIndex !== -1) {
      form_rel.x_input.value = pointsStaticArr[pointtIndex].x;
      form_rel.y_input.value = pointsStaticArr[pointtIndex].y;
      form_rel.points_color_input.value = pointsStaticArr[pointtIndex].colorPoi;
    }
  } else if (currentCurve.method == "Points") {
    const pointtIndex = pointsStaticArr.findIndex(
      (point) => point.id == pointId
    );
    if (pointtIndex !== -1) {
      form_rel.x_input.value = pointsStaticArr[pointtIndex].x;
      form_rel.y_input.value = pointsStaticArr[pointtIndex].y;
      form_rel.points_color_input.value = pointsStaticArr[pointtIndex].colorPoi;
    }
  }

  form_rel.button_editPoint.style.display = "block";
  form_rel.button_addPoint.style.display = "none";
}

function delPoint() {
  let clickedElemToDel = event.target;
  const pointId = clickedElemToDel.dataset.pointId;
  if (currentCurve.method == "Relevant") {
    const pointtIndex = pointsRelArr.findIndex((point) => point.id == pointId);
    if (pointtIndex !== -1) {
      const elemToDelete = clickedElemToDel.closest(".point-elem");
      elemToDelete.remove();
      pointsRelArr.splice(pointtIndex, 1);
      pointsStaticArr.splice(pointtIndex, 1);
    }
  } else if (currentCurve.method == "Points") {
    const pointtIndex = pointsPoiArr.findIndex((point) => point.id == pointId);
    if (pointtIndex !== -1) {
      const elemToDelete = clickedElemToDel.closest(".point-elem");
      elemToDelete.remove();
      pointsPoiArr.splice(pointtIndex, 1);
      pointsStaticArr.splice(pointtIndex, 1);
    }
  }
  const list_wraper = getElement("#list-wraper");
  if (list_wraper.children.length == 0) {
    console.log(list_wraper.children);

    pointsRelArr = [];
    pointsPoiArr = [];
    pointsStaticArr = [];
    ctx.clearRect(0, 0, widthCan, heightCan);
    drawGrid();
  }
}

function addElemPoint(pointInfo) {
  const list_wraper = getElement("#list-wraper");
  const point_elem = document.createElement("div");
  const div = document.createElement("div");
  const buttons_point = document.createElement("div");
  const edit_point = document.createElement("button");
  const delete_point = document.createElement("button");

  edit_point.onclick = showEditPoint;
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
  for (let i = 0; i < 3; i++) {
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
  let color = pointInfo.colorPoi;
  let bgColor =
    color === "#ffffff" || color === "rgb(255, 255, 255)"
      ? "black"
      : "transparent";

  ["X : " + pointInfo.x.toFixed(2), "Y : " + pointInfo.y.toFixed(2), ,].forEach(
    (text, i) => (point_description[i].textContent = text)
  );
  point_description[2].innerHTML = `Color : <span style="color:${color}; background-color:${bgColor};"> This </span>`;
  div.append(point_description[0], point_description[1]);
  div.style.display = "flex";
  point_elem.append(div, point_description[2], buttons_point);

  list_wraper.append(point_elem);
}

const listStatic = [];
function createPointRel() {
  console.log("hi");
  let pointsObj = new PointRelObj(
    +form_rel.x_input.value,
    +form_rel.y_input.value,
    form_rel.points_color_input.value
  );
  pointsStaticArr.push(pointsObj);
  pointsRelArr.push(pointsObj);
  addElemPoint(pointsObj);
  form_rel.x_input.value = 0;
  form_rel.y_input.value = 0;
  form_rel.points_color_input.value = "#000000";
}

function createPointPoi() {
  let pointsObj = new PointPoiObj(
    +form_rel.x_input.value,
    +form_rel.y_input.value,
    form_rel.points_color_input.value
  );
  pointsStaticArr.push(pointsObj);
  pointsPoiArr.push(pointsObj);
  addElemPoint(pointsObj);
  form_rel.x_input.value = 0;
  form_rel.y_input.value = 0;
  form_rel.points_color_input.value = "#000000";
}

function checkPointForm() {
  if (currentCurve.method == "Relevant") {
    createPointRel();
  } else if (currentCurve.method == "Points") {
    createPointPoi();
  }
}

function createRelCurve() {
  currentCurve.colorCurve = form_rel.curve_input.value;
  if (currentCurve.method == "Relevant") {
    let relevantCurve = new Relevant(
      form_rel.polygonal_input.value,
      structuredClone(pointsRelArr)
    );
    currentCurve.relevantObj = relevantCurve;
  } else if (currentCurve.method == "Points") {
    let pointCurve;
    if (form_rel.polygonal_chain_radio.checked) {
      pointCurve = new Points(
        form_rel.polygonal_chain_color.value,
        null,
        structuredClone(pointsPoiArr)
      );
    } else if (form_rel.polygonal_radio.checked) {
      pointCurve = new Points(
        null,
        form_rel.polygonal_color.value,
        structuredClone(pointsPoiArr)
      );
    }

    currentCurve.pointsObj = pointCurve;
  }

  switch (currentCurve.type) {
    case "Parametric":
      if (currentCurve.method == "Relevant") {
        parametricBuild(pointsRelArr);
      } else if (currentCurve.method == "Points") {
        parametricBuild(pointsPoiArr);
      }
      break;
    case "Recursive":
      if (currentCurve.method == "Relevant") {
        recursiveBuild(pointsRelArr);
      } else if (currentCurve.method == "Points") {
        recursiveBuild(pointsPoiArr);
      }
      break;
    case "Matrix":
      if (currentCurve.method == "Relevant") {
        matrixBuild(pointsRelArr);
      } else if (currentCurve.method == "Points") {
        matrixBuild(pointsPoiArr);
      }
      break;
  }
}

function checkRelForm() {
  createRelCurve();
  const list_wraper = getElement("#list-wraper");
  list_wraper.innerHTML = "";
  if (currentCurve.method == "Relevant") {
    pointsStaticArr = structuredClone(pointsRelArr);
    for (let i = 0; i < pointsRelArr.length; i++) {
      addElemPoint(pointsRelArr[i]);
    }
  } else if (currentCurve.method == "Points") {
    pointsStaticArr = structuredClone(pointsPoiArr);
    for (let i = 0; i < pointsPoiArr.length; i++) {
      addElemPoint(pointsPoiArr[i]);
    }
  }
}

function stopScale() {
  ctx.clearRect(0, 0, widthCan, heightCan);

  drawGrid();
  if (pointsRelArr.length != 0) {
    createRelCurve();
  }
  if (pointsPoiArr.length != 0) {
    createRelCurve();
  }
}

stopScale();

function updateCanvasSize() {
  canvas.width = 700;
  canvas.height = 700;
  drawGrid();
}

window.addEventListener("keydown", (event) => {
  if (event.ctrlKey) {
    isPanMode = true;
  }
});

window.addEventListener("keyup", (event) => {
  if (!event.ctrlKey) {
    isPanMode = false;
  }
});

function getStepValue() {
  const steps = [0.1, 0.5, 1, 2, 5, 10, 25, 50, 100, 150, 200];

  let stepValue = steps[0];

  if (scale <= 1000 && scale > 0.78) {
  } else {
    scale = 0.79;
  }

  if (scale > 700) newScale = 699;

  for (let i = 0; i < steps.length; i++) {
    if (150 / scale <= steps[i]) {
      stepValue = steps[i];
      break;
    }
  }

  return stepValue;
}

function formatTickValue(value) {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2);
}

function drawGrid() {
  isSystem = true;
  ctx.restore();
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.save();
  console.log("offsetX:", offsetX, "offsetY:", offsetY);

  ctx.translate(offsetX, offsetY);

  const stepValue = getStepValue();
  if (Math.abs(stepValue - prevStep) > 0.1) {
    prevStep = getStepValue();
    baseStep = 100;
  }
  let stepSize = baseStep;

  let subDivisions;
  baseStep <= 100 ? (subDivisions = 3) : (subDivisions = 4);
  const subStep = stepSize / subDivisions;

  const startX = -offsetX;
  const startY = -offsetY;
  const endX = canvas.width - offsetX;
  const endY = canvas.height - offsetY;

  ctx.beginPath();
  ctx.strokeStyle = "#eee";

  for (let x = Math.floor(startX / subStep) * subStep; x < endX; x += subStep) {
    for (
      let y = Math.floor(startY / subStep) * subStep;
      y < endY;
      y += subStep
    ) {
      ctx.strokeRect(x, y, subStep, subStep);
    }
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "#ddd";
  for (
    let x = Math.floor(startX / stepSize) * stepSize;
    x < endX;
    x += stepSize
  ) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY);
  }
  for (
    let y = Math.floor(startY / stepSize) * stepSize;
    y < endY;
    y += stepSize
  ) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y);
  }
  ctx.stroke();

  ctx.beginPath();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.moveTo(startX, 0);
  ctx.lineTo(endX, 0);
  ctx.moveTo(0, startY);
  ctx.lineTo(0, endY);
  ctx.stroke();

  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  for (
    let x = Math.floor(startX / stepSize) * stepSize;
    x < endX;
    x += stepSize
  ) {
    ctx.fillText(formatTickValue((x / stepSize) * stepValue), x, 5);
  }
  for (
    let y = Math.floor(startY / stepSize) * stepSize;
    y < endY;
    y += stepSize
  ) {
    ctx.fillText(formatTickValue((-y / stepSize) * stepValue), 5, y);
  }

  let yVisible = endX < 0 || endX > canvas.width ? true : false;
  let xVisible = endY < 0 || endY > canvas.height ? true : false;
  ctx.fillStyle = "rgb(111, 111, 111)";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  if (endX < 0) {
    if (yVisible) {
      ctx.textAlign = "left";
      for (
        let y = Math.floor(startY / stepSize) * stepSize, step = 0;
        y < endY;
        y += stepSize, step += stepSize
      ) {
        ctx.fillText(
          formatTickValue((-y / stepSize) * stepValue),
          endX - 50,
          y
        );
      }
    }
  }
  if (endX > canvas.width) {
    if (yVisible) {
      ctx.textAlign = "left";
      for (
        let y = Math.floor(startY / stepSize) * stepSize, step = 0;
        y < endY;
        y += stepSize, step += stepSize
      ) {
        ctx.fillText(
          formatTickValue((-y / stepSize) * stepValue),
          startX + 30,
          y
        );
      }
    }
  }
  if (endY < 0) {
    if (xVisible) {
      ctx.textAlign = "center";
      for (
        let x = Math.floor(startX / stepSize) * stepSize;
        x < endX;
        x += stepSize
      ) {
        ctx.fillText(formatTickValue((x / stepSize) * stepValue), x, endY - 30);
      }
    }
  }

  if (endY > canvas.height) {
    if (xVisible) {
      ctx.textAlign = "center";
      for (
        let x = Math.floor(startX / stepSize) * stepSize;
        x < endX;
        x += stepSize
      ) {
        ctx.fillText(
          formatTickValue((x / stepSize) * stepValue),
          x,
          startY + 30
        );
      }
    }
  }
  // ctx.restore();
}

const minScale = 1;
const maxScale = 2;
let scaleForAnimation = 1;

const scaleDisplay = document.createElement("div");
scaleDisplay.style.position = "absolute";
scaleDisplay.style.top = "10px";
scaleDisplay.style.left = "10px";
scaleDisplay.style.background = "rgba(0, 0, 0, 0.5)";
scaleDisplay.style.color = "white";
scaleDisplay.style.padding = "5px";
document.body.appendChild(scaleDisplay);

function updateScaleDisplay() {
  scaleDisplay.textContent = `Scale: ${scale.toFixed(
    2
  )}, Step: ${baseStep.toFixed(2)}`;
}

canvas.addEventListener("wheel", (event) => {
  event.preventDefault();

  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9;
  let newScale = scale * scaleFactor;

  if (newScale < 0.22) newScale = 0.22;
  if (newScale > 700) newScale = 699;

  if (baseStep <= 200 && baseStep >= 100) {
    baseStep = baseStep * scaleFactor;
  }
  scale = newScale;

  const worldX = (mouseX - offsetX) / scale;
  const worldY = (mouseY - offsetY) / scale;

  updateScaleDisplay();
  draw(smoothedCurves, splitArrayIntoChunks(pointsStaticArr));

  // drawGrid();
});

canvas.addEventListener("mousemove", (event) => {
  if (isPanMode) {
    offsetX += event.movementX;
    offsetY += event.movementY;
    drawGrid();
    draw(smoothedCurves, splitArrayIntoChunks(pointsStaticArr));
  }
});

window.addEventListener("resize", updateCanvasSize);

updateCanvasSize();

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
  pointsPoiArr = [];
  const list_wraper = getElement("#list-wraper");
  list_wraper.innerHTML = "";
  currentCurve.colorCurve = null;
  currentCurve.relevantObj = null;
  currentCurve.pointsObj = null;
  isSystem = false;
  pointsStaticArr = [];
}

function bezierTangentTwoPoints(P0, P1) {
  let dx = P1.x - P0.x;
  let dy = P1.y - P0.y;
  return { x: dx, y: dy };
}

function bezierTangentQuadratic(t, P) {
  let dx = 2 * (1 - t) * (P[1].x - P[0].x) + 2 * t * (P[2].x - P[1].x);
  let dy = 2 * (1 - t) * (P[1].y - P[0].y) + 2 * t * (P[2].y - P[1].y);
  return { x: dx, y: dy };
}

function bezierTangent(t, P) {
  const n = P.length - 1;
  let x = 0,
    y = 0;

  if (n === 1) {
    return { x: P[1].x - P[0].x, y: P[1].y - P[0].y };
  } else if (n === 2) {
    return bezierTangentQuadratic(t, P);
  }

  for (let i = 0; i < n; i++) {
    const term = bernstein(n - 1, i, t) * n;
    x += term * (P[i + 1].x - P[i].x);
    y += term * (P[i + 1].y - P[i].y);
  }

  return { x, y };
}

function drawTangents(points) {
  ctx.strokeStyle = "green";
  ctx.lineWidth = 5;

  const numPoints = points.length;

  const targetLength = 4;
  if (numPoints === 2) {
    let p0 = points[0];
    let p1 = points[1];

    let tangent = bezierTangentTwoPoints(p0, p1);

    let tangentLength = Math.hypot(tangent.x, tangent.y);

  

    let p1_tangent = {
      x: transferCoordsX(p0.x ),
      y: transferCoordsY(p0.y ),
    };
    let p2_tangent = {
      x: transferCoordsX(p1.x ),
      y: transferCoordsY(p1.y),
      point: points,
    };

    ctx.beginPath();
    ctx.moveTo(p1_tangent.x, p1_tangent.y);
    ctx.lineTo(p2_tangent.x, p2_tangent.y);
    ctx.stroke();
    ctx.fillStyle = "orange";
    ctx.beginPath();
    ctx.arc(p2_tangent.x, p2_tangent.y, 6, 0, Math.PI * 2);
    ctx.fill();
    pointRelevantMan.push(p2_tangent);
  } else if (numPoints === 3) {
    for (let t = t_min; t <= t_max; t += 1.2) {
      let p = quadraticBezier(t, points[0], points[1], points[2]);
      let tangent = bezierTangentQuadratic(t, points);

      let tangentLength = Math.hypot(tangent.x, tangent.y);

      let tangentNormalized = {
        x: (tangent.x / tangentLength) * targetLength,
        y: (tangent.y / tangentLength) * targetLength,
      };

      let p1_tangent = {
        x: transferCoordsX(p.x - tangentNormalized.x),
        y: transferCoordsY(p.y - tangentNormalized.y),
      };
      let p2_tangent = {
        x: transferCoordsX(p.x + tangentNormalized.x),
        y: transferCoordsY(p.y + tangentNormalized.y),
        point: points,
      };

      ctx.beginPath();
      ctx.moveTo(p1_tangent.x, p1_tangent.y);
      ctx.lineTo(p2_tangent.x, p2_tangent.y);
      ctx.stroke();
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.arc(p2_tangent.x, p2_tangent.y, 6, 0, Math.PI * 2);
      ctx.fill();
      pointRelevantMan.push(p2_tangent);
    }
  } else if (numPoints === 4) {
    for (let t = t_min; t <= t_max; t += 1) {
      let p = bezierCurve(t, points[0], points[1], points[2], points[3]);
      let tangent = bezierTangent(t, points);

      let tangentLength = Math.hypot(tangent.x, tangent.y);

      let tangentNormalized = {
        x: (tangent.x / tangentLength) * targetLength,
        y: (tangent.y / tangentLength) * targetLength,
      };

      let p1_tangent = {
        x: transferCoordsX(p.x - tangentNormalized.x),
        y: transferCoordsY(p.y - tangentNormalized.y),
      };
      let p2_tangent = {
        x: transferCoordsX(p.x + tangentNormalized.x),
        y: transferCoordsY(p.y + tangentNormalized.y),
        point: points,
      };

      ctx.beginPath();
      ctx.moveTo(p1_tangent.x, p1_tangent.y);
      ctx.lineTo(p2_tangent.x, p2_tangent.y);
      ctx.stroke();
      ctx.fillStyle = "orange";
      ctx.beginPath();
      ctx.arc(p2_tangent.x, p2_tangent.y, 6, 0, Math.PI * 2);
      ctx.fill();
      pointRelevantMan.push(p2_tangent);
    }
  }
}

let draggingPoint = null;
let selectedTangentPoint = null;
let tangentPoint = -1;

function drawCurve(points) {
  if (points.length === 0) return;

  console.log(points);
  console.log("offsetX:", offsetX, "offsetY:", offsetY);

  ctx.beginPath();
  ctx.moveTo(transferCoordsX(points[0].x), transferCoordsY(points[0].y));
  ctx.strokeStyle = currentCurve.colorCurve;
  ctx.lineWidth = 2;

  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(transferCoordsX(points[i].x), transferCoordsY(points[i].y));
  }

  ctx.stroke();
  ctx.closePath();
}

function draw(smoothedCurves, chunkedPoints) {
  drawGrid();

  if (currentCurve.method == "Relevant") {
    pointRelevantMan = [];
    console.log("hi");

    for (let i = 0; i < smoothedCurves.length; i++) {
      drawTangents(chunkedPoints[i]);
      drawCurve(smoothedCurves[i]);
    }
    ctx.beginPath();
    ctx.strokeStyle = currentCurve.relevantObj.polygonalColor;
    moveTo(
      transferCoordsX(pointsRelArr[0].x),
      transferCoordsY(pointsRelArr[0].y)
    );
    for (let i = 0; i < pointsRelArr.length; i++) {
      ctx.lineTo(
        transferCoordsX(pointsRelArr[i].x),
        transferCoordsY(pointsRelArr[i].y)
      );
    }
    ctx.stroke();

    pointsRelArr.forEach((p) => {
      ctx.fillStyle = p.colorPoi;
      ctx.beginPath();
      ctx.arc(transferCoordsX(p.x), transferCoordsY(p.y), 4, 0, Math.PI * 2);
      ctx.fill();
    });
  } else if (currentCurve.method == "Points") {
    for (let i = 0; i < smoothedCurves.length; i++) {
      drawCurve(smoothedCurves[i]);
    }
    ctx.beginPath();
    if (currentCurve.pointsObj.polygonalColor != null) {
      ctx.strokeStyle = currentCurve.pointsObj.polygonalColor;
      moveTo(
        transferCoordsX(pointsPoiArr[0].x),
        transferCoordsY(pointsPoiArr[0].y)
      );
      for (let i = 0; i < pointsPoiArr.length; i++) {
        ctx.lineTo(
          transferCoordsX(pointsPoiArr[i].x),
          transferCoordsY(pointsPoiArr[i].y)
        );
      }
      ctx.stroke();
    }

    if (currentCurve.pointsObj.polygonalFigColor != null) {
      ctx.strokeStyle = currentCurve.pointsObj.polygonalFigColor;
      ctx.beginPath();

      ctx.moveTo(
        transferCoordsX(pointsPoiArr[0].x),
        transferCoordsY(pointsPoiArr[0].y)
      );

      for (let i = 1; i < pointsPoiArr.length; i++) {
        ctx.lineTo(
          transferCoordsX(pointsPoiArr[i].x),
          transferCoordsY(pointsPoiArr[i].y)
        );
      }

      ctx.lineTo(
        transferCoordsX(pointsPoiArr[0].x),
        transferCoordsY(pointsPoiArr[0].y)
      );

      ctx.closePath();
      ctx.stroke();
    }

    pointsPoiArr.forEach((p) => {
      ctx.fillStyle = p.colorPoi;
      ctx.beginPath();
      ctx.arc(transferCoordsX(p.x), transferCoordsY(p.y), 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}

function updateControlPointsForLine(P0, P1, selectedTangentPointInside) {
  if (selectedTangentPointInside.point[1] === P1) {
    P1.x = selectedTangentPointInside.x / (baseStep/getStepValue());
    P1.y = selectedTangentPointInside.y / (baseStep/getStepValue());
  }
  return { P0, P1 };
}

function updateControlPointsForQuadraticBezier(
  P0,
  P1,
  P2,
  selectedTangentPointInside,
  tangentLength = 5
) {
  if (selectedTangentPointInside.point[tangentPoint + 1] === P1) {
    let tangentX = P2.x - P0.x;
    let tangentY = P2.y - P0.y;

    let length = Math.hypot(tangentX, tangentY);
    tangentX = (tangentX / length) * tangentLength;
    tangentY = (tangentY / length) * tangentLength;

    P1.x = selectedTangentPointInside.x / (baseStep/getStepValue() );
    P1.y = selectedTangentPointInside.y / (baseStep/getStepValue());

    P2.x = P0.x + tangentX;
    P2.y = P0.y + tangentY;
  } else if (selectedTangentPointInside.point[tangentPoint + 1] === P2) {
    let tangentX = P1.x - P0.x;
    let tangentY = P1.y - P0.y;

    let length = Math.hypot(tangentX, tangentY);
    tangentX = (tangentX / length) * tangentLength;
    tangentY = (tangentY / length) * tangentLength;

    P2.x = selectedTangentPointInside.x / (baseStep/getStepValue());
    P2.y = selectedTangentPointInside.y / (baseStep/getStepValue());

    P1.x = P0.x + tangentX;
    P1.y = P0.y + tangentY;
  }

  return { P0, P1, P2 };
}

function updateControlPointsOnTangentMove(
  P0,
  P1,
  P2,
  P3,
  selectedTangentPointInside
) {
  if (selectedTangentPointInside.point[tangentPoint + 1] === P1) {
    const midpointX = (P0.x + P3.x) / 2;
    const midpointY = (P0.y + P3.y) / 2;

    P1.x = selectedTangentPointInside.x / (baseStep/getStepValue());
    P1.y = selectedTangentPointInside.y / (baseStep/getStepValue());

    const deltaX = P1.x - midpointX;
    const deltaY = P1.y - midpointY;

    P2.x = midpointX - deltaX;
    P2.y = midpointY - deltaY;
  } else if (selectedTangentPointInside.point[tangentPoint + 1] === P2) {
    const midpointX = (P0.x + P3.x) / 2;
    const midpointY = (P0.y + P3.y) / 2;

    P2.x = selectedTangentPointInside.x / (baseStep/getStepValue());
    P2.y = selectedTangentPointInside.y / (baseStep/getStepValue());

    const deltaX = P2.x - midpointX;
    const deltaY = P2.y - midpointY;

    P1.x = midpointX - deltaX;
    P1.y = midpointY - deltaY;
  }

  return { P0, P1, P2, P3 };
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

  console.log(pointsPoiArr);
  pointsPoiArr.forEach((point) => {
    if (
      Math.hypot(
        transferCoordsX(point.x) - (mousePos.x - offsetX),
        transferCoordsY(point.y) - (mousePos.y - offsetY)
      ) < 8
    ) {
      console.log(point);

      draggingPoint = point;
      console.log(draggingPoint);
    }
  });
});

canvas.addEventListener("mousedown", (e) => {
  let mousePos = getMousePos(e);
  if (currentCurve.method == "Relevant") {
    for (let i = 0; i < pointRelevantMan.length; i++) {
      let point = pointRelevantMan[i];
      if (Math.hypot(point.x - (mousePos.x-offsetX), point.y - (mousePos.y-offsetY)) < 8) {
        selectedTangentPoint = point;
        tangentPoint = i;
        if (tangentPoint > 1) {
          tangentPoint = 1;
        }

        break;
      }
    }
  }
});

function updateRelevantPoint(currentCurve, selectedTangentPointInside) {
  console.log(selectedTangentPointInside.point);
  const selectedPoint = selectedTangentPointInside.point;
  selectedPoint.forEach((point) => {
    const selectedPointId = point.id;

    const pointIndex = currentCurve.relevantObj.pointRelObj.findIndex(
      (p) => p.id === selectedPointId
    );

    if (pointIndex !== -1) {
      pointsRelArr[pointIndex].x = point.x;
      pointsRelArr[pointIndex].y = point.y;

      console.log(
        "Точка оновлена:",
        currentCurve.relevantObj.pointRelObj[pointIndex]
      );
      pointsStaticArr = structuredClone(currentCurve.relevantObj.pointRelObj);
    } else {
      console.log("Точка з id", selectedPointId, "не знайдена.");
    }
  });
}

canvas.addEventListener("mousemove", (e) => {
  if (selectedTangentPoint) {
    const mousePos = getMousePos(e);
    console.log(mousePos.x - offsetX)
    console.log(offsetY - mousePos.y)
    selectedTangentPoint.x = mousePos.x - offsetX;
    selectedTangentPoint.y = offsetY - mousePos.y;

    if (selectedTangentPoint.point.length === 2) {
      const { P0, P1 } = updateControlPointsForLine(
        selectedTangentPoint.point[0],
        selectedTangentPoint.point[1],
        selectedTangentPoint
      );
      selectedTangentPoint.point = [P0, P1];
    } else if (selectedTangentPoint.point.length === 3) {
      const { P0, P1, P2 } = updateControlPointsForQuadraticBezier(
        selectedTangentPoint.point[0],
        selectedTangentPoint.point[1],
        selectedTangentPoint.point[2],
        selectedTangentPoint
      );
      selectedTangentPoint.point = [P0, P1, P2];
    } else if (selectedTangentPoint.point.length === 4) {
      const { P0, P1, P2, P3 } = updateControlPointsOnTangentMove(
        selectedTangentPoint.point[0],
        selectedTangentPoint.point[1],
        selectedTangentPoint.point[2],
        selectedTangentPoint.point[3],
        selectedTangentPoint
      );
      selectedTangentPoint.point = [P0, P1, P2, P3];
    }

    updateRelevantPoint(currentCurve, selectedTangentPoint);

    switch (currentCurve.type) {
      case "Parametric":
        parametricBuild(pointsRelArr);
        break;
      case "Recursive":
        parametricBuild(pointsRelArr);

        break;
      case "Matrix":
        parametricBuild(pointsRelArr);

        break;
    }
  }
});

canvas.addEventListener("dblclick", (e) => {
  let mousePos = getMousePos(e);

  const x = parseFloat(((mousePos.x - offsetX) / baseStep) * getStepValue());

  const y = parseFloat(((offsetY - mousePos.y) / baseStep) * getStepValue());

  form_rel.x_input.value = x.toFixed(2);
  form_rel.y_input.value = y.toFixed(2);
});

canvas.addEventListener("mouseup", () => {
  draggingPoint = null;
  selectedTangentPoint = null;
  tangentPoint = null;
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();

    const addButton = document.getElementById("button-addPoint");
    const editButton = document.getElementById("button-editPoint");

    if (window.getComputedStyle(addButton).display !== "none") {
      checkPointForm();
    } else if (window.getComputedStyle(editButton).display !== "none") {
      editPoint();
    }
  }
});

canvas.addEventListener("mousemove", (e) => {
  if (draggingPoint) {
    console.log("LOH");
    let mousePos = getMousePos(e);
    const x = parseFloat(((mousePos.x - offsetX) / baseStep) * getStepValue());

    const y = parseFloat(((offsetY - mousePos.y) / baseStep) * getStepValue());

    draggingPoint.x = +x.toFixed(2);
    draggingPoint.y = +y.toFixed(2);
    console.log(draggingPoint)
    switch (currentCurve.type) {
      case "Parametric":
        parametricBuild(pointsPoiArr);

        break;
      case "Recursive":
        recursiveBuild(pointsPoiArr);

        break;
      case "Matrix":
        matrixBuild(pointsPoiArr);

        break;
    }
  }
});

function saveRelForm() {
  if (currentCurve.method == "Relevant") {
    pointsRelArr = structuredClone(pointsStaticArr);
  } else if (currentCurve.method == "Points") {
    pointsPoiArr = structuredClone(pointsStaticArr);
  }
  createRelCurve();
}

function saveCurveToLocal() {
  console.log(curvesArrayJSON);
  const index = curvesArrayJSON.findIndex(
    (curve) => curve.id === currentCurve.id
  );
  if (isSystem) {
    const canvas = document.getElementById("myCanvas");
    const dataURL = canvas.toDataURL();
    currentCurve.canvasInfo = dataURL;
  }
  if (index !== -1) {
    curvesArrayJSON[index] = currentCurve;
  } else {
    curvesArrayJSON.push(currentCurve);
  }

  localStorage.setItem("curvesArrayJSON", JSON.stringify(curvesArrayJSON));
  window.location.href = "/main.html";
}

function openOpt() {
  if (isSystem) {
    wraper_shadow.style.display = "flex";
    options_wraper.style.display = "flex";
  }
}

function closeOpt() {
  wraper_shadow.style.display = "none";
  options_wraper.style.display = "none";
  getElement('input[name="type-curve"]').checked = true;
  matrix_wraper.style.display = "none";
  matrix_wraper.innerHTML = "";
  coord_wraper.style.display = "none";
  coord_wraper.innerHTML = "";
}

function getSelectedRadioTypeValue() {
  const selectedRadio = getElement('input[name="type-curve"]:checked');
  return selectedRadio ? selectedRadio.value : null;
}

document.getElementById("radio-mat").addEventListener("click", showBlock);
document.getElementById("radio-coord").addEventListener("click", showBlock);

function createStyledContainer(titleText) {
  const container = document.createElement("div");
  container.style.border = "2px solid #333";
  container.style.padding = "10px";
  container.style.borderRadius = "8px";
  container.style.backgroundColor = "#f9f9f9";

  const title = document.createElement("h3");
  title.textContent = titleText;
  title.style.margin = "0 0 10px 0";
  title.style.textAlign = "center";

  container.appendChild(title);
  return container;
}

function showBlock() {
  if (getSelectedRadioTypeValue() == "Matrix") {
    if (currentCurve.type == "Matrix") {
      matrix_wraper.style.display = "flex";
      matrix_wraper.innerHTML = "";
      coord_wraper.style.display = "none";
      matrixOption();
    } else {
      alert("Неправильний тип кривої. Поточний тип: " + currentCurve.type);
      matrix_wraper.style.display = "none";
      coord_wraper.style.display = "flex";
    }
  } else {
    matrix_wraper.style.display = "none";
    coord_wraper.style.display = "flex";
  }

  if (getSelectedRadioTypeValue() == "Coords") {
    coord_wraper.style.display = "flex";
    coord_wraper.style.flexDirection = "column";
    matrix_wraper.style.display = "none";
    matrix_wraper.innerHTML = "";
    coord_wraper.style.gap = "15px";
    coord_wraper.style.padding = "10px";
    coord_wraper.innerHTML = "";
    coordsOpt();
  }
}

function coordsOpt() {
  const tContainer = createStyledContainer("Вивід координат");

  const tForm = document.createElement("form");
  tForm.style.display = "flex";
  tForm.style.alignItems = "center";
  tForm.style.gap = "10px";

  const tMinInput = document.createElement("input");
  tMinInput.type = "number";
  tMinInput.placeholder = "t_min";
  tMinInput.value = 0;
  tMinInput.style.width = "70px";

  const tMaxInput = document.createElement("input");
  tMaxInput.type = "number";
  tMaxInput.placeholder = "t_max";
  tMaxInput.value = 1;
  tMaxInput.style.width = "70px";

  const tStepInput = document.createElement("input");
  tStepInput.type = "number";
  tStepInput.placeholder = "t_step";
  tStepInput.value = 0.1;
  tStepInput.step = 0.1;
  tStepInput.style.width = "70px";

  const tCountInput = document.createElement("input");
  tCountInput.type = "number";
  tCountInput.placeholder = "Кількість точок";
  tCountInput.value = 10;
  tCountInput.style.width = "120px";

  const tButton = document.createElement("button");
  tButton.textContent = "Вивести";
  tButton.type = "button";

  const tOutput = document.createElement("pre");
  tOutput.style.border = "1px solid black";
  tOutput.style.padding = "5px";
  tOutput.style.marginTop = "10px";

  tButton.addEventListener("click", () => {
    const tMin = parseFloat(tMinInput.value);
    const tMax = parseFloat(tMaxInput.value);
    const tStep = parseFloat(tStepInput.value);
    const tCount = parseInt(tCountInput.value);

    if (tMin < 0 || tMin > 1) {
      alert("tMin має бути більше 0 і менше 1.");
      return;
    }
    if (tMax < 0 || tMax > 1) {
      alert("tMax має бути більше 0 і менше 1.");
      return;
    }
    if (tMin >= tMax) {
      alert("tMin повинно бути менше ніж tMax.");
      return;
    }

    if (tStep < 0 || tStep > 1) {
      alert("tStep має бути більше 0 і менше 1.");
      return;
    }

    t_min = tMin;
    t_max = tMax;
    t_step = tStep;

    switch (currentCurve.type) {
      case "Parametric":
        if (currentCurve.method == "Relevant") {
          parametricBuild(pointsRelArr);
        } else if (currentCurve.method == "Points") {
          parametricBuild(pointsPoiArr);
        }
        break;
      case "Recursive":
        if (currentCurve.method == "Relevant") {
          recursiveBuild(pointsRelArr);
        } else if (currentCurve.method == "Points") {
          recursiveBuild(pointsPoiArr);
        }
        break;
      case "Matrix":
        if (currentCurve.method == "Relevant") {
          matrixBuild(pointsRelArr);
        } else if (currentCurve.method == "Points") {
          matrixBuild(pointsPoiArr);
        }
        break;
    }

    let points = [];
    let point = smoothedCurves.flat();
    let counter = 0;
    tTemp = tMin;

    for (let i = 0; i < smoothedCurves.length; i++) {
      tTemp = tMin;

      for (
        let j = 0;
        j < smoothedCurves[i].length && counter < tCount;
        j++, counter++, tTemp += tStep
      ) {
        let x = point[j].x;
        let y = point[j].y;

        points.push(
          `t=${tTemp.toFixed(2)} → (${x.toFixed(2)}, ${y.toFixed(2)})`
        );
      }
    }

    tOutput.textContent = points.join("\n");
    saveRelForm();
    t_min = 0;
    t_max = 1;
    t_step = 0.1;
  });

  tForm.appendChild(tMinInput);
  tForm.appendChild(tMaxInput);
  tForm.appendChild(tStepInput);
  tForm.appendChild(tCountInput);
  tForm.appendChild(tButton);
  tContainer.appendChild(tForm);
  tContainer.appendChild(tOutput);

  const xyContainer = createStyledContainer("Вивід координат на проміжку");

  const xyForm = document.createElement("form");
  xyForm.style.display = "flex";
  xyForm.style.alignItems = "center";
  xyForm.style.gap = "10px";

  const xInput = document.createElement("input");
  xInput.type = "number";
  xInput.placeholder = "Введіть X";
  xInput.style.width = "100px";

  const yInput = document.createElement("input");
  yInput.type = "number";
  yInput.placeholder = "Введіть Y";
  yInput.style.width = "100px";

  const xMinInput = document.createElement("input");
  xMinInput.type = "number";
  xMinInput.placeholder = "X min";
  xMinInput.style.width = "100px";
  xMinInput.value = 0;

  const xMaxInput = document.createElement("input");
  xMaxInput.type = "number";
  xMaxInput.placeholder = "X max";
  xMaxInput.style.width = "100px";
  xMaxInput.value = 0;

  const yMinInput = document.createElement("input");
  yMinInput.type = "number";
  yMinInput.placeholder = "Y min";
  yMinInput.style.width = "100px";
  yMinInput.value = 0;

  const yMaxInput = document.createElement("input");
  yMaxInput.type = "number";
  yMaxInput.placeholder = "Y max";
  yMaxInput.value = 0;
  yMaxInput.style.width = "100px";

  const xyCountInput = document.createElement("input");
  xyCountInput.type = "number";
  xyCountInput.placeholder = "Кількість точок";
  xyCountInput.value = 10;
  xyCountInput.style.width = "120px";

  const xyButton = document.createElement("button");
  xyButton.textContent = "Знайти";
  xyButton.type = "button";

  const xyOutput = document.createElement("pre");
  xyOutput.style.border = "1px solid black";
  xyOutput.style.padding = "5px";
  xyOutput.style.marginTop = "10px";

  xyButton.addEventListener("click", () => {
    const xFilter = parseFloat(xInput.value);
    const xyCount = parseInt(xyCountInput.value);

    const xMin = parseFloat(xMinInput.value);
    const xMax = parseFloat(xMaxInput.value);
    const yMin = parseFloat(yMinInput.value);
    const yMax = parseFloat(yMaxInput.value);

    let foundPoints = [];
    let counter = 0;

    for (let i = 0; i < smoothedCurves.length; i++) {
      for (let j = 0; j < smoothedCurves[i].length && counter < xyCount; j++) {
        let point = smoothedCurves[i][j];
        let x = point.x;
        let y = point.y;

        if (x >= xMin && x <= xMax && y >= yMin && y <= yMax) {
          counter++;
          foundPoints.push(
            `n=${i + j + 1}, (${x.toFixed(2)}, ${y.toFixed(2)})`
          );
        }
      }
    }

    if (foundPoints.length < xyCount) {
      xyOutput.textContent = `Знайдено лише ${foundPoints.length} точок, не буде більше.`;
      xyOutput.textContent += `Знайдені точки: \n${foundPoints.join("\n")}`;
    } else if (foundPoints.length > 0) {
      xyOutput.textContent = `Знайдені точки: \n${foundPoints.join("\n")}`;
    } else {
      xyOutput.textContent = "Немає точок, що відповідають заданим параметрам.";
    }
  });

  xyForm.appendChild(xMinInput);
  xyForm.appendChild(xMaxInput);
  xyForm.appendChild(yMinInput);
  xyForm.appendChild(yMaxInput);
  xyForm.appendChild(xyCountInput);
  xyForm.appendChild(xyButton);
  xyContainer.appendChild(xyForm);
  xyContainer.appendChild(xyOutput);

  coord_wraper.appendChild(xyContainer);

  coord_wraper.appendChild(tContainer);
  coord_wraper.appendChild(xyContainer);
  coord_wraper.style.display = "flex";
}

function matrixOption() {
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.width = "100%";

  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.marginBottom = "10px";
  table.style.width = "300px";
  table.style.height = "300px";

  const infoBlock = document.createElement("div");
  infoBlock.textContent = "Натисніть на елемент, рядок, стовпець або діагональ";
  infoBlock.style.padding = "10px";
  infoBlock.style.border = "1px solid black";
  infoBlock.style.minWidth = "300px";
  infoBlock.style.textAlign = "center";
  infoBlock.className = "info-block";
  const size = NMain.length;

  let mainDiagonal = [];
  let secondaryDiagonal = [];
  let mainSum = 0;
  let secondarySum = 0;

  for (let i = 0; i < size; i++) {
    mainDiagonal.push(NMain[i][i]);
    secondaryDiagonal.push(NMain[i][size - i - 1]);
    mainSum += NMain[i][i];
    secondarySum += NMain[i][size - i - 1];
  }

  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th"));

  for (let colIndex = 0; colIndex < size; colIndex++) {
    const th = document.createElement("th");
    th.textContent = colIndex;
    th.style.border = "1px solid black";
    th.style.padding = "5px";
    th.style.cursor = "pointer";
    th.style.backgroundColor = "#f0f0f0";

    th.addEventListener("click", () => {
      const columnSum = NMain.reduce((sum, row) => sum + row[colIndex], 0);
      infoBlock.textContent = `Сума стовпця ${colIndex}: ${columnSum}`;
    });

    headerRow.appendChild(th);
  }
  table.appendChild(headerRow);

  NMain.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    const rowHeader = document.createElement("th");
    rowHeader.textContent = rowIndex;
    rowHeader.style.border = "1px solid black";
    rowHeader.style.padding = "5px";
    rowHeader.style.cursor = "pointer";
    rowHeader.style.backgroundColor = "#f0f0f0";

    rowHeader.addEventListener("click", () => {
      const rowSum = row.reduce((sum, cell) => sum + cell, 0);
      const zeroElements = row
        .map((cell, colIndex) => (cell === 0 ? `Стовпець ${colIndex}` : null))
        .filter((item) => item !== null);

      let zeroInfo = zeroElements.length
        ? ` | Нульові елементи: ${zeroElements.join(", ")}`
        : " | Нульових елементів немає";

      infoBlock.textContent = `Сума рядка ${rowIndex}: ${rowSum}${zeroInfo}`;
    });

    tr.appendChild(rowHeader);

    row.forEach((cell, colIndex) => {
      const td = document.createElement("td");
      td.textContent = cell;
      td.style.border = "1px solid black";
      td.style.padding = "5px";
      td.style.cursor = "pointer";

      if (rowIndex === colIndex) {
        td.style.backgroundColor = "#d1e7dd";
      }
      if (rowIndex + colIndex === size - 1) {
        td.style.backgroundColor = "#f8d7da";
      }

      td.addEventListener("click", () => {
        infoBlock.textContent = `Елемент: ${cell} | Рядок: ${rowIndex} | Стовпець: ${colIndex}`;
      });

      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  const mainDiagonalButton = document.createElement("button");

  mainDiagonalButton.textContent = "Показати головну діагональ";
  mainDiagonalButton.style.margin = "5px";
  mainDiagonalButton.className = "diagonalButton";
  mainDiagonalButton.addEventListener("click", () => {
    infoBlock.textContent = `Головна діагональ: ${mainDiagonal.join(
      ", "
    )} | Сума: ${mainSum}`;
  });

  const secondaryDiagonalButton = document.createElement("button");
  secondaryDiagonalButton.textContent = "Показати побічну діагональ";
  secondaryDiagonalButton.style.margin = "5px";
  secondaryDiagonalButton.className = "diagonalButton";
  secondaryDiagonalButton.addEventListener("click", () => {
    infoBlock.textContent = `Побічна діагональ: ${secondaryDiagonal.join(
      ", "
    )} | Сума: ${secondarySum}`;
  });

  container.appendChild(table);
  container.appendChild(mainDiagonalButton);
  container.appendChild(secondaryDiagonalButton);
  container.appendChild(infoBlock);
  matrix_wraper.appendChild(container);
}

function notSaveCurveToLocal() {}
