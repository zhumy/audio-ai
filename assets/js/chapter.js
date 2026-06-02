const featureCanvas = document.querySelector("#featureWave");
const amplitude = document.querySelector("#amplitude");
const amplitudeLabel = document.querySelector("#amplitudeLabel");
const peakMetric = document.querySelector("#peakMetric");
const rmsMetric = document.querySelector("#rmsMetric");
const zcrMetric = document.querySelector("#zcrMetric");
const profileButtons = document.querySelectorAll("[data-profile]");
const sampleButtons = document.querySelectorAll("[data-play-sample]");
const listenStatus = document.querySelector("#listenStatus");
const revealSamples = document.querySelector("#revealSamples");
const sampleAnswer = document.querySelector("#sampleAnswer");
const playCurrentProfile = document.querySelector("#playCurrentProfile");
const currentPlayStatus = document.querySelector("#currentPlayStatus");

let activeProfile = "tone";
let audioContext;
let activeAudioNodes = [];
let playbackTimer;

const profileNames = {
  tone: "持续纯音（正弦波）",
  tap: "短促敲击",
  noise: "摩擦噪声",
};

function createSamples(profile, level) {
  const samples = [];
  const count = 480;

  for (let i = 0; i < count; i += 1) {
    const t = i / count;
    let value = 0;
    if (profile === "tone") {
      value = Math.sin(t * Math.PI * 16) * 0.78;
    } else if (profile === "tap") {
      const decay = Math.exp(-t * 8);
      value = decay * (Math.sin(t * Math.PI * 45) * 0.78 + Math.sin(t * Math.PI * 88) * 0.15);
    } else {
      value =
        Math.sin(t * Math.PI * 93) * 0.34 +
        Math.sin(t * Math.PI * 151) * 0.26 +
        Math.sin(t * Math.PI * 229) * 0.2;
    }
    samples.push(value * level);
  }

  return samples;
}

function calculateMetrics(samples) {
  let peak = 0;
  let energy = 0;
  let crossings = 0;

  samples.forEach((sample, index) => {
    peak = Math.max(peak, Math.abs(sample));
    energy += sample * sample;
    if (index > 0 && (sample >= 0) !== (samples[index - 1] >= 0)) {
      crossings += 1;
    }
  });

  return {
    peak,
    rms: Math.sqrt(energy / samples.length),
    zcr: crossings / (samples.length - 1),
  };
}

function stopAudio() {
  activeAudioNodes.forEach((node) => {
    try {
      node.stop();
    } catch (error) {
      // Node has already reached its scheduled stop time.
    }
    try {
      node.disconnect();
    } catch (error) {
      // A disconnected node needs no further cleanup.
    }
  });
  activeAudioNodes = [];
  window.clearTimeout(playbackTimer);
  sampleButtons.forEach((button) => button.classList.remove("playing"));
  if (playCurrentProfile) {
    playCurrentProfile.classList.remove("playing");
  }
}

async function getAudioContext() {
  if (!audioContext) {
    const Context = window.AudioContext || window.webkitAudioContext;
    audioContext = new Context();
  }
  if (audioContext.state === "suspended") {
    await audioContext.resume();
  }
  return audioContext;
}

function connectEnvelope(context, destination, peak, attack, releaseAt, duration) {
  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(Math.max(0.001, peak), context.currentTime + attack);
  gain.gain.setValueAtTime(Math.max(0.001, peak), context.currentTime + releaseAt);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
  gain.connect(destination);
  return gain;
}

function createNoiseBuffer(context, duration) {
  const length = Math.floor(context.sampleRate * duration);
  const buffer = context.createBuffer(1, length, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < length; i += 1) {
    data[i] = (Math.random() * 2 - 1) * (0.68 + Math.sin(i * 0.013) * 0.12);
  }
  return buffer;
}

async function playProfile(profile, level = 0.6, trigger, onFinish) {
  const context = await getAudioContext();
  stopAudio();
  const master = context.createGain();
  master.gain.value = Math.max(0.08, level) * 0.5;
  master.connect(context.destination);
  activeAudioNodes.push(master);
  let duration = 1.25;

  if (profile === "tone") {
    const envelope = connectEnvelope(context, master, 0.72, 0.045, 1.05, duration);
    const oscillator = context.createOscillator();
    oscillator.type = "sine";
    oscillator.frequency.value = 440;
    oscillator.connect(envelope);
    oscillator.start();
    oscillator.stop(context.currentTime + duration);
    activeAudioNodes.push(oscillator, envelope);
  } else if (profile === "tap") {
    duration = 0.62;
    const envelope = connectEnvelope(context, master, 0.95, 0.004, 0.012, duration);
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    source.buffer = createNoiseBuffer(context, duration);
    filter.type = "bandpass";
    filter.frequency.value = 1250;
    filter.Q.value = 2.5;
    source.connect(filter).connect(envelope);
    source.start();
    source.stop(context.currentTime + duration);
    activeAudioNodes.push(source, filter, envelope);
  } else {
    duration = 1.08;
    const envelope = connectEnvelope(context, master, 0.52, 0.03, 0.88, duration);
    const source = context.createBufferSource();
    const filter = context.createBiquadFilter();
    source.buffer = createNoiseBuffer(context, duration);
    filter.type = "bandpass";
    filter.frequency.value = 3200;
    filter.Q.value = 0.8;
    source.connect(filter).connect(envelope);
    source.start();
    source.stop(context.currentTime + duration);
    activeAudioNodes.push(source, filter, envelope);
  }

  if (trigger) {
    trigger.classList.add("playing");
  }
  playbackTimer = window.setTimeout(() => {
    sampleButtons.forEach((button) => button.classList.remove("playing"));
    if (playCurrentProfile) {
      playCurrentProfile.classList.remove("playing");
    }
    if (onFinish) {
      onFinish();
    }
  }, duration * 1000);
}

