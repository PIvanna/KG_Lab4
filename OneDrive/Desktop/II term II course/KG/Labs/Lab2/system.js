const getElement = (selector) => document.querySelector(selector);

const canvas = getElement("#myCanvas");
const ctx = canvas.getContext("2d");

let isSystem = false;
let t_min = 0;
let t_max = 1;
let t_step = 0.1;
let smoothedCurves = [];
let chunkedPointsArr = [];
let lastMousePos;

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
let allCurves = [];

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

// Клас, який представляє точку, пов'язану з іншими об'єктами (relevant)
class PointRelObj {
  // Статичний лічильник для унікального ID кожного об'єкта
  static count = 0;

  constructor(x, y, colorPoi, colorRel) {
    // Унікальний ID, що автоматично збільшується
    this.id = PointRelObj.count++;

    // Координати точки
    this.x = x;
    this.y = y;

    // Колір самої точки
    this.colorPoi = colorPoi;

    // Колір зв'язку (лінії або фігури)
    this.colorRel = colorRel;
  }
}

// Клас, що описує звичайну точку (poi), яка має вектор
class PointPoiObj {
  static count = 0;

  constructor(x, y, colorPoi, colorVec) {
    this.id = PointPoiObj.count++;

    this.x = x;
    this.y = y;

    // Колір точки
    this.colorPoi = colorPoi;

    // Колір вектора, пов'язаного з точкою
    this.colorVec = colorVec;
  }
}

// Клас, який представляє об'єкт, що складається з точок (poi) і полігонів
class Points {
  constructor(polygonalColor, polygonalFigColor, pointPoiObj) {
    // Колір полігонального контуру
    this.polygonalColor = polygonalColor;

    // Колір фігури (заливка)
    this.polygonalFigColor = polygonalFigColor;

    // Масив об'єктів PointPoiObj
    this.pointPoiObj = pointPoiObj;
  }
}

// Клас, який представляє об'єкти зі зв'язками (relevant)
class Relevant {
  constructor(polygonalColor, pointRelObj) {
    // Колір полігональної структури зв'язків
    this.polygonalColor = polygonalColor;

    // Масив об'єктів PointRelObj
    this.pointRelObj = pointRelObj;
  }
}

// Клас, що описує криву, яка складається з точок або зв'язків
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
    // Унікальний ідентифікатор (може бути переданий або прив’язаний до Curve.count++)
    this.id = id;

    // Назва кривої
    this.name = name;

    // Тип кривої (наприклад, Безьє, сплайн і т.д.)
    this.type = type;

    // Метод побудови кривої (може бути алгоритм чи підхід)
    this.method = method;

    // Колір кривої
    this.colorCurve = colorCurve;

    // Об'єкт типу Relevant (зв'язані точки)
    this.relevantObj = relevantObj;

    // Об'єкт типу Points (точки)
    this.pointsObj = pointsObj;

    // Інформація про canvas або область, де відображається крива
    this.canvasInfo = this.canvasInfo;
  }
}


const curves = [];
let currentCurve = null;
const contextMenu = document.createElement("div");
const contextMenuCurve = document.createElement("div");
contextMenu.classList.add("custom-context-menu");
contextMenuCurve.classList.add("custom-context-menu");
contextMenu.innerHTML = `
  <div class="label-form">
    <label for="x-input">X:</label>
    <input type="number"  value="0" name="x-input" id="x-input" />
  </div>
  <div class="label-form">
    <label for="y-input">Y:</label>
    <input type="number" value="0" name="y-input" id="y-input" />
  </div>
  <div class="label-form">
    <label for="points-color-input">Point's color</label>
    <input type="color" name="points-color-input" id="points-color-input" />
  </div>
  <button id="delete-point">Delete Point</button>
`;

contextMenuCurve.innerHTML = `
 <div class="label-form">
    <label for="polygonal-color">Polygonal chain's color</label>

                  <input
                    type="radio"
                    checked
                    name="polygonal-option"
                    id="polygonal-chain-radio"
                    oninput="checkRelForm()"
                    
                  />
                  <input
                    type="color"
                    name="polygonal-color"
                    id="polygonal-chain-color"
                    oninput="checkRelForm()"
                  />
                </div>
                <div class="label-form">
                  <label for="polygonal-color">Polygonal color</label>

                  <input
                    type="radio"
                    name="polygonal-option"
                    id="polygonal-radio"
                    oninput="checkRelForm()"
                    
                  />
                  <input
                    type="color"
                    name="polygonal-color"
                    id="polygonal-color"
                    oninput="checkRelForm()"
                    
                  />
                </div><div class="label-form">
                <label for="curve-input">Curve\`s color</label>
                <input
                  type="color"
                  name="curve-input"
                  id="curve-input"
                    oninput="checkRelForm()"
                  
                />
              </div>
                
`;

// Виконується після повного завантаження HTML-документу
document.addEventListener("DOMContentLoaded", function () {
  // Отримуємо дані поточної кривої з localStorage
  let curveData = localStorage.getItem("currentCurve");

  // Отримуємо масив усіх збережених кривих або ініціалізуємо порожнім
  curvesArrayJSON = JSON.parse(localStorage.getItem("curvesArrayJSON")) || [];

  // Перевірка: чи є збережені криві
  if (curvesArrayJSON.length > 0) {
    console.log("Отримані дані:", curvesArrayJSON);
  } else {
    console.log("Даних немає.");
  }

  // Якщо є поточна крива — продовжуємо
  if (curveData) {
    let curve = JSON.parse(curveData); // Парсимо об’єкт
    idCurve = curve.id;

    // Створюємо новий об'єкт класу Curve з частиною даних (інші параметри поки null)
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

    // Додаємо контекстне меню для кривої
    document.body.appendChild(contextMenuCurve);

    // Якщо крива збережена раніше ("old") — підтягуємо її повні дані
    if (curve.send == "old") {
      // Знаходимо відповідну криву у масиві збережених
      const index = curvesArrayJSON.findIndex(
        (curveSpe) => curveSpe.id === currentCurve.id
      );

      if (index !== -1) {
        // Оновлюємо currentCurve на повну версію з масиву
        currentCurve = curvesArrayJSON[index];

        // Встановлюємо значення кольору кривої в інпут (або чорний за замовчуванням)
        document.getElementById("curve-input").value = currentCurve.colorCurve
          ? currentCurve.colorCurve
          : "#000000";

        // Якщо метод кривої — на основі точок
        if (currentCurve.method == "Points") {
          // Копіюємо точки кривої (poi)
          pointsPoiArr = structuredClone(
            currentCurve.pointsObj?.pointPoiObj || []
          );
          pointsStaticArr = structuredClone(
            currentCurve.pointsObj?.pointPoiObj || []
          );

          // Встановлюємо лічильник ID точок так, щоб уникнути дублювання
          if (pointsPoiArr.length > 0) {
            PointPoiObj.count =
              Math.max(...pointsPoiArr.map((point) => point.id)) + 1;
          } else {
            PointPoiObj.count = 0;
          }

          // Якщо задано колір полігонального контуру — встановлюємо
          if (currentCurve.pointsObj.polygonalColor !== null) {
            document.getElementById("polygonal-chain-color").value =
              currentCurve.pointsObj.polygonalColor;
            document.getElementById("polygonal-chain-radio").checked = true;
          }

          // Якщо задано колір полігональної фігури — встановлюємо
          if (currentCurve.pointsObj.polygonalFigColor !== null) {
            document.getElementById("polygonal-color").value =
              currentCurve.pointsObj.polygonalFigColor;
            document.getElementById("polygonal-radio").checked = true;
          }
        }
      }
    }

    // Виводимо основну інформацію про криву в елементи інтерфейсу
    [
      "Name : " + currentCurve.name,
      "Method : " + currentCurve.type, // ! Тут може бути помилка: використовується type, хоча передавалося method
    ].forEach(
      (text, i) => (getElement("#info-curve").children[i].textContent = text)
    );

    // Додаємо ще одне контекстне меню (ймовірно, загальне)
    document.body.appendChild(contextMenu);

    // Додаємо криву до загального масиву
    allCurves.push(currentCurve);

    // Зберігаємо форму релевантності (ймовірно, для оновлення інтерфейсу)
    saveRelForm();
  }
});


let pointsRelArr = [];
let pointsPoiArr = [];
let pointsStaticArr = [];
let mainBezierRel = [];

// Рекурсивна функція для обчислення факторіала числа n
function factorial(n) {
  return n <= 1 ? 1 : n * factorial(n - 1);
}

// Обчислення коефіцієнта Бернштейна Bᵢⁿ(t) для кривої Безьє
function bernstein(n, i, t) {
  return (
    (factorial(n) / (factorial(i) * factorial(n - i))) *  // Біноміальний коефіцієнт
    Math.pow(t, i) *                                       // t^i
    Math.pow(1 - t, n - i)                                 // (1 - t)^(n - i)
  );
}


// Функція для згладжування переходу між двома кубічними кривими Безьє
// `segment` та `nextSegment` — масиви з 4 точок: P0, P1, P2, P3 та Q0, Q1, Q2, Q3
// Параметр `q` (від 0 до 1) регулює ступінь згладжування
function ensureSmoothBezier(segment, nextSegment, q = 0.2) {
  // Якщо наступного сегмента немає — повертаємо як є
  if (!nextSegment)
    return { updatedCurrent: segment, updatedNext: nextSegment };

  console.log(segment);
  console.log(nextSegment);

  // Деструктуризація: отримуємо точки поточного сегмента
  let [P0, P1, P2, P3] = segment;
  // І точки наступного сегмента
  let [Q0, Q1, Q2, Q3] = nextSegment;

  // Розрахунок нової координати останньої точки поточного сегмента (P3)
  // Згладжування на основі передостанньої точки поточного (P2) і другої точки наступного (Q1)
  let newP3X = (+P2.x + q * +Q1.x) / (1 + q);
  let newP3Y = (+P2.y + q * +Q1.y) / (1 + q);

  // Оновлення координат P3 — кінець першого сегмента вирівнюється для плавного переходу
  P3.x = newP3X;
  P3.y = newP3Y;

  console.log(P3);
  console.log(Q0);

  // Повертаємо оновлені сегменти
  return { updatedCurrent: segment, updatedNext: nextSegment };
}


