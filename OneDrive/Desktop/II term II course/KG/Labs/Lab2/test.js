const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

function updateCanvasSize() {
  canvas.width = 700;
  canvas.height = 700;
  drawGrid();
}

let scale = 1,
  offsetX = canvas.width / 2,
  offsetY = canvas.height / 2;
let lastMouseX = 0,
  lastMouseY = 0;
let baseStep = 100;
let isDragging = false;
let isPanMode = false;

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

let prevStep = 100;
let scaleForMath = 1;
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

function transferCoordsX(coord) {
  return ((coord)  / getStepValue()) * baseStep;
}

function transferCoordsY(coord) {
  return -(
    (coord  / getStepValue()) *
    baseStep
  );
}

function drawSquare() {
  ctx.save();

  ctx.beginPath();
  ctx.strokeStyle = "red";
  ctx.lineWidth = 3;
  let size = 5; 
  ctx.strokeRect(
    transferCoordsX(50),
    transferCoordsY(50),
    transferCoordsX(50),
    transferCoordsY(5)
  );

  ctx.restore();
}

function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
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
  if(endX < 0){
    if (yVisible) {
      ctx.textAlign = "left";
      for (
        let y = Math.floor(startY / stepSize) * stepSize, step = 0;
        y < endY;
        y += stepSize, step += stepSize
      ) {
        ctx.fillText(formatTickValue((-y / stepSize) * stepValue), endX - 50 , y );
      }
    }
  } 
  if(endX > canvas.width){
    if (yVisible) {
      ctx.textAlign = "left";
      for (
        let y = Math.floor(startY / stepSize) * stepSize, step = 0;
        y < endY;
        y += stepSize, step += stepSize
      ) {
        ctx.fillText(formatTickValue((-y / stepSize) * stepValue), startX + 30 , y );
      }
    }
  }
  if(endY < 0){
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
          endY - 30
        );
      }
    }
  }

  if(endY > canvas.height){
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
  

 
  drawSquare();

  ctx.restore();

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
  drawGrid();
});

canvas.addEventListener("mousemove", (event) => {
  if (isPanMode) {
    offsetX += event.movementX;
    offsetY += event.movementY;
    drawGrid();
  }
});

window.addEventListener("resize", updateCanvasSize);

updateCanvasSize();
