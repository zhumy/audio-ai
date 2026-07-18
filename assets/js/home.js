const heroCanvas = document.querySelector("#heroWave");
const labCanvas = document.querySelector("#labWave");
const frequencyInput = document.querySelector("#frequency");
const energyInput = document.querySelector("#energy");
const frequencyValue = document.querySelector("#frequencyValue");
const energyValue = document.querySelector("#energyValue");
const perception = document.querySelector("#perception");
const activateButton = document.querySelector("#activateButton");
const statusLight = document.querySelector("#statusLight");
const statusText = document.querySelector("#statusText");

let running = false;
let tick = 0;

function prepareCanvas(canvas) {
  const ratio = window.devicePixelRatio || 1;
  const bounds = canvas.getBoundingClientRect();
  const width = Math.max(1, bounds.width);
  const height = Math.max(1, bounds.height);
  const pixelWidth = Math.floor(width * ratio);
  const pixelHeight = Math.floor(height * ratio);

  if (canvas.width !== pixelWidth || canvas.height !== pixelHeight) {
    canvas.width = pixelWidth;
    canvas.height = pixelHeight;
  }

  const context = canvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width, height };
}

function drawHeroWave() {
  const { context, width, height } = prepareCanvas(heroCanvas);
  const center = height / 2;
  context.clearRect(0, 0, width, height);

  for (let line = 0; line < 3; line += 1) {
    context.beginPath();
    for (let x = 0; x <= width; x += 3) {
      const fade = Math.sin((x / width) * Math.PI);
      const wave =
        Math.sin(x * (0.017 + line * 0.005) + tick * (0.014 + line * 0.003)) *
        fade *
        (26 - line * 7);
      const y = center + wave + (line - 1) * 18;
      if (x === 0) {
        context.moveTo(x, y);
      } else {
        context.lineTo(x, y);
      }
    }
    context.strokeStyle = `rgba(104, 238, 227, ${0.52 - line * 0.16})`;
    context.lineWidth = line === 0 ? 1.7 : 1;
    context.stroke();
  }
}

function drawLabWave() {
  const { context, width, height } = prepareCanvas(labCanvas);
  const frequency = Number(frequencyInput.value);
  const energy = Number(energyInput.value) / 100;
  const amplitude = running ? height * 0.34 * energy : height * 0.035;
  const speed = running ? tick * 0.052 : tick * 0.009;

  context.clearRect(0, 0, width, height);
  context.beginPath();

  for (let x = 0; x <= width; x += 2) {
    const envelope = 0.4 + 0.6 * Math.sin((x / width) * Math.PI);
    const carrier = Math.sin(x * (frequency / 8200) + speed);
    const detail = Math.sin(x * (frequency / 3600) - speed * 0.7) * 0.18;
    const y = height / 2 + (carrier + detail) * amplitude * envelope;
    if (x === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  }

  context.strokeStyle = running ? "#68eee3" : "rgba(104, 238, 227, 0.38)";
  context.lineWidth = running ? 2 : 1.4;
  context.shadowBlur = running ? 16 : 0;
  context.shadowColor = "#68eee3";
  context.stroke();
  context.shadowBlur = 0;
}

function updatePerception() {
  const frequency = Number(frequencyInput.value);
  const energy = Number(energyInput.value);
  const tone = energy >= 72 ? "富有能量" : energy >= 42 ? "平静语音" : "轻声表达";
  const range = frequency >= 430 ? "高频细节" : frequency >= 230 ? "自然音域" : "低频共鸣";
  const clarity = Math.min(99, Math.round(78 + energy / 4));

  frequencyValue.textContent = `${frequency} Hz`;
  energyValue.textContent = `${energy}%`;
  perception.textContent = `${tone} · ${range} · 清晰度 ${clarity}%`;
}

function toggleListening() {
  running = !running;
  activateButton.setAttribute("aria-pressed", String(running));
  activateButton.textContent = running ? "停止感知" : "开始感知";
  statusLight.classList.toggle("active", running);
  statusText.textContent = running ? "Listening mode: active" : "Listening mode: standby";
}

function animate() {
  tick += 1;
  drawHeroWave();
  drawLabWave();
  window.requestAnimationFrame(animate);
}

frequencyInput.addEventListener("input", updatePerception);
energyInput.addEventListener("input", updatePerception);
activateButton.addEventListener("click", toggleListening);
window.addEventListener("resize", () => {
  drawHeroWave();
  drawLabWave();
});

updatePerception();
animate();