// Кубічна крива Безьє: обчислення точки на кривій для заданого t
function bezierCurve(t, P0, P1, P2, P3) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;
  const uuu = uu * u;
  const ttt = tt * t;

  const p = {
    x: Math.round(
      (uuu * P0.x + 3 * uu * t * P1.x + 3 * u * tt * P2.x + ttt * P3.x) * 100
    ) / 100,
    y: Math.round(
      (uuu * P0.y + 3 * uu * t * P1.y + 3 * u * tt * P2.y + ttt * P3.y) * 100
    ) / 100,
  };

  return p;  // Повертає координати точки на кривій
}

// Лінійна крива Безьє (2 точки): пряма лінія
function linearBezier(t, P0, P1) {
  return {
    x: (1 - t) * P0.x + t * P1.x,
    y: (1 - t) * P0.y + t * P1.y,
  };
}

// Квадратична крива Безьє (3 точки): парабола
function quadraticBezier(t, P0, P1, P2) {
  const u = 1 - t;
  const tt = t * t;
  const uu = u * u;

  return {
    x: uu * P0.x + 2 * u * t * P1.x + tt * P2.x,
    y: uu * P0.y + 2 * u * t * P1.y + tt * P2.y,
  };
}

// Генерація масиву точок кривої при зміні параметра t
// (t_min, t_max, t_step мають бути визначені глобально)
function autoT(points) {
  let bezierCurveArr = [];
  for (let t = t_min; t <= t_max; t += t_step) {
    bezierCurveArr.push(
      bezierCurve(t, points[0], points[1], points[2], points[3])
    );
  }
  return bezierCurveArr;
}

// Обчислення біноміального коефіцієнта: "n choose k"
function binomialCoefficient(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}

// Функція для обчислення матриці N для обчислення кривої Безьє
function computeNMatrix(n) {
  let N = [];

  // Цикл для заповнення матриці N
  for (let i = 0; i <= n; i++) {
    let row = [];
    for (let j = 0; j <= n; j++) {
      // Заповнюємо значення матриці, якщо умова i + j <= n виконується
      if (i + j <= n) {
        row.push(
          binomialCoefficient(n, j) * // Біноміальний коефіцієнт для першого множника
            binomialCoefficient(n - j, n - i - j) * // Біноміальний коефіцієнт для другого множника
            Math.pow(-1, n - i - j) // Зміна знака для кожного елемента
        );
      } else {
        row.push(0); // Якщо умова не виконується, додаємо 0
      }
    }
    N.push(row); // Додаємо рядок до матриці N
  }
  NMain = N; // Зберігаємо матрицю N у глобальну змінну (необов'язково)

  return N; // Повертаємо матрицю N
}

// Функція для множення матриці на вектор
function multiplyMatrixVector(matrix, vector) {
  // Перевіряємо, чи є матриця та вектор масивами
  if (!Array.isArray(matrix) || !Array.isArray(vector)) {
    throw new Error("Matrix or vector is not an array"); // Викидаємо помилку, якщо не є масивами
  }

  // Множимо матрицю на вектор
  return matrix.map((row, rowIndex) => {
    // Перевіряємо, чи є кожен рядок масивом
    if (!Array.isArray(row)) {
      console.error(`Row ${rowIndex} is not an array`, row);
      throw new Error("Expected row to be an array"); // Викидаємо помилку, якщо рядок не є масивом
    }

    let sum = 0;
    // Перемножуємо кожен елемент ряду на відповідний елемент вектора
    for (let i = 0; i < row.length; i++) {
      sum += row[i] * (vector[i] ?? 0); // Якщо елемент вектора не визначений, використовуємо 0
    }
    return sum; // Повертаємо результат для поточного рядка
  });
}

// Функція для обчислення координат кривої Безьє через матрицю
function bezierMatrix(points, t) {
  let n = points.length - 1; // Визначаємо кількість точок мінус 1
  let T = [];

  // Створюємо вектор T з елементами t^i для кожної точки
  for (let i = n; i >= 0; i--) {
    T.push(Math.pow(t, i)); // Додаємо значення t^i
  }

  let N = computeNMatrix(n); // Отримуємо матрицю N для заданої кількості точок
  let P_x = points.map((p) => p.x); // Мапуємо координати x всіх точок
  let P_y = points.map((p) => p.y); // Мапуємо координати y всіх точок

  // Обчислюємо координати кривої для x та y
  let B_x = multiplyMatrixVector([T], multiplyMatrixVector(N, P_x))[0];
  let B_y = multiplyMatrixVector([T], multiplyMatrixVector(N, P_y))[0];

  return { x: B_x, y: B_y }; // Повертаємо результат у вигляді об'єкта з координатами
}

// Функція для генерації кривої Безьє за допомогою матриці для всіх значень t
function autoM(points) {
  let bezierCurveArr = [];
  // Для кожного значення t обчислюємо координати кривої
  for (let t = t_min; t <= t_max; t += t_step) {
    let curve = bezierMatrix(points, t); // Отримуємо точку кривої для поточного t
    bezierCurveArr.push(curve); // Додаємо точку в масив
  }
  return bezierCurveArr; // Повертаємо масив точок кривої
}

// Рекурсивна функція для обчислення кривої Безьє методом де Кастельжау
function bezierDeCasteljauRecursive(points, t) {
  // Якщо залишилась лише одна точка, повертаємо її
  if (points.length === 1) {
    return points[0];
  }

  let newPoints = [];
  // Створюємо нові точки для кожної пари сусідніх точок
  for (let i = 0; i < points.length - 1; i++) {
    newPoints.push({
      x: (1 - t) * points[i].x + t * points[i + 1].x, // Обчислюємо нову точку для x
      y: (1 - t) * points[i].y + t * points[i + 1].y, // Обчислюємо нову точку для y
    });
  }

  // Рекурсивно викликаємо функцію для нових точок
  return bezierDeCasteljauRecursive(newPoints, t);
}

// Функція для генерації кривої Безьє за допомогою методу де Кастельжау для всіх значень t
function autoR(points) {
  let bezierCurveArr = [];
  // Для кожного значення t обчислюємо точку кривої
  for (let t = t_min; t <= t_max; t += t_step) {
    bezierCurveArr.push(bezierDeCasteljauRecursive(points, t)); // Додаємо точку до масиву
  }
  return bezierCurveArr; // Повертаємо масив точок кривої
}


// Функція для розбиття масиву на частини по 4 елементи
function splitArrayIntoChunks(array) {
  let result = [];
  let i = 0;

  // Цикл для створення шматків по 4 елементи
  for (i = 0; i < array.length - 3; i += 3) {
    let P0 = array[i],
      P1 = array[i + 1],
      P2 = array[i + 2],
      P3 = array[i + 3];
    let chunk = [];
    chunk.push(P0, P1, P2, P3); // Додаємо 4 точки в поточний шматок

    result.push(chunk); // Додаємо шматок у результат
  }

  // Створюємо останній шматок для залишкових елементів, якщо вони є
  let chunk = [];
  for (; i < array.length; i++) {
    chunk.push(array[i]); // Додаємо залишкові точки
  }
  result.push(chunk); // Додаємо останній шматок до результату

  // Якщо останній шматок містить лише одну точку і є більше ніж один шматок, видаляємо останній шматок
  if (result[result.length - 1].length === 1 && result.length !== 1) {
    result.length = result.length - 1;
  }

  return result; // Повертаємо результат
}

// Функція для обробки "неправильних" шматків (з менш ніж 4 точками) в масиві точок
function exceptionClue(chunkedPoints, points) {
  const lastSegment = chunkedPoints[chunkedPoints.length - 1]; // Останній шматок
  const remainingPointsCount = lastSegment.length; // Кількість точок в останньому шматку

  // Якщо є більше одного шматка
  if (chunkedPoints.length > 1) {
    switch (remainingPointsCount) {
      case 2:
        // Якщо в останньому шматку 2 точки
        const [P1, P2] = lastSegment;
        const interpPoints = [
          // Створюємо дві проміжні точки між P1 і P2
          new PointPoiObj(
            P1.x + ((P2.x - P1.x) * 1) / 3,
            P1.y + ((P2.y - P1.y) * 1) / 3,
            "#FF0000"
          ),
          new PointPoiObj(
            P1.x + ((P2.x - P1.x) * 2) / 3,
            P1.y + ((P2.y - P1.y) * 2) / 3,
            "#FF0000"
          ),
        ];
        // Оновлюємо останній шматок, додаючи нові проміжні точки
        chunkedPoints[chunkedPoints.length - 1] = [P1, ...interpPoints, P2];

        // Знаходимо індекс P1 в масиві points і додаємо проміжні точки після P1
        const indexP1 = points.findIndex((point) => point.id === P1.id);
        if (indexP1 !== -1) {
          points.splice(indexP1 + 1, 0, ...interpPoints); // Додаємо нові точки
        }
        break;

      case 3:
        // Якщо в останньому шматку 3 точки
        const [pointP1, pointP2, pointP3] = lastSegment;
        const mid2 = new PointPoiObj(
          (pointP2.x + pointP3.x) / 2, // Обчислюємо середину між P2 і P3
          (pointP2.y + pointP3.y) / 2, // Обчислюємо середину між P2 і P3
          "#FF0000"
        );
        // Оновлюємо останній шматок, додаючи нову точку між P2 і P3
        chunkedPoints[chunkedPoints.length - 1] = [
          pointP1,
          pointP2,
          mid2,
          pointP3,
        ];

        // Знаходимо індекс P2 в масиві points і додаємо середню точку після P2
        const indexP2 = points.findIndex((point) => point.id === pointP2.id);
        if (indexP2 !== -1) {
          points.splice(indexP2 + 1, 0, mid2); // Додаємо нову точку
        }
        break;
    }
  }
  return chunkedPoints; // Повертаємо оновлені шматки
}


