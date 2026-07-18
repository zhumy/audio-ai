(() => {
  const root = document.documentElement;

  function cssVar(name, fallback) {
    const value = getComputedStyle(root).getPropertyValue(name).trim();
    return value || fallback;
  }

  function colors() {
    return {
      bg: cssVar("--surface-2", "#11252b"),
      ink: cssVar("--ink", "#f5f1e9"),
      muted: cssVar("--muted", "#9fb1b0"),
      cyan: cssVar("--cyan", "#69eee3"),
      gold: cssVar("--gold", "#f4c965"),
      red: cssVar("--red", "#ff8e86"),
      line: cssVar("--line", "rgba(204, 230, 226, 0.18)"),
    };
  }

  function $(selector, scope = document) {
    return scope.querySelector(selector);
  }

  function $all(selector, scope = document) {
    return Array.from(scope.querySelectorAll(selector));
  }

  function setText(id, text) {
    const element = typeof id === "string" ? document.getElementById(id) : id;
    if (element) element.textContent = text;
  }

  function pointPath(points) {
    return points.map((point, index) => `${index ? "L" : "M"} ${point[0].toFixed(1)} ${point[1].toFixed(1)}`).join(" ");
  }

  function logX(value, min, max, width, pad) {
    const t = (Math.log(value) - Math.log(min)) / (Math.log(max) - Math.log(min));
    return pad + t * (width - pad * 2);
  }

  function yMap(value, min, max, height, pad) {
    return height - pad - ((value - min) / (max - min)) * (height - pad * 2);
  }

  function drawCanvas(canvas, draw) {
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const width = Math.max(1, canvas.clientWidth);
    const height = Math.max(1, canvas.clientHeight);
    const targetWidth = Math.round(width * ratio);
    const targetHeight = Math.round(height * ratio);
    if (canvas.width !== targetWidth || canvas.height !== targetHeight) {
      canvas.width = targetWidth;
      canvas.height = targetHeight;
    }
    const context = canvas.getContext("2d");
    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    context.clearRect(0, 0, width, height);
    draw(context, width, height, colors());
  }

  function makeSvg(container, viewBox, body) {
    if (!container) return;
    container.innerHTML = `<svg viewBox="${viewBox}" role="img" aria-label="${container.dataset.label || "interactive diagram"}">${body}</svg>`;
  }

  let audioContext;
  let activeNodes = [];

  async function getAudioContext() {
    const Context = window.AudioContext || window.webkitAudioContext;
    if (!Context) return null;
    if (!audioContext) audioContext = new Context();
    if (audioContext.state === "suspended") await audioContext.resume();
    return audioContext;
  }

  function stopAudio() {
    activeNodes.forEach((node) => {
      try { node.stop(); } catch (error) {}
      try { node.disconnect(); } catch (error) {}
    });
    activeNodes = [];
  }

  async function playToneSet(f0, partials, duration = 1.1, attackMs = 25) {
    const context = await getAudioContext();
    if (!context) return;
    stopAudio();
    const master = context.createGain();
    master.gain.value = 0.16;
    master.connect(context.destination);
    activeNodes.push(master);
    partials.forEach((amp, index) => {
      if (amp <= 0) return;
      const osc = context.createOscillator();
      const gain = context.createGain();
      const now = context.currentTime;
      osc.type = "sine";
      osc.frequency.value = f0 * (index + 1);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(Math.max(0.001, amp), now + attackMs / 1000);
      gain.gain.setValueAtTime(Math.max(0.001, amp), now + duration * 0.78);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
      osc.connect(gain).connect(master);
      osc.start(now);
      osc.stop(now + duration);
      activeNodes.push(osc, gain);
    });
  }

  function initAuditory() {
    const cochlea = $("#cochleaDiagram");
    const freqInput = $("#cochleaFreq");
    const loudness = $("#loudnessDiagram");
    const phonInput = $("#phonLevel");
    const loudFreq = $("#loudFreq");
    const band = $("#bandDiagram");
    const bandFreq = $("#bandFreq");
    const masking = $("#maskingDiagram");
    const maskerFreq = $("#maskerFreq");
    const targetFreq = $("#targetFreq");
    const maskerLevel = $("#maskerLevel");
    const targetLevel = $("#targetLevel");

    function drawCochlea() {
      if (!cochlea || !freqInput) return;
      const c = colors();
      const freq = Number(freqInput.value);
      const position = Math.max(0.02, Math.min(0.98, (Math.log(freq) - Math.log(80)) / (Math.log(12000) - Math.log(80))));
      const x = 90 + position * 680;
      const y = 170 - Math.sin(position * Math.PI) * 80;
      const region = freq < 400 ? "低频顶端区" : freq < 3000 ? "中频语音敏感区" : "高频基底区";
      setText("cochleaFreqText", `${freq} Hz`);
      setText("cochleaRegion", region);
      setText("cochleaPlace", `约 ${(position * 100).toFixed(0)}%`);
      setText("cochleaMel", `${Math.round(2595 * Math.log10(1 + freq / 700))} mel`);
      const ticks = [100, 250, 500, 1000, 2000, 4000, 8000, 12000].map((f) => {
        const tx = 90 + ((Math.log(f) - Math.log(80)) / (Math.log(12000) - Math.log(80))) * 680;
        return `<line x1="${tx}" y1="236" x2="${tx}" y2="248" stroke="${c.line}"/><text x="${tx - 18}" y="270">${f >= 1000 ? f / 1000 + "k" : f}</text>`;
      }).join("");
      makeSvg(cochlea, "0 0 860 300", `
        <rect x="34" y="28" width="792" height="236" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <path d="M90 190 C220 42 430 40 580 96 C715 146 760 212 780 232" fill="none" stroke="${c.cyan}" stroke-width="5"/>
        <path d="M90 210 C250 104 420 102 575 140 C695 170 744 220 780 240" fill="none" stroke="${c.gold}" stroke-width="3" opacity=".85"/>
        <line x1="${x}" y1="54" x2="${x}" y2="236" stroke="${c.red}" stroke-width="2" stroke-dasharray="6 6"/>
        <circle cx="${x}" cy="${y}" r="10" fill="${c.red}"/>
        <text x="70" y="54">基底膜位置与最佳频率</text>
        <text x="${Math.min(x + 16, 700)}" y="${Math.max(y - 12, 34)}">${freq} Hz</text>
        ${ticks}
      `);
    }

    function loudnessSpl(freq, phon) {
      const sensitivity = 18 * Math.abs(Math.log2(freq / 3500));
      const lowPenalty = freq < 250 ? 18 : 0;
      return Math.round(phon + sensitivity + lowPenalty);
    }

    function drawLoudness() {
      if (!loudness || !phonInput || !loudFreq) return;
      const c = colors();
      const phon = Number(phonInput.value);
      const freq = Number(loudFreq.value);
      const width = 860, height = 320, pad = 58;
      const phons = [30, 50, 70, 90];
      const paths = phons.map((p) => {
        const pts = [];
        for (let i = 0; i <= 80; i += 1) {
          const f = 100 * Math.pow(100, i / 80);
          pts.push([logX(f, 100, 10000, width, pad), yMap(loudnessSpl(f, p), 20, 125, height, pad)]);
        }
        return `<path d="${pointPath(pts)}" fill="none" stroke="${p === phon ? c.cyan : c.line}" stroke-width="${p === phon ? 4 : 2}"/><text x="${width - pad + 8}" y="${pts[pts.length - 1][1] + 4}">${p}</text>`;
      }).join("");
      const spl = loudnessSpl(freq, phon);
      const x = logX(freq, 100, 10000, width, pad);
      const y = yMap(spl, 20, 125, height, pad);
      setText("phonText", `${phon} phon`);
      setText("loudFreqText", `${freq} Hz`);
      setText("splNeed", `${spl} dB SPL`);
      setText("loudBand", freq >= 2000 && freq <= 5000 ? "中高频最敏感" : "需要更高声压");
      makeSvg(loudness, `0 0 ${width} ${height}`, `
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="${c.line}"/>
        <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" stroke="${c.line}"/>
        ${paths}
        <circle cx="${x}" cy="${y}" r="9" fill="${c.red}"/>
        <text x="${x + 14}" y="${y - 8}">${freq} Hz / ${spl} dB</text>
        <text x="68" y="48">近似等响曲线</text>
      `);
    }

    function erb(freq) {
      return 24.7 * (4.37 * freq / 1000 + 1);
    }

    function drawBand() {
      if (!band || !bandFreq) return;
      const c = colors();
      const freq = Number(bandFreq.value);
      const width = 820, height = 280, pad = 54;
      const bw = erb(freq);
      const x = logX(freq, 120, 8000, width, pad);
      const left = logX(Math.max(120, freq - bw / 2), 120, 8000, width, pad);
      const right = logX(Math.min(8000, freq + bw / 2), 120, 8000, width, pad);
      setText("bandFreqText", `${freq} Hz`);
      setText("bandWidthText", `${Math.round(bw)} Hz`);
      setText("bandRangeText", `${Math.round(freq - bw / 2)} - ${Math.round(freq + bw / 2)} Hz`);
      const pts = [];
      for (let i = 0; i <= 80; i += 1) {
        const f = 120 * Math.pow(8000 / 120, i / 80);
        pts.push([logX(f, 120, 8000, width, pad), yMap(erb(f), 40, 950, height, pad)]);
      }
      makeSvg(band, `0 0 ${width} ${height}`, `
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <path d="${pointPath(pts)}" fill="none" stroke="${c.cyan}" stroke-width="4"/>
        <rect x="${left}" y="${pad}" width="${Math.max(2, right - left)}" height="${height - pad * 2}" fill="${c.cyan}" opacity=".14" stroke="${c.cyan}"/>
        <line x1="${x}" x2="${x}" y1="${pad}" y2="${height - pad}" stroke="${c.red}" stroke-width="2" stroke-dasharray="6 6"/>
        <circle cx="${x}" cy="${yMap(bw, 40, 950, height, pad)}" r="8" fill="${c.red}"/>
        <text x="64" y="48">ERB 近似带宽随中心频率变宽</text>
      `);
    }

    function drawMasking() {
      if (!masking || !maskerFreq || !targetFreq || !maskerLevel || !targetLevel) return;
      const c = colors();
      const mf = Number(maskerFreq.value);
      const tf = Number(targetFreq.value);
      const ml = Number(maskerLevel.value);
      const tl = Number(targetLevel.value);
      const width = 860, height = 300, pad = 58;
      function threshold(f) {
        const dist = Math.abs(Math.log2(f / mf));
        return ml - 8 - dist * 28 + (f > mf ? 5 : 0);
      }
      const pts = [];
      for (let i = 0; i <= 90; i += 1) {
        const f = 200 * Math.pow(6000 / 200, i / 90);
        pts.push([logX(f, 200, 6000, width, pad), yMap(threshold(f), 0, 95, height, pad)]);
      }
      const tx = logX(tf, 200, 6000, width, pad);
      const ty = yMap(tl, 0, 95, height, pad);
      const mx = logX(mf, 200, 6000, width, pad);
      const audible = tl > threshold(tf);
      setText("maskerFreqText", `${mf} Hz`);
      setText("targetFreqText", `${tf} Hz`);
      setText("maskerLevelText", `${ml} dB`);
      setText("targetLevelText", `${tl} dB`);
      setText("audibleText", audible ? "目标可能可闻" : "目标可能被掩蔽");
      setText("distanceText", `相距 ${Math.abs(tf - mf)} Hz`);
      makeSvg(masking, `0 0 ${width} ${height}`, `
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <path d="${pointPath(pts)}" fill="${c.cyan}" opacity=".12" stroke="${c.cyan}" stroke-width="3"/>
        <line x1="${mx}" x2="${mx}" y1="${yMap(ml, 0, 95, height, pad)}" y2="${height - pad}" stroke="${c.gold}" stroke-width="6"/>
        <line x1="${tx}" x2="${tx}" y1="${ty}" y2="${height - pad}" stroke="${audible ? c.cyan : c.red}" stroke-width="5"/>
        <circle cx="${tx}" cy="${ty}" r="8" fill="${audible ? c.cyan : c.red}"/>
        <text x="64" y="48">简化频域掩蔽阈值</text>
        <text x="${tx + 12}" y="${ty - 8}">${audible ? "高于阈值" : "低于阈值"}</text>
      `);
    }

    $all("[data-auditory-control]").forEach((input) => input.addEventListener("input", () => {
      drawCochlea(); drawLoudness(); drawBand(); drawMasking();
    }));
    $("#playMaskDemo")?.addEventListener("click", () => playToneSet(Number(maskerFreq.value), [0.9, 0, 0, 0], 0.9));
    $("#playTargetDemo")?.addEventListener("click", () => playToneSet(Number(targetFreq.value), [0.6], 0.9));
    drawCochlea(); drawLoudness(); drawBand(); drawMasking();
  }

  function initPitchTimbre() {
    const semitone = $("#semitoneFromA4");
    const harmonicCount = $("#pitchHarmonics");
    const missing = $("#missingFundamental");
    const pitchCanvas = $("#pitchCanvas");
    const timbreCanvas = $("#timbreCanvas");
    const attack = $("#attackMs");
    const harmonicInputs = $all("[data-harmonic]");

    const names = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    function midiToName(midi) {
      const octave = Math.floor(midi / 12) - 1;
      return `${names[midi % 12]}${octave}`;
    }

    function pitchData() {
      const semi = Number(semitone?.value || 0);
      const midi = 69 + semi;
      const f0 = 440 * Math.pow(2, semi / 12);
      const count = Number(harmonicCount?.value || 5);
      return { semi, midi, f0, count, missingOn: Boolean(missing?.checked) };
    }

    function drawPitch() {
      if (!pitchCanvas || !semitone || !harmonicCount) return;
      const data = pitchData();
      setText("semitoneText", data.semi);
      setText("pianoNoteText", midiToName(data.midi));
      setText("pianoFreqText", `${data.f0.toFixed(2)} Hz`);
      setText("midiNoteText", `MIDI ${data.midi}`);
      setText("harmonicCountText", data.count);
      drawCanvas(pitchCanvas, (ctx, width, height, c) => {
        ctx.strokeStyle = c.line;
        ctx.lineWidth = 1;
        for (let i = 0; i < 6; i += 1) {
          const y = 30 + i * (height - 70) / 5;
          ctx.beginPath(); ctx.moveTo(34, y); ctx.lineTo(width - 22, y); ctx.stroke();
        }
        ctx.beginPath();
        for (let x = 0; x < width; x += 1) {
          const t = x / width;
          let yv = 0;
          for (let h = 1; h <= data.count; h += 1) {
            if (data.missingOn && h === 1) continue;
            yv += Math.sin(t * Math.PI * 2 * h * 5) * (1 / h);
          }
          const y = height * 0.34 - yv * height * 0.08;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = c.cyan;
        ctx.lineWidth = 2;
        ctx.stroke();
        const baseY = height * 0.76;
        for (let h = 1; h <= data.count; h += 1) {
          const x = 52 + (h - 1) * (width - 104) / Math.max(1, data.count - 1);
          const amp = data.missingOn && h === 1 ? 0.08 : 1 / h;
          ctx.fillStyle = h === 1 ? c.gold : c.cyan;
          ctx.fillRect(x - 8, baseY - amp * height * 0.28, 16, amp * height * 0.28);
          ctx.fillStyle = c.muted;
          ctx.fillText(`H${h}`, x - 8, baseY + 18);
        }
        ctx.fillStyle = c.ink;
        ctx.fillText(data.missingOn ? "缺失基频：H1 不播放，但周期线索仍可保留" : "基频和谐波共同塑造音高", 22, 24);
      });
    }

    function timbrePartials() {
      return harmonicInputs.map((input) => Number(input.value) / 100);
    }

    function drawTimbre() {
      if (!timbreCanvas) return;
      const partials = timbrePartials();
      setText("attackText", `${attack?.value || 30} ms`);
      harmonicInputs.forEach((input, index) => setText(`h${index + 1}Text`, `${input.value}%`));
      drawCanvas(timbreCanvas, (ctx, width, height, c) => {
        const attackRatio = Number(attack?.value || 30) / 240;
        ctx.fillStyle = c.ink;
        ctx.fillText("波形 / 包络 / 谐波谱", 22, 24);
        ctx.strokeStyle = c.line;
        ctx.beginPath(); ctx.moveTo(20, height * 0.45); ctx.lineTo(width - 20, height * 0.45); ctx.stroke();
        ctx.beginPath();
        for (let x = 0; x < width; x += 1) {
          const t = x / width;
          const env = Math.min(1, t / Math.max(0.02, attackRatio)) * Math.exp(-t * 0.72);
          let yv = 0;
          partials.forEach((amp, index) => {
            yv += Math.sin(t * Math.PI * 2 * (index + 1) * 8) * amp;
          });
          const y = height * 0.42 - yv * env * height * 0.18;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = c.cyan;
        ctx.lineWidth = 2;
        ctx.stroke();
        const baseY = height * 0.85;
        partials.forEach((amp, index) => {
          const x = 52 + index * (width - 104) / Math.max(1, partials.length - 1);
          ctx.fillStyle = index === 0 ? c.gold : c.cyan;
          ctx.fillRect(x - 10, baseY - amp * height * 0.3, 20, amp * height * 0.3);
          ctx.fillStyle = c.muted;
          ctx.fillText(`H${index + 1}`, x - 10, baseY + 18);
        });
      });
    }

    $all("[data-pitch-control]").forEach((input) => input.addEventListener("input", drawPitch));
    $all("[data-timbre-control]").forEach((input) => input.addEventListener("input", drawTimbre));
    missing?.addEventListener("change", drawPitch);
    $("#playPitch")?.addEventListener("click", () => {
      const data = pitchData();
      const partials = Array.from({ length: data.count }, (_, index) => (data.missingOn && index === 0 ? 0 : 1 / (index + 1)));
      playToneSet(data.f0, partials, 1.1);
    });
    $("#playTimbre")?.addEventListener("click", () => playToneSet(220, timbrePartials(), 1.2, Number(attack?.value || 30)));
    drawPitch(); drawTimbre();
  }

  function initSpatial() {
    const azimuth = $("#azimuth");
    const cueFreq = $("#cueFreq");
    const hrtfAz = $("#hrtfAz");
    const elev = $("#hrtfElev");
    const listener = $("#listener");
    const iacc = $("#iaccValue");
    const delay = $("#echoDelay");
    const asaControls = $all("[data-asa-cue]");

    function drawBinaural() {
      const el = $("#binauralDiagram");
      if (!el || !azimuth || !cueFreq) return;
      const c = colors();
      const az = Number(azimuth.value);
      const freq = Number(cueFreq.value);
      const angle = (-90 + az) * Math.PI / 180;
      const sx = 380 + Math.cos(angle) * 220;
      const sy = 238 + Math.sin(angle) * 190;
      const itd = 0.63 * Math.sin(az * Math.PI / 180);
      const ild = Math.abs(Math.sin(az * Math.PI / 180)) * Math.min(9, freq / 850);
      setText("azimuthText", `${az}°`);
      setText("cueFreqText", `${freq} Hz`);
      setText("itdReadout", `${itd.toFixed(2)} ms`);
      setText("ildReadout", `${ild.toFixed(1)} dB`);
      setText("dominantCue", freq < 1500 ? "ITD 更可靠" : "ILD 更明显");
      makeSvg(el, "0 0 760 430", `
        <rect x="24" y="24" width="712" height="382" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <circle cx="380" cy="250" r="98" fill="none" stroke="${c.line}" stroke-width="2"/>
        <path d="M380 160 C455 160 510 214 510 286 C510 352 455 390 380 390 C305 390 250 352 250 286 C250 214 305 160 380 160 Z" fill="transparent" stroke="${c.gold}" stroke-width="4"/>
        <circle cx="250" cy="286" r="15" fill="${c.bg}" stroke="${c.cyan}" stroke-width="4"/>
        <circle cx="510" cy="286" r="15" fill="${c.bg}" stroke="${c.cyan}" stroke-width="4"/>
        <line x1="${sx}" y1="${sy}" x2="250" y2="286" stroke="${az < 0 ? c.gold : c.cyan}" stroke-width="3"/>
        <line x1="${sx}" y1="${sy}" x2="510" y2="286" stroke="${az > 0 ? c.gold : c.cyan}" stroke-width="3"/>
        <circle cx="${sx}" cy="${sy}" r="13" fill="${c.red}"/>
        <text x="${sx + 18}" y="${sy + 4}">source</text>
        <text x="52" y="58">ITD/ILD 随方位和频率改变</text>
      `);
    }

    function drawHrtf() {
      const el = $("#hrtfDiagram");
      if (!el || !hrtfAz || !elev || !listener) return;
      const c = colors();
      const az = Number(hrtfAz.value);
      const ev = Number(elev.value);
      const li = Number(listener.value);
      const notch = 6200 + ev * 45 + li * 420 + Math.abs(az) * 14;
      setText("hrtfAzText", `${az}°`);
      setText("hrtfElevText", `${ev}°`);
      setText("listenerText", `listener ${String.fromCharCode(65 + li)}`);
      setText("notchReadout", `${(notch / 1000).toFixed(1)} kHz`);
      setText("externalReadout", li === 0 ? "匹配较好" : "个体差异存在");
      const width = 860, height = 300, pad = 54;
      function curve(side) {
        const pts = [];
        for (let i = 0; i <= 90; i += 1) {
          const f = 500 * Math.pow(16000 / 500, i / 90);
          const base = side * az * 0.05 + Math.sin(Math.log(f) * 2.2 + li) * 3;
          const dip = -15 * Math.exp(-Math.pow((f - notch) / 1700, 2));
          pts.push([logX(f, 500, 16000, width, pad), yMap(base + dip, -22, 12, height, pad)]);
        }
        return pointPath(pts);
      }
      makeSvg(el, `0 0 ${width} ${height}`, `
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <path d="${curve(-1)}" fill="none" stroke="${c.cyan}" stroke-width="4"/>
        <path d="${curve(1)}" fill="none" stroke="${c.gold}" stroke-width="4"/>
        <text x="58" y="50">HRTF 谱线索：方向、仰角和个体差异改变凹陷位置</text>
        <text x="650" y="72" fill="${c.cyan}">left</text>
        <text x="650" y="96" fill="${c.gold}">right</text>
      `);
    }

    function drawIacc() {
      const canvas = $("#iaccCanvas");
      if (!canvas || !iacc) return;
      const value = Number(iacc.value);
      setText("iaccText", value.toFixed(2));
      setText("widthReadout", value > 0.78 ? "声像较窄" : value > 0.42 ? "中等宽度" : "宽阔扩散");
      setText("envelopmentReadout", value < 0.5 ? "包围感增强" : "包围感较弱");
      drawCanvas(canvas, (ctx, width, height, c) => {
        const mid1 = height * 0.34;
        const mid2 = height * 0.68;
        ctx.strokeStyle = c.line;
        ctx.beginPath(); ctx.moveTo(0, mid1); ctx.lineTo(width, mid1); ctx.moveTo(0, mid2); ctx.lineTo(width, mid2); ctx.stroke();
        for (let ch = 0; ch < 2; ch += 1) {
          ctx.beginPath();
          for (let x = 0; x < width; x += 1) {
            const t = x / width;
            const shared = Math.sin(t * Math.PI * 18) * 0.75 + Math.sin(t * Math.PI * 41) * 0.2;
            const diff = Math.sin(t * Math.PI * (23 + ch * 7) + ch * 1.8) * (1 - value);
            const yv = shared * value + diff;
            const y = (ch ? mid2 : mid1) - yv * height * 0.11;
            if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = ch ? c.gold : c.cyan;
          ctx.lineWidth = 2;
          ctx.stroke();
        }
        ctx.fillStyle = c.ink;
        ctx.fillText("Left", 18, mid1 - 44);
        ctx.fillText("Right", 18, mid2 - 44);
      });
    }

    function drawPrecedence() {
      const el = $("#precedenceDiagram");
      if (!el || !delay) return;
      const c = colors();
      const d = Number(delay.value);
      const state = d < 5 ? "融合成一个事件" : d < 35 ? "定位由先到达声主导" : "可能听成回声";
      setText("echoDelayText", `${d} ms`);
      setText("fusionReadout", state);
      const x2 = 150 + d * 7;
      makeSvg(el, "0 0 860 260", `
        <rect x="20" y="20" width="820" height="210" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <line x1="90" y1="150" x2="770" y2="150" stroke="${c.line}" stroke-width="2"/>
        <line x1="150" y1="80" x2="150" y2="190" stroke="${c.cyan}" stroke-width="8"/>
        <line x1="${x2}" y1="102" x2="${x2}" y2="190" stroke="${c.gold}" stroke-width="8"/>
        <text x="132" y="64">直达声</text>
        <text x="${x2 - 28}" y="88">反射</text>
        <text x="90" y="218">${state}</text>
      `);
    }

    function drawAsa() {
      const el = $("#asaDiagram");
      if (!el) return;
      const c = colors();
      const active = asaControls.filter((input) => input.checked).length;
      const count = active >= 3 ? 1 : active >= 1 ? 2 : 4;
      setText("asaCount", `${count} 条音流`);
      setText("asaConfidence", active >= 3 ? "分组稳定" : active >= 1 ? "中等稳定" : "容易分裂");
      let objects = "";
      for (let i = 0; i < 12; i += 1) {
        const group = active >= 3 ? 0 : i % count;
        const x = 90 + i * 58;
        const y = 210 - group * 42 + Math.sin(i * 1.7) * 20;
        const color = [c.cyan, c.gold, c.red, c.muted][group % 4];
        objects += `<circle cx="${x}" cy="${y}" r="11" fill="${color}"/><line x1="${x}" y1="${y}" x2="${x}" y2="${y + 42}" stroke="${color}" opacity=".35"/>`;
      }
      makeSvg(el, "0 0 860 320", `
        <rect x="20" y="20" width="820" height="260" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <text x="58" y="54">共同起音、空间一致、音色相似、共同变化越多，越容易形成一个对象</text>
        ${objects}
      `);
    }

    $all("[data-spatial-control]").forEach((input) => input.addEventListener("input", () => {
      drawBinaural(); drawHrtf(); drawIacc(); drawPrecedence(); drawAsa();
    }));
    asaControls.forEach((input) => input.addEventListener("change", drawAsa));
    drawBinaural(); drawHrtf(); drawIacc(); drawPrecedence(); drawAsa();
  }

  function initFeatures() {
    const windowSize = $("#windowSize");
    const hopSize = $("#hopSize");
    const melBands = $("#melBands");
    const canvas = $("#featureCanvas");
    function drawFeature() {
      if (!canvas || !windowSize || !hopSize || !melBands) return;
      const win = Number(windowSize.value);
      const hop = Number(hopSize.value);
      const mel = Number(melBands.value);
      setText("windowText", `${win} ms`);
      setText("hopText", `${hop} ms`);
      setText("melBandsText", mel);
      setText("timeRes", win < 24 ? "时间分辨率较好" : "时间分辨率较粗");
      setText("freqRes", win > 40 ? "频率分辨率较好" : "频率分辨率中等");
      setText("taskHint", mel >= 80 ? "适合细粒度纹理" : "适合分类/检测基线");
      drawCanvas(canvas, (ctx, width, height, c) => {
        ctx.fillStyle = c.ink;
        ctx.fillText("帧、频带与任务信息保留", 20, 26);
        const left = 42, top = 52;
        const plotW = width - 84, plotH = height - 94;
        ctx.strokeStyle = c.line;
        ctx.strokeRect(left, top, plotW, plotH);
        const cols = Math.max(8, Math.floor(220 / hop));
        const rows = Math.max(8, Math.min(32, Math.floor(mel / 4)));
        const cw = plotW / cols;
        const rh = plotH / rows;
        for (let x = 0; x < cols; x += 1) {
          for (let y = 0; y < rows; y += 1) {
            const energy = 0.5 + 0.5 * Math.sin(x * 0.75 + y * 0.42) * Math.exp(-Math.abs(y - rows * 0.42) / rows);
            ctx.fillStyle = energy > 0.72 ? c.cyan : energy > 0.48 ? c.gold : "rgba(127,146,145,.18)";
            ctx.globalAlpha = 0.28 + energy * 0.62;
            ctx.fillRect(left + x * cw + 1, top + y * rh + 1, Math.max(1, cw - 2), Math.max(1, rh - 2));
          }
        }
        ctx.globalAlpha = 1;
        const winW = Math.max(8, (win / 96) * plotW * 0.42);
        ctx.strokeStyle = c.red;
        ctx.lineWidth = 3;
        ctx.strokeRect(left + plotW * 0.18, top + 8, winW, plotH - 16);
        ctx.fillStyle = c.muted;
        ctx.fillText(`窗长 ${win} ms / 帧移 ${hop} ms / ${mel} Mel bands`, left, height - 24);
      });
    }
    $all("[data-feature-control]").forEach((input) => input.addEventListener("input", drawFeature));
    drawFeature();
  }

  function initAll() {
    initAuditory();
    initPitchTimbre();
    initSpatial();
    initFeatures();
  }

  window.addEventListener("resize", initAll);
  document.addEventListener("DOMContentLoaded", initAll);
  new MutationObserver(initAll).observe(root, { attributes: true, attributeFilter: ["data-theme"] });
})();