function drawFeatureLab() {
  if (!featureCanvas) {
    return;
  }

  const ratio = window.devicePixelRatio || 1;
  const width = featureCanvas.clientWidth;
  const height = featureCanvas.clientHeight;
  const pixelWidth = Math.round(width * ratio);
  const pixelHeight = Math.round(height * ratio);
  if (featureCanvas.width !== pixelWidth || featureCanvas.height !== pixelHeight) {
    featureCanvas.width = pixelWidth;
    featureCanvas.height = pixelHeight;
  }
  const context = featureCanvas.getContext("2d");
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  context.clearRect(0, 0, width, height);

  const level = Number(amplitude.value) / 100;
  const samples = createSamples(activeProfile, level);
  const metrics = calculateMetrics(samples);

  context.beginPath();
  samples.forEach((sample, index) => {
    const x = (index / (samples.length - 1)) * width;
    const y = height / 2 - sample * height * 0.45;
    if (index === 0) {
      context.moveTo(x, y);
    } else {
      context.lineTo(x, y);
    }
  });
  context.strokeStyle = "#69eee3";
  context.lineWidth = 1.7;
  context.shadowBlur = 12;
  context.shadowColor = "#69eee3";
  context.stroke();

  amplitudeLabel.textContent = `${amplitude.value}%`;
  peakMetric.textContent = metrics.peak.toFixed(2);
  rmsMetric.textContent = metrics.rms.toFixed(2);
  zcrMetric.textContent = metrics.zcr.toFixed(2);
}

if (featureCanvas) {
  profileButtons.forEach((button) => {
    button.addEventListener("click", () => {
      stopAudio();
      activeProfile = button.dataset.profile;
      profileButtons.forEach((item) => item.classList.toggle("active", item === button));
      currentPlayStatus.textContent = `当前选择：${profileNames[activeProfile]}`;
      drawFeatureLab();
    });
  });
  amplitude.addEventListener("input", drawFeatureLab);
  playCurrentProfile.addEventListener("click", () => {
    const level = Number(amplitude.value) / 100;
    currentPlayStatus.textContent = `正在试听：${profileNames[activeProfile]} · 幅度 ${amplitude.value}%`;
    playProfile(activeProfile, level, playCurrentProfile, () => {
      currentPlayStatus.textContent = `试听完成：${profileNames[activeProfile]} · 可调整幅度再次比较`;
    });
  });
  window.addEventListener("resize", drawFeatureLab);
  drawFeatureLab();
}

sampleButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const sampleName = button.querySelector("span").textContent;
    listenStatus.textContent = `正在播放 ${sampleName}。请先记录它在时长、能量和质感上的印象。`;
    playProfile(button.dataset.playSample, 0.68, button, () => {
      listenStatus.textContent = `${sampleName} 播放完成。请记录判断，再试听另一个样本进行比较。`;
    });
  });
});

if (revealSamples) {
  const collapsedLabel = revealSamples.textContent.trim();
  revealSamples.addEventListener("click", () => {
    const revealing = sampleAnswer.hidden;
    sampleAnswer.hidden = !revealing;
    revealSamples.setAttribute("aria-expanded", String(revealing));
    revealSamples.textContent = revealing ? "隐藏样本答案" : collapsedLabel;
  });
}

const projectChecks = document.querySelectorAll("[data-progress]");
const projectProgress = document.querySelector("#projectProgress");
const projectStatus = document.querySelector("#projectStatus");
const progressFill = document.querySelector("#progressFill");

function updateProjectBoard() {
  if (!projectChecks.length) {
    return;
  }

  const complete = Array.from(projectChecks).filter((item) => item.checked).length;
  const percent = Math.round((complete / projectChecks.length) * 100);
  let status = "正在定义问题";
  if (percent >= 100) {
    status = "已准备展示";
  } else if (percent >= 63) {
    status = "正在验证与改进";
  } else if (percent >= 38) {
    status = "已形成基线";
  }

  projectProgress.textContent = `${percent}%`;
  projectStatus.textContent = status;
  progressFill.style.width = `${percent}%`;
}

if (projectChecks.length) {
  projectChecks.forEach((checkbox) => checkbox.addEventListener("change", updateProjectBoard));
  updateProjectBoard();
}