// Функція для підготовки кривої з точок
function prepareCurve(points) {
  // Ітерація по точках і перевірка сегментів
  for (let i = 0; i < points.length - 1; i++) {
    let segment = points[i];
    let nextSegment = points[i + 1];

    // Якщо сегмент містить 4 або більше точок, застосовуємо функцію ensureSmoothBezier
    if (segment.length >= 4) {
      const { updatedCurrent, updatedNext } = ensureSmoothBezier(
        segment,
        nextSegment
      );
      // Оновлюємо поточний та наступний сегменти точок
      points[i] = updatedCurrent;
      points[i + 1] = updatedNext;
    }
  }
  console.log(points); // Виводимо оновлені точки
}

// Функція для побудови першого сегмента кривої на основі точок
function buildFirstSegment(points) {
  let tempArr = [];
  switch (points[0].length) {
    case 1:
      tempArr.push(points[0][0]); // Якщо точка одна, повертаємо її як є
      return tempArr;

    case 2:
      // Якщо точок 2, генеруємо лінійну криву
      for (t = t_min; t <= t_max; t += t_step) {
        tempArr.push(linearBezier(t, points[0][0], points[0][1])); // Генерація лінійної кривої
      }
      return tempArr;

    case 3:
      // Якщо точок 3, генеруємо квадратичну криву
      for (t = t_min; t <= t_max; t += t_step) {
        tempArr.push(
          quadraticBezier(t, points[0][0], points[0][1], points[0][2])
        );
      }
      return tempArr;

    case 4:
      // Якщо точок 4, генеруємо кубічну криву
      for (t = t_min; t <= t_max; t += t_step) {
        tempArr.push(
          bezierCurve(t, points[0][0], points[0][1], points[0][2], points[0][3])
        );
      }
      return tempArr;
  }
}

// Функція для побудови кривих за допомогою параметричних рівнянь
function parametricBuild(points) {
  let chunkedPoints = splitArrayIntoChunks(points); // Розбиваємо точки на шматки
  smoothedCurves = [];
  chunkedPoints = exceptionClue(chunkedPoints, points); // Обробляємо "неправильні" шматки
  if (chunkedPoints.length > 1) {
    prepareCurve(chunkedPoints); // Підготовка кривих для сегментів
    smoothedCurves = chunkedPoints.map((segment) => autoT(segment)); // Генерація кривих для кожного сегмента
  } else {
    // Обробка випадку, якщо тільки один сегмент
  }

  smoothedCurves.push(buildFirstSegment(chunkedPoints)); // Додаємо перший сегмент кривої
  console.log(smoothedCurves); // Виводимо результати
  draw(smoothedCurves, chunkedPoints); // Малюємо криву
}

// Функція для рекурсивного побудови кривих
function recursiveBuild(points) {
  let chunkedPoints = splitArrayIntoChunks(points); // Розбиваємо точки на шматки
  smoothedCurves = [];
  chunkedPoints = exceptionClue(chunkedPoints, points); // Обробляємо "неправильні" шматки
  if (chunkedPoints.length > 1) {
    prepareCurve(chunkedPoints); // Підготовка кривих для сегментів
  }
  smoothedCurves = chunkedPoints.map((segment) => autoR(segment)); // Генерація кривих для кожного сегмента
  draw(smoothedCurves, chunkedPoints); // Малюємо криву
}

// Функція для побудови кривих за допомогою матричних рівнянь
function matrixBuild(points) {
  let chunkedPoints = splitArrayIntoChunks(points); // Розбиваємо точки на шматки

  chunkedPoints = exceptionClue(chunkedPoints, points); // Обробляємо "неправильні" шматки
  if (chunkedPoints.length > 1) {
    prepareCurve(chunkedPoints); // Підготовка кривих для сегментів
  }
  smoothedCurves = chunkedPoints.map((segment) => autoM(segment)); // Генерація кривих для кожного сегмента
  draw(smoothedCurves, chunkedPoints); // Малюємо криву
}

// Функція для редагування точки
function editPoint() {
  let currentPoint = Number(localStorage.getItem("currentPoint")); // Отримуємо поточну точку з localStorage
  let icons_curve = document.getElementsByClassName("icon-curve"); // Отримуємо всі елементи з класом "icon-curve"
  let iconsArray = Array.from(icons_curve); // Перетворюємо HTMLCollection в масив
  const iconIndex = iconsArray.findIndex(
    (icon) => icon.dataset.pointId == currentPoint // Знаходимо індекс поточної іконки на основі ID
  );

  // Якщо метод кривої - "Points", редагуємо точку в масиві точок
  if (currentCurve.method == "Points") {
    const pointtIndex = pointsPoiArr.findIndex(
      (point) => point.id == currentPoint // Знаходимо індекс точки за ID
    );
    if (pointtIndex !== -1) {
      // Оновлюємо координати точки та її колір
      pointsPoiArr[pointtIndex].x = +document.getElementById("x-input").value;
      pointsPoiArr[pointtIndex].y = +document.getElementById("y-input").value;
      pointsPoiArr[pointtIndex].colorPoi =
        document.getElementById("points-color-input").value;
      
      // Якщо точка ще не була редагована, оновлюємо статичні точки
      if (!isEdited) {
        pointsStaticArr[pointtIndex].x =
          +document.getElementById("x-input").value;
        pointsStaticArr[pointtIndex].y =
          +document.getElementById("y-input").value;
        pointsStaticArr[pointtIndex].colorPoi =
          document.getElementById("points-color-input").value;
      }
    }
  }

  // Скидаємо значення в полях форми після редагування
  document.getElementById("x-input").value = 0;
  document.getElementById("y-input").value = 0;
  document.getElementById("points-color-input").value = "#000000";
}

// Функція для видалення точки за ID
function delPoint(id) {
  const pointId = id;
  // Якщо метод кривої - "Points", видаляємо точку з масивів точок
  if (currentCurve.method == "Points") {
    const pointtIndex = pointsPoiArr.findIndex((point) => point.id == pointId);
    if (pointtIndex !== -1) {
      // Видаляємо точку з масивів точок
      pointsPoiArr.splice(pointtIndex, 1);
      pointsStaticArr.splice(pointtIndex, 1);
    }
  }
}

// Статичний масив для точок
const listStatic = [];

// Функція для створення релевантної точки
function createPointRel() {
  // Створюємо об'єкт точки з введеними координатами та кольором
  let pointsObj = new PointPoiObj(
    +document.getElementById("x-input").value,
    +document.getElementById("y-input").value,
    form_rel.points_color_input.value
  );
  // Додаємо точку до масивів
  pointsStaticArr.push(pointsObj);
  pointsRelArr.push(pointsObj);
  
  // Очищаємо поля форми після створення точки
  document.getElementById("x-input").value = 0;
  document.getElementById("y-input").value = 0;
  form_rel.points_color_input.value = "#000000";
}

// Функція для створення точки з координатами та кольором
function createPointPoi() {
  // Створюємо об'єкт точки з введеними координатами та кольором
  let pointsObj = new PointPoiObj(
    +document.getElementById("x-input").value,
    +document.getElementById("y-input").value,
    "#000000" // Колір за замовчуванням - чорний
  );
  // Додаємо точку до масивів
  pointsStaticArr.push(pointsObj);
  pointsPoiArr.push(pointsObj);

  // Очищаємо поля форми після створення точки
  document.getElementById("x-input").value = 0;
  document.getElementById("y-input").value = 0;
  document.getElementById("points-color-input").value = "#000000";
}

// Функція для перевірки форми та створення точки в залежності від методу
function checkPointForm() {
  // В залежності від методу створюємо точку відповідного типу
  if (currentCurve.method == "Relevant") {
    createPointRel(); // Створюємо релевантну точку
  } else if (currentCurve.method == "Points") {
    createPointPoi(); // Створюємо точку типу "Points"
  }
}

// Функція для створення кривої типу "Rel"
function createRelCurve() {
  // Встановлюємо колір кривої з введеного значення
  currentCurve.colorCurve = document.getElementById("curve-input").value;

  // Якщо метод - "Points", створюємо об'єкт кривої на основі точки
  if (currentCurve.method == "Points") {
    let pointCurve;

    // Якщо вибрано "Polygonal Chain", створюємо лінійну ланцюгову криву
    if (document.getElementById("polygonal-chain-radio").checked) {
      pointCurve = new Points(
        document.getElementById("polygonal-chain-color").value, // Колір ланцюга
        null, // Не використовується для цього методу
        structuredClone(pointsPoiArr) // Копія масиву точок
      );
    } 
    // Якщо вибрано "Polygonal", створюємо полігональну криву
    else if (document.getElementById("polygonal-radio").checked) {
      pointCurve = new Points(
        null, // Не використовується для цього методу
        document.getElementById("polygonal-color").value, // Колір полігону
        structuredClone(pointsPoiArr) // Копія масиву точок
      );
    }

    // Присвоюємо точку до поточної кривої
    currentCurve.pointsObj = pointCurve;
  }

  // В залежності від типу кривої, викликаємо відповідну функцію для побудови кривої
  switch (currentCurve.type) {
    case "Parametric":
      // Для параметричних кривих
      if (currentCurve.method == "Relevant") {
        parametricBuild(pointsRelArr);
      } else if (currentCurve.method == "Points") {
        parametricBuild(pointsPoiArr);
      }
      break;
    case "Recursive":
      // Для рекурсивних кривих
      if (currentCurve.method == "Relevant") {
        recursiveBuild(pointsRelArr);
      } else if (currentCurve.method == "Points") {
        recursiveBuild(pointsPoiArr);
      }
      break;
    case "Matrix":
      // Для матричних кривих
      if (currentCurve.method == "Relevant") {
        matrixBuild(pointsRelArr);
      } else if (currentCurve.method == "Points") {
        matrixBuild(pointsPoiArr);
      }
      break;
  }
}

// Функція для перевірки форми та виклику створення кривої
function checkRelForm() {
  createRelCurve();
}

// Функція для зупинки масштабування та очищення канвасу
function stopScale() {
  ctx.clearRect(0, 0, widthCan, heightCan); // Очищаємо канвас

  drawGrid(); // Малюємо сітку на канвасі

  // Якщо масиви точок не порожні, створюємо криву
  if (pointsRelArr.length != 0) {
    createRelCurve();
  }
  if (pointsPoiArr.length != 0) {
    createRelCurve();
  }
}

// Викликаємо stopScale для початкової ініціалізації
stopScale();

// Функція для оновлення розміру канвасу
function updateCanvasSize() {
  canvas.width = 1300; // Встановлюємо ширину канвасу
  canvas.height = 700; // Встановлюємо висоту канвасу
  drawGrid(); // Малюємо сітку
}

// Слухач подій для натискання клавіші на клавіатурі
window.addEventListener("keydown", (event) => {
  // Якщо натиснута клавіша Ctrl, включаємо панорамний режим
  if (event.ctrlKey) {
    isPanMode = true;
    contextMenu.style.display = "none"; // Сховуємо контекстне меню
    contextMenuCurve.style.display = "none"; // Сховуємо контекстне меню для кривих
  }
});

// Слухач подій для відпускання клавіші на клавіатурі
window.addEventListener("keyup", (event) => {
  // Якщо клавіша Ctrl відпущена, вимикаємо панорамний режим
  if (!event.ctrlKey) {
    isPanMode = false;
  }
});


// Функція для визначення значення кроку (step) в залежності від масштабу
function getStepValue() {
  const steps = [0.1, 0.5, 1, 2, 5, 10, 25, 50, 100, 150, 200]; // Масив доступних кроків

  let stepValue = steps[0]; // Початкове значення кроку

  // Перевірка значення масштабу і коригування значення масштабу
  if (scale <= 1000 && scale > 0.78) {
    // Не робимо нічого, якщо масштаб знаходиться в межах
  } else {
    scale = 0.79; // Встановлюємо масштаб в мінімум, якщо він виходить за межі
  }

  if (scale > 700) newScale = 699; // Якщо масштаб більше 700, встановлюємо його на 699

  // Визначення кроку в залежності від масштабу
  for (let i = 0; i < steps.length; i++) {
    if (150 / scale <= steps[i]) {
      stepValue = steps[i];
      break;
    }
  }

  return stepValue; // Повертаємо обране значення кроку
}

// Функція для форматування значення підпису
function formatTickValue(value) {
  return value % 1 === 0 ? value.toFixed(0) : value.toFixed(2); // Якщо ціле число, округлюємо до цілого
}

// Функція для малювання сітки на канвасі
function drawGrid() {
  isSystem = true; // Вказуємо, що ми малюємо системну сітку
  ctx.restore(); // Відновлюємо попередній стан контексту
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаємо канвас

  ctx.save(); // Зберігаємо поточний стан контексту

  ctx.translate(offsetX, offsetY); // Переміщаємо контекст на задані координати

  const stepValue = getStepValue(); // Отримуємо значення кроку для сітки
  if (Math.abs(stepValue - prevStep) > 0.1) {
    prevStep = getStepValue(); // Оновлюємо попередній крок
    baseStep = 100; // Встановлюємо базовий крок
  }
  let stepSize = baseStep; // Розмір кроку

  let subDivisions;
  baseStep <= 100 ? (subDivisions = 3) : (subDivisions = 4); // Визначаємо кількість підподілів
  const subStep = stepSize / subDivisions; // Розмір підподілу

  // Початкова та кінцева координати для сітки
  const startX = -offsetX;
  const startY = -offsetY;
  const endX = canvas.width - offsetX;
  const endY = canvas.height - offsetY;

  ctx.beginPath(); // Початок малювання
  ctx.strokeStyle = "#eee"; // Колір для підподілів

  // Малювання підподілів
  for (let x = Math.floor(startX / subStep) * subStep; x < endX; x += subStep) {
    for (
      let y = Math.floor(startY / subStep) * subStep;
      y < endY;
      y += subStep
    ) {
      ctx.strokeRect(x, y, subStep, subStep); // Малюємо прямокутники для підподілів
    }
  }
  ctx.stroke(); // Завершуємо малювання

  // Малювання основних ліній сітки
  ctx.beginPath();
  ctx.strokeStyle = "#ddd"; // Колір для основних ліній
  for (
    let x = Math.floor(startX / stepSize) * stepSize;
    x < endX;
    x += stepSize
  ) {
    ctx.moveTo(x, startY);
    ctx.lineTo(x, endY); // Малюємо вертикальні лінії
  }
  for (
    let y = Math.floor(startY / stepSize) * stepSize;
    y < endY;
    y += stepSize
  ) {
    ctx.moveTo(startX, y);
    ctx.lineTo(endX, y); // Малюємо горизонтальні лінії
  }
  ctx.stroke();

  // Малювання осей
  ctx.beginPath();
  ctx.strokeStyle = "black"; // Колір для осей
  ctx.lineWidth = 2; // Товщина ліній осей
  ctx.moveTo(startX, 0);
  ctx.lineTo(endX, 0); // Горизонтальна вісь
  ctx.moveTo(0, startY);
  ctx.lineTo(0, endY); // Вертикальна вісь
  ctx.stroke();

  // Малювання підписів для шкали
  ctx.font = "16px Arial";
  ctx.fillStyle = "black";
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  // Малюємо підписи на осі X
  for (
    let x = Math.floor(startX / stepSize) * stepSize;
    x < endX;
    x += stepSize
  ) {
    ctx.fillText(formatTickValue((x / stepSize) * stepValue), x, 5);
  }

  // Малюємо підписи на осі Y
  for (
    let y = Math.floor(startY / stepSize) * stepSize;
    y < endY;
    y += stepSize
  ) {
    ctx.fillText(formatTickValue((-y / stepSize) * stepValue), 5, y);
  }

  // Малюємо додаткові підписи, якщо частина сітки виходить за межі канвасу
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
}

// Оновлення та відображення масштабу
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

// Функція для оновлення відображення масштабу
function updateScaleDisplay() {
  scaleDisplay.textContent = `Scale: ${scale.toFixed(
    2
  )}, Step: ${baseStep.toFixed(2)}`;
}


// Слухач події "wheel" для обробки масштабування на канвасі за допомогою колеса миші
canvas.addEventListener("wheel", (event) => {
  event.preventDefault(); // Зупиняємо стандартну поведінку (прокручування сторінки)

  // Отримуємо координати миші відносно канваса
  const mouseX = event.clientX - canvas.getBoundingClientRect().left;
  const mouseY = event.clientY - canvas.getBoundingClientRect().top;

  // Визначаємо коефіцієнт масштабування в залежності від напрямку прокручування
  const scaleFactor = event.deltaY < 0 ? 1.1 : 0.9;
  let newScale = scale * scaleFactor; // Обчислюємо новий масштаб

  // Обмежуємо масштаб у межах допустимих значень
  if (newScale < 0.22) newScale = 0.22;
  if (newScale > 700) newScale = 699;

  // Оновлюємо розмір кроку для сітки в залежності від масштабу
  if (baseStep <= 200 && baseStep >= 100) {
    baseStep = baseStep * scaleFactor;
  }
  scale = newScale; // Оновлюємо масштаб

  // Перераховуємо координати в світі (в глобальних одиницях)
  const worldX = (mouseX - offsetX) / scale;
  const worldY = (mouseY - offsetY) / scale;

  updateScaleDisplay(); // Оновлюємо відображення масштабу

  // Перемальовуємо всі криві після зміни масштабу
  for (let i = 0; i < allCurves.length; i++) {
    currentCurve = allCurves[i];
    createRelCurve(); // Створюємо криву
  }
});

// Слухач події "mousemove" для обробки панорамування (переміщення канваса)
canvas.addEventListener("mousemove", (event) => {
  // Якщо активний режим панорамування (при натиснутій клавіші Ctrl)
  if (isPanMode) {
    offsetX += event.movementX; // Оновлюємо зсув по X
    offsetY += event.movementY; // Оновлюємо зсув по Y
    drawGrid(); // Перемальовуємо сітку
    // Перемальовуємо всі криві після переміщення
    for (let i = 0; i < allCurves.length; i++) {
      currentCurve = allCurves[i];
      createRelCurve(); // Створюємо криву
    }
  }
});

// Слухач події "resize" для адаптації канваса до розміру вікна
window.addEventListener("resize", updateCanvasSize);

// Оновлюємо розмір канваса після завантаження
updateCanvasSize();

// Функція для скидання канваса (очищення та повернення до початкового стану)
function resetCanva() {
  ctx.clearRect(0, 0, canvas.width, canvas.height); // Очищаємо канвас

  ctx.save(); // Зберігаємо поточний стан контексту
  ctx.restore(); // Відновлюємо попередній стан
  drawGrid(); // Перемальовуємо сітку

  // Скидаємо значення полів введення
  document.getElementById("x-input").value = 0;
  document.getElementById("y-input").value = 0;
  document.getElementById("curve-input").value = "#000000";

  // Очищаємо масиви точок
  pointsRelArr = [];
  pointsPoiArr = [];

  // Отримуємо елемент для списку
  const list_wraper = getElement("#list-wraper");

  // Очищаємо властивості поточної кривої
  currentCurve.colorCurve = null;
  currentCurve.relevantObj = null;
  currentCurve.pointsObj = null;
  isSystem = false; // Вимикаємо систему координат
  pointsStaticArr = [];
  smoothedCurves = [];
}

// Змінні для обробки перетягування та зміни розміру
let draggingPoint = null;
let boundingBox = null;
let prevboundingBox = null;
let startX, startY;
let angle = 0; // Кут повороту для змінного прямокутника

let isResizing = false; // Чи відбувається зміна розміру
let resizeStart = { x: 0, y: 0 }; // Початкова позиція для зміни розміру
let resizeCorner = ""; // Кут для зміни розміру
let handles = []; // Ручки для зміни розміру

// Функція для малювання обрамляючого прямокутника
function drawBoundingBox() {
  if (!boundingBox) return; // Якщо немає обрамляючого прямокутника, нічого не малюємо
  handles = []; // Очищаємо масив ручок
  ctx.save(); // Зберігаємо поточний стан контексту

  ctx.translate(boundingBox.cx, boundingBox.cy); // Переміщаємо координати прямокутника
  ctx.rotate(angle); // Повертаємо прямокутник на вказаний кут
  ctx.strokeStyle = "blue"; // Колір обрамляючого прямокутника
  ctx.lineWidth = 1; // Товщина лінії
  ctx.strokeRect(
    -boundingBox.width / 2 - 2, // Позиція лівого верхнього кута
    -boundingBox.height / 2 - 2, // Позиція правого нижнього кута
    boundingBox.width + 4, // Ширина прямокутника
    boundingBox.height + 4 // Висота прямокутника
  );
  ctx.restore(); // Відновлюємо попередній стан контексту
}


  // drawHandle(
  //   parseFloat(((boundingBox.x - 2) / baseStep) * getStepValue()),
  //   parseFloat(((-boundingBox.y - 2) / baseStep) * getStepValue()),
  //   "↘",
  //   "bottom-left"
  // );
  // drawHandle(
  //   parseFloat(((boundingBox.x - 2) / baseStep) * getStepValue()),
  //   parseFloat(((-boundingBox.maxy - 2) / baseStep) * getStepValue()),
  //   "↙",
  //   "top-left"
  // );
  // drawHandle(
  //   parseFloat(
  //     ((boundingBox.x + boundingBox.width - 2) / baseStep) * getStepValue()
  //   ),
  //   parseFloat(((-boundingBox.maxy - 2) / baseStep) * getStepValue()),
  //   "↗",
  //   "top-right"
  // );
  // drawHandle(
  //   parseFloat(
  //     ((boundingBox.x + boundingBox.width - 2) / baseStep) * getStepValue()
  //   ),
  //   parseFloat(((-boundingBox.y - 2) / baseStep) * getStepValue()),
  //   "↖",
  //   "bottom-right"
  // );

  // Draw rotate handle (top-center)


// function drawHandle(x, y, symbol, corner) {
//   ctx.fillStyle = "white";
//   ctx.strokeStyle = "blue";
//   ctx.lineWidth = 1;
//   ctx.beginPath();
//   ctx.arc(transferCoordsX(x), transferCoordsY(y), 5, 0, Math.PI * 2);
//   ctx.fill();
//   ctx.stroke();
//   ctx.fillStyle = "blue";
//   ctx.font = "10px Arial";
//   ctx.fillText(symbol, x - 3, y + 3);

//   handles.push({ x, y, corner });
// }

canvas.addEventListener("mousedown", (e) => {
  // Проходимо по всіх ручках (handles) обрамляючого прямокутника
  handles.forEach((handle) => {
    // Перевіряємо, чи точка натискання миші знаходиться в межах діаметра ручки (6px)
    if (
      Math.hypot(
        transferCoordsX(handle.x) - (lastMousePos.x - offsetX), // Різниця між X координатою миші та ручки
        transferCoordsY(handle.y) - (lastMousePos.y - offsetY) // Різниця між Y координатою миші та ручки
      ) < 6 // Перевірка на те, чи близька точка натискання до ручки
    ) {
      isResizing = true; // Якщо натискання сталося на ручку, активуємо режим зміни розміру
      resizeStart = { 
        x: lastMousePos.x - offsetX, // Зберігаємо початкову позицію миші відносно канваса
        y: lastMousePos.y - offsetY, // Зберігаємо початкову позицію миші по Y
      };
      console.log(handle); // Виводимо в консоль інформацію про обрану ручку
      resizeCorner = handle.corner; // Зберігаємо сторону (кут) ручки, що обрана для зміни розміру
    }
  });
});


// canvas.addEventListener("mousemove", (e) => {
//   if (!isResizing) return;
//   prevboundingBox = structuredClone(boundingBox);
//   let x = lastMousePos.x - offsetX;
//   let y = lastMousePos.y - offsetY;

//   let dx = x - resizeStart.x;
//   let dy = y - resizeStart.y;

//   if (resizeCorner.includes("top")) {
//     console.log(
//       "TOP: Before - y:",
//       boundingBox.y,
//       "height:",
//       boundingBox.height
//     );
//     boundingBox.height += parseFloat((dy / baseStep) * getStepValue()) * 30;
//     boundingBox.y -= parseFloat((dy / baseStep) * getStepValue());

//     console.log(
//       "TOP: After - y:",
//       boundingBox.y,
//       "height:",
//       boundingBox.height
//     );
//   }
//   if (resizeCorner.includes("bottom")) {
//     console.log("loh");
//     // boundingBox.y += parseFloat((dy / baseStep) * getStepValue());

//     boundingBox.height -= parseFloat((dy / baseStep) * getStepValue()) * 30;
//   }
//   if (resizeCorner.includes("left")) {
//     boundingBox.width -= dx;
//     boundingBox.x += dx;
//   }
//   if (resizeCorner.includes("right")) {
//     boundingBox.width += dx;
//   }

//   let scaleX = boundingBox.width / prevboundingBox.width;
//   let scaleY = boundingBox.height / prevboundingBox.height;
//   let minX = Math.min(...pointsPoiArr.map((p) => p.x));
//   let maxX = Math.max(...pointsPoiArr.map((p) => p.x));

//   let minY = Math.min(...pointsPoiArr.map((p) => p.y));
//   let maxY = Math.max(...pointsPoiArr.map((p) => p.y));

//   pointsPoiArr.forEach((p) => {
//     if (resizeCorner.includes("bottom")) {
//       console.log("hi");
//       let newY =
//         parseFloat((prevboundingBox.y / baseStep) * getStepValue()) +
//         (p.y - parseFloat((boundingBox.y / baseStep) * getStepValue())) *
//           scaleY;

//           if (newY <= maxY - 0.2) p.y = newY;
//     }
//     if (resizeCorner.includes("top")) {
//       let newY =
//         parseFloat((prevboundingBox.y / baseStep) * getStepValue()) +
//         (p.y - parseFloat((boundingBox.y / baseStep) * getStepValue())) *
//           scaleY;
//           console.log(newY);
//           console.log(maxY);
//           console.log(maxY - 0.2);

//       if (newY >= minY + 0.2) p.y = newY;

//     }
//     if (resizeCorner.includes("left")) {
//       let newX =
//         parseFloat((boundingBox.x / baseStep) * getStepValue()) +
//         (p.x - parseFloat((prevboundingBox.x / baseStep) * getStepValue())) *
//           scaleX;
//       if (newX > minX + 0.2) p.x = newX;

//     }
//     if (resizeCorner.includes("right")) {
//       let newX =
//         parseFloat((boundingBox.x / baseStep) * getStepValue()) +
//         (p.x - parseFloat((prevboundingBox.x / baseStep) * getStepValue())) *
//           scaleX;

//       if (newX > minX + 0.2) p.x = newX;
//     }
//   });
//   resizeStart = { x, y };

//   for (let i = 0; i < allCurves.length; i++) {
//     currentCurve = allCurves[i];
//     createRelCurve();
//   }
// });

// Подія, що активується при відпусканні кнопки миші
canvas.addEventListener("mouseup", () => {
  isResizing = false; // Зупиняємо зміну розміру
});

// Подія, що активується при русі миші
canvas.addEventListener("mousemove", (e) => {
  lastMousePos = getMousePos(e); // Оновлюємо позицію миші
});

// Функція для обчислення обрамляючого прямокутника (bounding box) для масиву точок
function calculateBoundingBox(points) {
  let flatPoints = points.flat(); // Сплющуємо масив точок, якщо він багатовимірний
  let minX = Math.min(...flatPoints.map((p) => p.x)); // Знаходимо мінімум X
  let maxX = Math.max(...flatPoints.map((p) => p.x)); // Знаходимо максимум X
  let minY = Math.min(...flatPoints.map((p) => p.y)); // Знаходимо мінімум Y
  let maxY = Math.max(...flatPoints.map((p) => p.y)); // Знаходимо максимум Y

  boundingBox = {
    x: transferCoordsX(minX), // X координата обрамляючого прямокутника
    y: transferCoordsY(minY), // Y координата обрамляючого прямокутника
    maxy: transferCoordsY(maxY), // Максимальна Y координата
    width: transferCoordsX(maxX) - transferCoordsX(minX), // Ширина прямокутника
    height: transferCoordsY(maxY) - transferCoordsY(minY), // Висота прямокутника
    cx: transferCoordsX((minX + maxX) / 2), // Центр по X
    cy: transferCoordsY((minY + maxY) / 2), // Центр по Y
  };
  
  // Зберігаємо попередній стан обрамляючого прямокутника для подальших порівнянь
  prevboundingBox = { ...boundingBox };
}

// Функція для малювання кривої, переданої масивом точок
function drawCurve(points) {
  if (points.length === 0) return; // Якщо точок немає, не малюємо нічого

  ctx.beginPath(); // Починаємо новий шлях
  ctx.moveTo(transferCoordsX(points[0].x), transferCoordsY(points[0].y)); // Початкова точка

  ctx.strokeStyle = currentCurve.colorCurve; // Встановлюємо колір кривої
  ctx.lineWidth = 2; // Встановлюємо товщину лінії

  // Малюємо лінію через всі точки
  for (let i = 1; i < points.length; i++) {
    ctx.lineTo(transferCoordsX(points[i].x), transferCoordsY(points[i].y));
  }

  ctx.stroke(); // Завершуємо малювання лінії
  ctx.closePath(); // Закриваємо шлях
}

// Функція для малювання всієї сцени: сітки, кривих, точок
function draw(smoothedCurves, chunkedPoints) {
  drawGrid(); // Малюємо сітку

  if (pointsPoiArr.length == 0) { // Якщо точок немає, не малюємо криві
    return;
  }

  // Якщо метод "Points", малюємо точкові криві
  if (currentCurve.method == "Points") {
    for (let i = 0; i < smoothedCurves.length; i++) {
      drawCurve(smoothedCurves[i]); // Малюємо кожну згладжену криву
    }

    // Малюємо лінію між точками, якщо заданий колір для полігональної лінії
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
      ctx.stroke(); // Завершуємо малювання полігональної лінії
    }

    // Малюємо замкнутий полігон, якщо заданий колір для фігури
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
      // Замкнення фігури
      ctx.lineTo(
        transferCoordsX(pointsPoiArr[0].x),
        transferCoordsY(pointsPoiArr[0].y)
      );
      ctx.closePath(); // Закриваємо фігуру
      ctx.stroke(); // Завершуємо малювання фігури
    }

    // Малюємо кожну точку в масиві точок
    pointsPoiArr.forEach((p) => {
      ctx.fillStyle = p.colorPoi; // Колір точки
      ctx.beginPath();
      ctx.arc(transferCoordsX(p.x), transferCoordsY(p.y), 4, 0, Math.PI * 2); // Малюємо точку
      ctx.fill();
    });

    // Обчислюємо обрамляючий прямокутник для точок
    calculateBoundingBox(chunkedPoints);
    drawBoundingBox(); // Малюємо обрамляючий прямокутник
  }
}


// Функція для отримання позиції миші на канвасі
function getMousePos(evt) {
  let rect = canvas.getBoundingClientRect(); // Отримуємо розміри канваса

  return {
    x: evt.clientX - rect.left, // Вираховуємо координату X
    y: evt.clientY - rect.top,  // Вираховуємо координату Y
  };
}

let isEdited = false; // Прапор, який вказує на те, чи відредаговано точку

// Подія для відображення контекстного меню при правому кліку на канвас
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault(); // Запобігаємо стандартному контекстному меню

  // Перевірка, чи знаходиться позиція миші всередині обрамляючого прямокутника
  if (
    boundingBox &&
    offsetX - e.offsetX + boundingBox.x + boundingBox.width <=
      boundingBox.width &&
    lastMousePos.x - offsetX <= boundingBox.x + boundingBox.width &&
    e.offsetY - offsetY - boundingBox.height >= boundingBox.y &&
    lastMousePos.y - offsetY + boundingBox.height <=
      boundingBox.y + boundingBox.height
  ) {
    // Якщо умови виконуються, показуємо контекстне меню для кривої
    contextMenuCurve.style.display = "block";
    contextMenuCurve.style.left = `${e.pageX}px`; // Встановлюємо позицію меню
    contextMenuCurve.style.top = `${e.pageY}px`;  // Встановлюємо позицію меню
    contextMenuCurve.style.background = "white";  // Білий фон
    contextMenuCurve.style.border = "1px solid black"; // Чорна рамка
    contextMenuCurve.style.padding = "5px"; // Відступи
    contextMenuCurve.style.listStyle = "none"; // Без маркерів

    contextMenu.style.display = "none"; // Ховаємо основне контекстне меню
  }
});

// Подія для натискання на кнопку миші
canvas.addEventListener("mousedown", (e) => {
  e.preventDefault(); // Запобігаємо стандартній обробці події
  contextMenuCurve.style.display = "none"; // Ховаємо контекстне меню кривої

  let mousePos = getMousePos(e); // Отримуємо позицію миші
  pointsPoiArr.forEach((point) => {
    // Перевіряємо, чи є точка, на яку було натиснуто
    if (
      Math.hypot(
        transferCoordsX(point.x) - (mousePos.x - offsetX), // Відстань по X
        transferCoordsY(point.y) - (mousePos.y - offsetY)  // Відстань по Y
      ) < 8 // Якщо відстань менша за 8 пікселів, то точка була вибрана
    ) {
      if (e.button === 2) { // Якщо був правий клік (кнопка миші 2)
        // Заповнюємо поля форми значеннями точки
        document.getElementById("x-input").value = point.x;
        document.getElementById("y-input").value = point.y;
        document.getElementById("points-color-input").value = point.colorPoi;
        localStorage.setItem("currentPoint", JSON.stringify(+point.id)); // Зберігаємо поточну точку в localStorage

        // Додаємо слухача для кнопки видалення точки
        document
          .getElementById("delete-point")
          .addEventListener("click", function () {
            delPoint(+point.id); // Викликаємо функцію видалення
            contextMenu.style.display = "none"; // Закриваємо контекстне меню
            editPoint(); // Викликаємо функцію редагування
            // Оновлюємо всі криві
            for (let i = 0; i < allCurves.length; i++) {
              currentCurve = allCurves[i];
              createRelCurve();
            }
            saveRelForm(); // Перевіряємо форму
          });

        contextMenu.style.top = `${e.pageY}px`; // Встановлюємо позицію контекстного меню
        contextMenu.style.left = `${e.pageX}px`; // Встановлюємо позицію контекстного меню
        contextMenu.style.display = "block"; // Відображаємо контекстне меню
        isEdited = true; // Встановлюємо прапор редагування в true
      } else if (!contextMenu.contains(e.target)) {
        // Якщо клік не був по контекстному меню, то ховаємо його
        contextMenu.style.display = "none";
        draggingPoint = point; // Задаємо поточну точку для перетягування
        isEdited = false; // Встановлюємо прапор редагування в false
      }
    }
  });
});


// Подія для приховування контекстного меню, якщо клік відбувся поза ним
window.addEventListener("click", (e) => {
  if (isEdited) { // Якщо точка була відредагована
    if (!contextMenu.contains(e.target)) { // Якщо клік не був по контекстному меню
      contextMenu.style.display = "none"; // Ховаємо контекстне меню
      editPoint(); // Оновлюємо точку
      for (let i = 0; i < allCurves.length; i++) {
        currentCurve = allCurves[i];
        createRelCurve(); // Оновлюємо всі криві
      }
      checkRelForm(); // Перевіряємо форму
      isEdited = false; // Встановлюємо прапор редагування в false
    }
  }

  // Якщо клік був поза меню для кривої, ховаємо його
  if (!contextMenuCurve.contains(e.target)) {
    contextMenuCurve.style.display = "none";
    for (let i = 0; i < allCurves.length; i++) {
      currentCurve = allCurves[i];
      createRelCurve(); // Оновлюємо всі криві
    }
    checkRelForm(); // Перевіряємо форму
  }
});

// Запобігаємо стандартному контекстному меню на канвасі і в контекстних меню
canvas.addEventListener("contextmenu", (e) => e.preventDefault());
contextMenu.addEventListener("contextmenu", (e) => e.preventDefault());
contextMenuCurve.addEventListener("contextmenu", (e) => e.preventDefault());

// Стилізація контекстного меню
const style = document.createElement("style");
style.innerHTML = `
  .custom-context-menu {
    position: absolute;
    background: white;
    border: 1px solid black;
    padding: 10px;
    display: none;
    box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.2); /* Тінь для меню */
  }
  .label-form {
    margin-bottom: 5px; /* Відступи між елементами форми */
  }
  .label-form label {
    display: block; /* Встановлюємо мітки на окремі рядки */
  }
  #delete-point {
    margin-top: 10px;
    padding: 5px;
    background: red; /* Червоний фон для кнопки видалення */
    color: white;
    border: none;
    cursor: pointer; /* Зміна курсору на вказівник */
  }
  #delete-point:hover {
    background: darkred; /* Темніший червоний при наведенні */
  }
`;
document.head.appendChild(style); // Додаємо стилі в документ

// Подія для подвійного кліку на канвас
canvas.addEventListener("dblclick", (e) => {
  let mousePos = getMousePos(e); // Отримуємо позицію миші

  // Обчислюємо координати кліка відносно канваса з урахуванням масштабу
  const x = parseFloat(((mousePos.x - offsetX) / baseStep) * getStepValue());
  const y = parseFloat(((offsetY - mousePos.y) / baseStep) * getStepValue());

  // Заповнюємо поля вводу координатами
  document.getElementById("x-input").value = x.toFixed(2); // Округлюємо до двох знаків після коми
  document.getElementById("y-input").value = y.toFixed(2); // Округлюємо до двох знаків після коми
});


// Подія для зупинки перетягування точки та зменшення прив'язки до точки дотика
canvas.addEventListener("mouseup", () => {
  draggingPoint = null; // Очищаємо змінну для точки, яку перетягували
  tangentPoint = null; // Очищаємо змінну для точки дотику
});

// Подія для обробки натискання клавіші
document.addEventListener("keydown", function (event) {
  if (event.key === "Enter") { // Якщо натиснута клавіша Enter
    event.preventDefault(); // Запобігаємо стандартній поведінці

    const addButton = document.getElementById("button-addPoint"); // Кнопка додавання точки
    const editButton = document.getElementById("button-editPoint"); // Кнопка редагування точки

    // Якщо кнопка додавання точки видима, перевіряємо форму для додавання точки
    if (window.getComputedStyle(addButton).display !== "none") {
      checkPointForm();
    }
    // Якщо кнопка редагування точки видима, виконуємо редагування точки
    else if (window.getComputedStyle(editButton).display !== "none") {
      editPoint();
    }
  }
});

// Подія для переміщення миші на канвасі (перетягування точки)
canvas.addEventListener("mousemove", (e) => {
  if (draggingPoint) { // Якщо точка перетягується
    let mousePos = getMousePos(e); // Отримуємо позицію миші на канвасі
    // Перераховуємо координати точки в потрібну систему координат
    const x = parseFloat(((mousePos.x - offsetX) / baseStep) * getStepValue());
    const y = parseFloat(((offsetY - mousePos.y) / baseStep) * getStepValue());

    // Оновлюємо координати точки
    draggingPoint.x = +x.toFixed(2);
    draggingPoint.y = +y.toFixed(2);

    // Викликаємо відповідну функцію в залежності від типу кривої
    switch (currentCurve.type) {
      case "Parametric":
        parametricBuild(pointsPoiArr); // Для параметричних кривих
        break;
      case "Recursive":
        recursiveBuild(pointsPoiArr); // Для рекурсивних кривих
        break;
      case "Matrix":
        matrixBuild(pointsPoiArr); // Для матричних кривих
        break;
    }
  }
});

// Змінна для перевірки стану малювання
let isDrawing = false;

// Функція для малювання напрямної лінії (наприклад, при малюванні)
function drawGuideline(x, y) {
  // Якщо малювання не активне або немає точок для малювання, припиняємо виконання
  if (!isDrawing || pointsPoiArr.length === 0) return;

  // Малюємо сітку і всі криві
  drawGrid();
  for (let i = 0; i < allCurves.length; i++) {
    currentCurve = allCurves[i];
    createRelCurve();
  }

  // Налаштовуємо стилі для пунктирної лінії
  ctx.strokeStyle = "gray"; // Колір лінії
  ctx.setLineDash([5, 5]); // Пунктирна лінія

  // Малюємо лінію від останньої точки до поточної позиції миші
  ctx.beginPath();
  ctx.moveTo(
    transferCoordsX(pointsPoiArr[pointsPoiArr.length - 1].x),
    transferCoordsY(pointsPoiArr[pointsPoiArr.length - 1].y)
  );
  ctx.lineTo(lastMousePos.x - offsetX, lastMousePos.y - offsetY);
  ctx.stroke();

  // Скидаємо стиль пунктирної лінії
  ctx.setLineDash([]);
}


// Функція для малювання точки на канвасі
function drawPoint(x, y, color = "black") {
  if (isDrawing) { // Перевіряємо, чи включений режим малювання
    ctx.fillStyle = color; // Встановлюємо колір заповнення
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, Math.PI * 2); // Малюємо коло (точку) з радіусом 5
    ctx.fill(); // Заповнюємо коло
  }
}

// Обробник події для відключення режиму малювання при виклику контекстного меню
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault(); // Запобігаємо відкриттю стандартного контекстного меню
  isDrawing = false; // Вимикаємо режим малювання
});

// Обробник події для натискання клавіші
document.addEventListener("keydown", (e) => {
  if (e.key === "z" || e.key === "Z") { // Якщо натиснута клавіша 'z' або 'Z'
    isDrawing = true; // Увімкнути режим малювання
    console.log("Режим малювання увімкнено");
  }
});

// Обробник події для відпускання клавіші
document.addEventListener("keyup", (e) => {
  if (e.key === "z" || e.key === "Z") { // Якщо відпущена клавіша 'z' або 'Z'
    isDrawing = false; // Вимкнути режим малювання
    console.log("Режим малювання вимкнено");

    // Перемалювати сітку та всі криві
    drawGrid();
    for (let i = 0; i < allCurves.length; i++) {
      currentCurve = allCurves[i];
      createRelCurve();
    }
  }
});

// Обробник події для натискання клавіші, коли малювання увімкнене
document.addEventListener("keydown", (e) => {
  if (isDrawing) { // Якщо включений режим малювання
    if (e.key === "Tab") { // Якщо натиснута клавіша Tab
      const x = parseFloat(
        ((lastMousePos.x - offsetX) / baseStep) * getStepValue() // Обчислюємо X-координату
      );
      const y = parseFloat(
        ((offsetY - lastMousePos.y) / baseStep) * getStepValue() // Обчислюємо Y-координату
      );

      // Встановлюємо значення координат у відповідні поля вводу
      document.getElementById("x-input").value = x.toFixed(2);
      document.getElementById("y-input").value = y.toFixed(2);
      e.preventDefault(); // Запобігаємо стандартній поведінці (наприклад, переходу між елементами)

      // Перевіряємо форму для точки
      checkPointForm();
      saveRelForm(); // Зберігаємо форму
    }
  }
});

let lastX = 0, // Останнє значення X координати миші
  lastY = 0; // Останнє значення Y координати миші

// Обробник події "mousemove" для відслідковування руху миші
canvas.addEventListener("mousemove", (e) => {
  lastX = e.offsetX; // Зберігаємо координату X миші
  lastY = e.offsetY; // Зберігаємо координату Y миші
  drawGuideline(lastX, lastY); // Малюємо напрямну лінію, що слідує за мишкою
});

// Обробник події "contextmenu" для вимкнення контекстного меню
canvas.addEventListener("contextmenu", (e) => {
  e.preventDefault(); // Вимикаємо стандартне контекстне меню браузера
  isDrawing = false; // Вимикаємо режим малювання
});

// Функція для збереження форми відносних точок (залежить від методу поточної кривої)
function saveRelForm() {
  if (currentCurve.method == "Relevant") {
    pointsRelArr = structuredClone(pointsStaticArr); // Копіюємо статичні точки в масив відносних точок
  } else if (currentCurve.method == "Points") {
    pointsPoiArr = structuredClone(pointsStaticArr); // Копіюємо статичні точки в масив точок
  }
  createRelCurve(); // Створюємо відповідну криву на основі збережених точок
}

// Функція для збереження поточної кривої в localStorage
function saveCurveToLocal() {
  const index = curvesArrayJSON.findIndex(
    (curve) => curve.id === currentCurve.id // Знаходимо індекс поточної кривої в масиві
  );
  if (isSystem) { 
    const canvas = document.getElementById("myCanvas"); // Отримуємо канвас
    const dataURL = canvas.toDataURL(); // Отримуємо дані зображення у вигляді URL
    currentCurve.canvasInfo = dataURL; // Зберігаємо це зображення в інформації про криву
  }
  if (index !== -1) {
    curvesArrayJSON[index] = currentCurve; // Якщо крива вже є в масиві, оновлюємо її
  } else {
    curvesArrayJSON.push(currentCurve); // Якщо кривої немає, додаємо її
  }

  localStorage.setItem("curvesArrayJSON", JSON.stringify(curvesArrayJSON)); // Зберігаємо оновлений масив кривих в localStorage
  window.location.href = "/main.html"; // Перенаправляємо користувача на головну сторінку
}

// Функція для відкриття налаштувань 
function openOpt() {
  if (isSystem) { 
    wraper_shadow.style.display = "flex"; // Відображаємо тінь для фонового затемнення
    options_wraper.style.display = "flex"; // Відображаємо обгортку для налаштувань
  }
}


// Функція для закриття налаштувань
function closeOpt() {
  wraper_shadow.style.display = "none"; // Ховаємо затемнення
  options_wraper.style.display = "none"; // Ховаємо обгортку налаштувань
  getElement('input[name="type-curve"]').checked = true; // Встановлюємо перший радіо-кнопку в якості вибраної
  matrix_wraper.style.display = "none"; // Ховаємо контейнер для налаштувань матриці
  matrix_wraper.innerHTML = ""; // Очищаємо вміст контейнера для матриці
  coord_wraper.style.display = "none"; // Ховаємо контейнер для координат
  coord_wraper.innerHTML = ""; // Очищаємо вміст контейнера для координат
}

// Функція для отримання значення вибраного радіо-кнопки для типу кривої
function getSelectedRadioTypeValue() {
  const selectedRadio = getElement('input[name="type-curve"]:checked'); // Знаходимо вибраний радіо-кнопку
  return selectedRadio ? selectedRadio.value : null; // Повертаємо її значення, якщо є вибір
}

// Додаємо слухачі подій для радіо-кнопок
document.getElementById("radio-mat").addEventListener("click", showBlock);
document.getElementById("radio-coord").addEventListener("click", showBlock);

// Функція для створення стилізованого контейнера з заголовком
function createStyledContainer(titleText) {
  const container = document.createElement("div"); // Створюємо контейнер
  container.style.border = "2px solid #333"; // Стиль обводки
  container.style.padding = "10px"; // Відступи всередині контейнера
  container.style.borderRadius = "8px"; // Закруглені кути
  container.style.backgroundColor = "#f9f9f9"; // Фон контейнера

  const title = document.createElement("h3"); // Створюємо заголовок
  title.textContent = titleText; // Додаємо текст заголовка
  title.style.margin = "0 0 10px 0"; // Відступи для заголовка
  title.style.textAlign = "center"; // Вирівнюємо заголовок по центру

  container.appendChild(title); // Додаємо заголовок до контейнера
  return container; // Повертаємо контейнер
}

// Функція для відображення блоку налаштувань на основі вибраного типу кривої
function showBlock() {
  // Якщо вибрано "Matrix" (Матриця)
  if (getSelectedRadioTypeValue() == "Matrix") {
    if (currentCurve.type == "Matrix") { // Якщо поточний тип кривої - "Matrix"
      matrix_wraper.style.display = "flex"; // Відображаємо контейнер для налаштувань матриці
      matrix_wraper.innerHTML = ""; // Очищаємо вміст контейнера
      coord_wraper.style.display = "none"; // Ховаємо контейнер для координат
      matrixOption(); // Викликаємо функцію для налаштувань матриці
    } else { // Якщо тип кривої не "Matrix"
      alert("Неправильний тип кривої. Поточний тип: " + currentCurve.type); // Сповіщаємо про помилку
      matrix_wraper.style.display = "none"; // Ховаємо контейнер для матриці
      coord_wraper.style.display = "flex"; // Відображаємо контейнер для координат
    }
  } else { // Якщо вибрано інший тип кривої, відображаємо блок для координат
    matrix_wraper.style.display = "none"; // Ховаємо контейнер для матриці
    coord_wraper.style.display = "flex"; // Відображаємо контейнер для координат
  }

  // Якщо вибрано "Coords" (Координати)
  if (getSelectedRadioTypeValue() == "Coords") {
    coord_wraper.style.display = "flex"; // Відображаємо блок для координат
    coord_wraper.style.flexDirection = "column"; // Встановлюємо вертикальне вирівнювання
    matrix_wraper.style.display = "none"; // Ховаємо контейнер для матриці
    matrix_wraper.innerHTML = ""; // Очищаємо вміст контейнера для матриці
    coord_wraper.style.gap = "15px"; // Встановлюємо відстань між елементами
    coord_wraper.style.padding = "10px"; // Встановлюємо відступи для контейнера
    coord_wraper.innerHTML = ""; // Очищаємо вміст контейнера для координат
    coordsOpt(); // Викликаємо функцію для налаштувань координат
  }
}

function coordsOpt() {
  // Створюємо контейнер для виводу координат
  const tContainer = createStyledContainer("Вивід координат");

  // Створюємо форму для вводу значень t_min, t_max, t_step та кількості точок
  const tForm = document.createElement("form");
  tForm.style.display = "flex";
  tForm.style.alignItems = "center";
  tForm.style.gap = "10px";

  // Введення для t_min
  const tMinInput = document.createElement("input");
  tMinInput.type = "number";
  tMinInput.placeholder = "t_min";
  tMinInput.value = 0;
  tMinInput.style.width = "70px";

  // Введення для t_max
  const tMaxInput = document.createElement("input");
  tMaxInput.type = "number";
  tMaxInput.placeholder = "t_max";
  tMaxInput.value = 1;
  tMaxInput.style.width = "70px";

  // Введення для t_step
  const tStepInput = document.createElement("input");
  tStepInput.type = "number";
  tStepInput.placeholder = "t_step";
  tStepInput.value = 0.1;
  tStepInput.step = 0.1;
  tStepInput.style.width = "70px";

  // Введення для кількості точок
  const tCountInput = document.createElement("input");
  tCountInput.type = "number";
  tCountInput.placeholder = "Кількість точок";
  tCountInput.value = 10;
  tCountInput.style.width = "120px";

  // Кнопка для виводу результатів
  const tButton = document.createElement("button");
  tButton.textContent = "Вивести";
  tButton.type = "button";

  // Вивід результатів
  const tOutput = document.createElement("pre");
  tOutput.style.border = "1px solid black";
  tOutput.style.padding = "5px";
  tOutput.style.marginTop = "10px";

  // Обробник події для кнопки "Вивести"
  tButton.addEventListener("click", () => {
    const tMin = parseFloat(tMinInput.value);
    const tMax = parseFloat(tMaxInput.value);
    const tStep = parseFloat(tStepInput.value);
    const tCount = parseInt(tCountInput.value);

    // Перевірка введених значень
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

    // Оновлюємо глобальні параметри t_min, t_max, t_step
    t_min = tMin;
    t_max = tMax;
    t_step = tStep;

    // Викликаємо побудову кривої для різних типів кривих
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

    // Генерація точок по заданому діапазону t
    let points = [];
    let point = smoothedCurves.flat();
    let counter = 0;
    tTemp = tMin;
    if(smoothedCurves.length == 0 || smoothedCurves[0] == undefined){
      alert("У вас немає кривої")
    }
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

    // Виведення результатів
    if (points.length-1 < tCount) {
      tOutput.textContent = `Знайдено  ${points.length} точок.\n`;
    } else if(points.length == 0) {
      tOutput.textContent += "Немає точок, що відповідають заданим параметрам.";
    }

    tOutput.textContent += points.join("\n");

    saveRelForm();
    t_min = 0;
    t_max = 1;
    t_step = 0.1;
  });

  // Додаємо елементи у форму
  tForm.appendChild(tMinInput);
  tForm.appendChild(tMaxInput);
  tForm.appendChild(tStepInput);
  tForm.appendChild(tCountInput);
  tForm.appendChild(tButton);
  tContainer.appendChild(tForm);
  tContainer.appendChild(tOutput);

  // Створюємо другий контейнер для виводу координат на проміжку
  const xyContainer = createStyledContainer("Вивід координат на проміжку");

  // Створюємо форму для фільтрації точок за координатами
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

  // Виведення результатів фільтрації координат
  const xyOutput = document.createElement("pre");
  xyOutput.style.border = "1px solid black";
  xyOutput.style.padding = "5px";
  xyOutput.style.marginTop = "10px";

  // Обробник події для кнопки "Знайти"
  xyButton.addEventListener("click", () => {
    const xFilter = parseFloat(xInput.value);
    const xyCount = parseInt(xyCountInput.value);

    const xMin = parseFloat(xMinInput.value);
    const xMax = parseFloat(xMaxInput.value);
    const yMin = parseFloat(yMinInput.value);
    const yMax = parseFloat(yMaxInput.value);

    let foundPoints = [];
    let counter = 0;

    // Проходимо по всіх точках кривої і фільтруємо їх за заданими координатами
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

    // Виведення результатів
    if (foundPoints.length < xyCount) {
      xyOutput.textContent = `Знайдено лише ${foundPoints.length} точок, не буде більше.`;
      xyOutput.textContent += `Знайдені точки: \n${foundPoints.join("\n")}`;
    } else if (foundPoints.length > 0) {
      xyOutput.textContent = `Знайдені точки: \n${foundPoints.join("\n")}`;
    } else {
      xyOutput.textContent = "Немає точок, що відповідають заданим параметрам.";
    }
  });

  // Додаємо елементи у форму для фільтрації
  xyForm.appendChild(xMinInput);
  xyForm.appendChild(xMaxInput);
  xyForm.appendChild(yMinInput);
  xyForm.appendChild(yMaxInput);
  xyForm.appendChild(xyCountInput);
  xyForm.appendChild(xyButton);
  xyContainer.appendChild(xyForm);
  xyContainer.appendChild(xyOutput);

  // Додаємо контейнер до основного контейнера
  coord_wraper.appendChild(xyContainer);
  coord_wraper.appendChild(tContainer);
  coord_wraper.style.display = "flex";
}


function matrixOption() {
  // Створюємо основний контейнер для матриці
  const container = document.createElement("div");
  container.style.display = "flex";
  container.style.flexDirection = "column";
  container.style.alignItems = "center";
  container.style.width = "100%";

  // Створюємо таблицю для відображення матриці
  const table = document.createElement("table");
  table.style.borderCollapse = "collapse";
  table.style.marginBottom = "10px";
  table.style.width = "300px";
  table.style.height = "300px";

  // Блок для відображення інформації про вибраний елемент
  const infoBlock = document.createElement("div");
  infoBlock.textContent = "Натисніть на елемент, рядок, стовпець або діагональ";
  infoBlock.style.padding = "10px";
  infoBlock.style.border = "1px solid black";
  infoBlock.style.minWidth = "300px";
  infoBlock.style.textAlign = "center";
  infoBlock.className = "info-block";

  // Отримуємо розмір матриці
  const size = NMain.length;

  // Перевіряємо, чи є матриця для обробки
  if (size == 0) {
    alert("У вас немає кривої");
  }

  // Обчислюємо елементи головної та побічної діагоналі, а також їхні суми
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

  // Створюємо рядок заголовків для таблиці
  const headerRow = document.createElement("tr");
  headerRow.appendChild(document.createElement("th"));

  // Створюємо заголовки стовпців і додаємо обробник подій для кожного стовпця
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

  // Створюємо рядки таблиці для відображення елементів матриці
  NMain.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");

    // Створюємо заголовки для кожного рядка та додаємо обробник подій
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

    // Створюємо клікабельні елементи таблиці для кожної клітинки
    row.forEach((cell, colIndex) => {
      const td = document.createElement("td");
      td.textContent = cell;
      td.style.border = "1px solid black";
      td.style.padding = "5px";
      td.style.cursor = "pointer";

      // Виділяємо елементи головної та побічної діагоналей
      if (rowIndex === colIndex) {
        td.style.backgroundColor = "#d1e7dd"; // Головна діагональ
      }
      if (rowIndex + colIndex === size - 1) {
        td.style.backgroundColor = "#f8d7da"; // Побічна діагональ
      }

      // Обробник події для кліків по елементах матриці
      td.addEventListener("click", () => {
        infoBlock.textContent = `Елемент: ${cell} | Рядок: ${rowIndex} | Стовпець: ${colIndex}`;
      });

      tr.appendChild(td);
    });

    table.appendChild(tr);
  });

  // Кнопка для відображення головної діагоналі
  const mainDiagonalButton = document.createElement("button");
  mainDiagonalButton.textContent = "Показати головну діагональ";
  mainDiagonalButton.style.margin = "5px";
  mainDiagonalButton.className = "diagonalButton";
  mainDiagonalButton.addEventListener("click", () => {
    infoBlock.textContent = `Головна діагональ: ${mainDiagonal.join(
      ", "
    )} | Сума: ${mainSum}`;
  });

  // Кнопка для відображення побічної діагоналі
  const secondaryDiagonalButton = document.createElement("button");
  secondaryDiagonalButton.textContent = "Показати побічну діагональ";
  secondaryDiagonalButton.style.margin = "5px";
  secondaryDiagonalButton.className = "diagonalButton";
  secondaryDiagonalButton.addEventListener("click", () => {
    infoBlock.textContent = `Побічна діагональ: ${secondaryDiagonal.join(
      ", "
    )} | Сума: ${secondarySum}`;
  });

  // Додаємо таблицю та кнопки в контейнер
  container.appendChild(table);
  container.appendChild(mainDiagonalButton);
  container.appendChild(secondaryDiagonalButton);
  container.appendChild(infoBlock);

  // Виводимо контейнер в DOM
  matrix_wraper.appendChild(container);
}

function notSaveCurveToLocal() {
  // Перенаправляємо на іншу сторінку без збереження поточної кривої
  window.location.href = "/main.html";
}

