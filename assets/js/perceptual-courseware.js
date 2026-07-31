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
    repairInteractiveSvgText(container);
  }

  function repairInteractiveSvgText(container) {
    const svg = $("svg", container);
    if (!svg) return;

    const labelByDiagram = {
      cochleaDiagram: "耳蜗基底膜位置—频率映射",
      loudnessDiagram: "等响曲线示意：频率与所需声压级",
      auditoryFilterDiagram: "听觉滤波器组：中心频率与 ERB 带宽",
      bandDiagram: "ERB 临界频带：带宽随中心频率变化",
      maskingDiagram: "频域掩蔽：掩蔽声抬高附近可听阈",
      mp3FlowDiagram: "蓝线表示音频表示，金线表示心理声学约束。",
    };

    const looksGarbled = (text) => /[闂缂閻婵鈧顭�]/u.test(text) || /[\uE000-\uF8FF]/u.test(text) || text.length > 80;

    $all("text", svg).forEach((textElement) => {
      const original = textElement.textContent.trim();
      if (!looksGarbled(original)) return;

      const frequency = original.match(/^(\d+(?:\.\d+)?\s*Hz)/i);
      if (frequency) {
        textElement.textContent = `${frequency[1]} 中心频率`;
      } else if (original.startsWith("Gammatone")) {
        textElement.textContent = "Gammatone 冲激响应";
      } else if (original.startsWith("ERB")) {
        textElement.textContent = "ERB 带宽随频率变化";
      } else if (labelByDiagram[container.id]) {
        textElement.textContent = labelByDiagram[container.id];
      } else {
        textElement.remove();
      }
    });
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
    const auditoryFilter = $("#auditoryFilterDiagram");
    const filterCenter = $("#filterCenter");
    const filterOrder = $("#filterOrder");
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
    const mp3Flow = $("#mp3FlowDiagram");

    function drawCochlea() {
      if (!cochlea || !freqInput) return;
      const c = colors();
      const freq = Number(freqInput.value);
      const position = Math.max(0.02, Math.min(0.98, (Math.log(freq) - Math.log(80)) / (Math.log(12000) - Math.log(80))));
      const x = 90 + position * 680;
      const y = 170 - Math.sin(position * Math.PI) * 80;
      const region = freq < 400 ? "低频：耳蜗顶端更敏感" : freq < 3000 ? "中频：语音区更敏感" : "高频：基底端更敏感";
      setText("cochleaFreqText", `${freq} Hz`);
      setText("cochleaRegion", region);
      setText("cochleaPlace", `基底膜位置 ${(position * 100).toFixed(0)}%`);
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
        <text x="70" y="54">闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌ｉ幋锝呅撻柛銈呭閺屾盯骞橀懠顒€濡介梺绋跨箲缁捇寮诲☉銏╂晝闁挎繂妫涢ˇ銉╂⒑濮瑰洤鈧宕戦幘鑸靛床婵炴垯鍨圭粻锝嗙箾閸℃绠冲ù鐘哄亹缁辨挻鎷呴崫鍕戭剚銇勯銏╂█濠碉紕鏁诲畷鐔碱敍濮樿京鏉搁梻浣哥枃濡椼劎鎷嬮弻銉ョ；闁圭偓鏋煎Σ鍫熺箾閸℃ê濮囩€殿喖娼″铏规喆閸曨偄濮告繝娈垮枔閸婃繈骞冮垾鏂ユ瀻闁规儳顕崢闈涱渻閵堝棛澧紒瀣笧濞嗐垽鎳犻浣镐粡濠殿喗顭堥崺鏍煕閹达附鐓欓柤娴嬫櫅娴犳粓鏌嶈閸撴艾煤閻旂粯顥ら梻浣筋潐椤旀牠宕板Δ鈧悾鐑藉矗婢跺瞼鐦堥梻鍌氱墛缁嬫帒顔忓┑鍫㈢＜闁绘宕甸悾娲煛瀹€鈧崰鏍€佸☉銏犲耿婵°倐鍋撻柍褜鍓氶幃鍌濇＂濠殿喗顭堟禍顒傚娴犲鐓曢悘鐐村礃婢规﹢鏌嶈閸撴岸骞冮崒姘辨殾闁圭増婢樻导鐘绘煏婢诡垰鎳愰崢鐘绘⒒娴ｅ憡璐￠柧蹇撻叄瀹曚即寮介銈勭瑝闂佺粯顭囩划顖炴偂濞嗘挻鈷戞い鎾卞妿閻ｉ亶鏌＄€ｎ剙鏋戦柕鍥у椤㈡洟鏁愰崱娆樻Ч闂備礁鎼惌澶屾崲濠靛棛鏆︽慨妞诲亾濠碘剝鐡曢ˇ鏌ユ煃瀹勬壆澧︽慨濠勫劋濞碱亪骞嶉鍛滈梻浣瑰濞诧附绂嶉鍕靛殨濠电姵鑹惧洿闂佺硶鍓濋敋鐎殿喖娼″楦裤亹閹烘垳鍠婇梺绋跨箲閿曘垹鐣烽幋锕€绠绘繝銏犲濡啫鐣烽妸鈺婃晣闁绘ê鐏氶悗顐︽⒒閸屾瑨鍏屾い顐㈩儔瀹曠喖宕归銈嗘闂傚倷鐒︽繛濠囧绩闁秴鍨傞柛褎顨呴拑鐔哥箾閹寸們姘跺绩娴犲鐓曢柍鈺佸枤濞堛垹霉鐏忔牕浜惧┑鐘垫暩婵參骞忛崘顔肩妞ゆ劑鍩勫姘舵⒒娴ｅ憡鎯堥柡鍫墰缁瑩骞樼拠鑼姦濡炪倖甯掗敃锔剧矓閻㈠憡鐓曢悗锝庝簼閸ｈ棄霉濠婂嫭鍊愭い銏★耿婵偓闁宠棄妫欓埛鏍р攽閻橆喖鐏遍柛鈺傜墵瀹曟繈寮介鐔蜂簵闂侀潧顧€婵″洨寮ч埀顒勬⒒閸屾氨澧涚紒瀣浮钘熼柣鎰暘娴滄粓鏌曟径娑橆洭闁活厽甯￠弻锛勪沪閻ｅ睗銈囩磼鏉堛劌绗掗摶锝夋煠婵劕鈧倕危娴煎瓨鈷掑〒姘ｅ亾婵炰匠鍏犳椽濡堕崶锝呬壕婵﹩鍋勫畵鍡欌偓娈垮櫘閸嬪﹪鐛崶顒€绾ч柛顭戝枤閻涒晜淇婇悙顏勨偓鏍偋濡も偓椤繈濡搁埡浣稿亶婵炲濮撮鍡涘煕?/text>
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
      setText("loudBand", freq >= 2000 && freq <= 5000 ? "最敏感频段" : "需要更高 SPL");
      makeSvg(loudness, `0 0 ${width} ${height}`, `
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="${c.line}"/>
        <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" stroke="${c.line}"/>
        ${paths}
        <circle cx="${x}" cy="${y}" r="9" fill="${c.red}"/>
        <text x="${x + 14}" y="${y - 8}">${freq} Hz / ${spl} dB</text>
        <text x="68" y="48">闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋為悧鐘汇€侀弴姘辩Т闂佹悶鍎洪崜锕傚极閸愵喗鐓ラ柡鍥殔娴滈箖姊哄Ч鍥р偓妤呭磻閹捐埖宕叉繝闈涙川缁♀偓闂佺鏈划宀勩€傚ú顏呪拺闁硅偐鍋涙俊濂告煕婵犲倹鍋ョ€殿喖顭烽幃銏ゆ偂鎼达絿鏆伴梻浣虹帛椤ㄥ懘鎮у鍏炬盯宕熼鐘碉紳婵炶揪绲介幖顐︻敁瀹€鍕厱闁挎繂绻掔粔顔锯偓娈垮枦椤曆囶敇婵傜閱囨い鎰剁秵閳ь剙娲缁樻媴閸涘﹤鏆堥梺瑙勭摃瀹曠數鍒掑▎鎾崇婵犮垹瀚哥紞渚€鐛崶顒€绾ч悹渚厛閸炴椽姊绘担鐑樺殌闁宦板妼椤繗銇愰幒鐐电◤閻庡箍鍎遍幊澶愬绩閼恒儯浜滈柡鍐ㄥ€婚幗鍌涚箾閸喐鈷愬ǎ鍥э躬椤㈡洟鏁愰崶銊ユ珮闂備浇宕甸崯娆撳炊閵娿垺瀚介梻浣侯焾閺堫剟鎮烽妸鈺佺閻忕偘鍕樻禍婊堟煏韫囨洖顎撻棅顒夊墰閳ь剝顫夊ú姗€宕归崸妤冨祦闁搞儺鍓欑痪褔鎮规笟顖滃帥婵″樊鍨辩换婵堝枈濡椿娼戦梺鍓茬厛閸ㄦ娊骞忛崘顔芥櫇闁稿本鑹鹃幆鐐烘⒑閸濆嫭鍌ㄩ柛銊︽そ閹€斥枎閹寸姷锛濇繛杈剧秮濞佳囨倶閳哄懏鐓涢悗锝庡墮閺嬫盯鏌＄仦鍓ф创濠碘€崇埣瀹曞崬螖閸愌勵敇闂傚倷绶氬褍煤閵堝洠鍋撳顐㈠祮闁绘侗鍣ｉ獮鎺懳旈埀顒勭嵁閵忊€茬箚闁绘劖娼欓崝銈嗐亜閵夛箒澹橀柍?/text>
      `);
    }

    function erb(freq) {
      return 24.7 * (4.37 * freq / 1000 + 1);
    }

    function drawAuditoryFilter() {
      if (!auditoryFilter || !filterCenter || !filterOrder) return;
      const c = colors();
      const center = Number(filterCenter.value);
      const order = Number(filterOrder.value);
      const bw = erb(center);
      const q = center / bw;
      const width = 900, height = 340, pad = 62;
      const minF = 100, maxF = 9000;
      const centerX = logX(center, minF, maxF, width, pad);
      setText("filterCenterText", `${center} Hz`);
      setText("filterOrderText", order);
      setText("filterBandwidthText", `${Math.round(bw)} Hz`);
      setText("filterQText", `Q≈${q.toFixed(1)}`);
      setText("filterUseText", center < 500 ? "低频细节" : center < 3000 ? "语音频带细节" : "高频纹理");

      function filterResponse(freq, fc, scale = 1) {
        const distance = Math.abs(Math.log2(freq / fc));
        const bandwidth = Math.max(0.18, erb(fc) / fc * 4.2);
        return Math.pow(Math.max(0, 1 - distance / bandwidth), order) * scale;
      }

      const bankCenters = [160, 250, 400, 630, 1000, 1600, 2500, 4000, 6400];
      const bank = bankCenters.map((fc) => {
        const pts = [];
        for (let i = 0; i <= 80; i += 1) {
          const freq = minF * Math.pow(maxF / minF, i / 80);
          const active = Math.abs(Math.log2(fc / center)) < 0.22;
          pts.push([logX(freq, minF, maxF, width, pad), yMap(filterResponse(freq, fc, active ? 0.96 : 0.42), 0, 1, height, pad)]);
        }
        const active = Math.abs(Math.log2(fc / center)) < 0.22;
        return `<path d="${pointPath(pts)}" fill="none" stroke="${active ? c.gold : c.cyan}" stroke-width="${active ? 4 : 2}" opacity="${active ? 1 : .38}"/>`;
      }).join("");

      const impulse = [];
      for (let i = 0; i <= 120; i += 1) {
        const t = i / 120;
        const envelope = Math.pow(t, order - 1) * Math.exp(-7 * t);
        const wave = Math.cos(2 * Math.PI * (5 + center / 1200) * t);
        impulse.push([560 + t * 260, 82 - envelope * wave * 560]);
      }

      const ticks = [125, 250, 500, 1000, 2000, 4000, 8000].map((freq) => {
        const x = logX(freq, minF, maxF, width, pad);
        return `<line x1="${x}" y1="${height - pad}" x2="${x}" y2="${height - pad + 10}" stroke="${c.line}"/><text x="${x - 16}" y="${height - 22}">${freq >= 1000 ? `${freq / 1000}k` : freq}</text>`;
      }).join("");

      makeSvg(auditoryFilter, `0 0 ${width} ${height}`, `
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <line x1="${pad}" y1="${height - pad}" x2="${width - pad}" y2="${height - pad}" stroke="${c.line}"/>
        <line x1="${pad}" y1="${pad}" x2="${pad}" y2="${height - pad}" stroke="${c.line}"/>
        ${ticks}
        ${bank}
        <line x1="${centerX}" x2="${centerX}" y1="${pad}" y2="${height - pad}" stroke="${c.red}" stroke-width="2" stroke-dasharray="6 6"/>
        <circle cx="${centerX}" cy="${pad + 8}" r="7" fill="${c.red}"/>
        <text x="70" y="48">缂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鎯у⒔閹虫捇鈥旈崘顏佸亾閿濆簼绨奸柟鐧哥秮閺岋綁顢橀悙鎼闂傚洤顦甸弻銊モ攽閸℃ɑ鎮欓梺鍛婃煥椤戝洭鍩€椤掑喚娼愭繛鍙夌墪椤曪綁宕奸弴鐐电杽闂侀潧顭堥崕鍝勩€掓繝姘仯闁搞儺浜滅槐锕€顭跨憴鍕婵﹦绮幏鍛驳鐎ｎ亝鐣伴梻浣告憸婵敻銆冮崨绮光偓锕傚垂椤曞懏寤洪梺閫炲苯澧寸€规洘妞芥慨鈧柍鈺佸暙閸斿懘姊洪棃娑辩劸闁稿孩濞婇、娆撳箳濡や胶鍘介柟鑲╄ˉ閸撴繄鎷归垾鏂ユ斀妞ゆ棁鍋愰悞鍝モ偓娈垮枟閹告娊骞冨鍫濆耿婵☆垵娅ｅΣ锝夋⒒閸屾瑧绐旀繛浣冲洦鍋嬮柛鈩冦亗濞戞鏃堝礃椤忓棛鏆ラ梻浣告贡閸庛倝銆冮崱娑欏亗闁哄洢鍨洪悡鐔镐繆椤栨繃顏犻柡瀣暙椤法鎲撮崟鍡樺灴婵＄敻宕熼锝嗘櫍闂佺粯鍔栧娆撳几閻樼粯鍊垫繛鍫濈仢閺嬬喖鏌熼崨濠傗枙妤犵偛鍟存慨鈧柕鍫濇閸庮亪姊洪棃鈺佺槣闁告ü绮欓敐鐐典沪閸撗呯槇闂佹眹鍨藉褍鏆╅梻浣芥〃閻掞箓骞冮崒姘辨殾闁瑰瓨绺惧Σ鍫ユ煏韫囧ň鍋撻弬銉ヤ壕闁煎摜鏁哥弧鈧梻鍌氱墛娓氭宕曡箛娑欑厽闁圭儤鍨规禒娑㈡煏閸パ冾伃妤犵偞甯掗濂稿醇濠靛棗鑵愭繝鐢靛Л閹峰啴宕橀妸銊ョ厴闂傚倸娲らˇ鎵崲濠靛洨绡€闁稿本绋戦娑㈡⒑缂佹ê娴紒鐘崇墵瀵顓奸崶銊ユ瀭闂佸憡娲﹂崑鍡樼婵傚憡鈷戦梺顐ゅ仜閼活垱鏅堕崜褏纾界€广儱鎳忛ˉ鐐电磼閸屾氨效妞ゃ垺妫冨畷鐔告償閵忋垺鍒涢梺璇″枟缁捇骞婇悙鍝勎ㄩ柕蹇娾偓鎰佷紪闂傚倸鍊搁崐鎼佸磹閹间焦鍋嬪┑鐘插暟閳绘棃鏌ｉ悢绋款棎婵℃彃鐗撻弻鏇＄疀閺囩倫銏㈢磼閹邦厾鈽夋い顏勫暣婵″爼宕卞▎蹇ｆ椒缂傚倷绶￠崰鏍儔婵傜鏋佹い鏇楀亾妤犵偞甯掕灃濞达絽寮剁€氫粙姊绘担渚劸闁哄牜鍓熼幃鐤樄鐎规洘绻傞鍏煎緞鐎ｎ亖鍋撻悽鐢电＜婵°倓鑳堕埥澶愭煙閾忣偄濮嶉柟顖氳嫰閳诲酣骞樼€电骞嶉梻浣虹帛閸ㄥ爼鏁冮埡浣叉灁闁哄洢鍨洪悡鏇㈠箹濞ｎ剙鐒烘繛鍫熸礋閺屾洟宕惰椤忣厾鈧鍠楀娆掔亙闂侀€炲苯澧紒鍌氱У閵堬綁宕橀埞鐐缂備胶铏庨崢濂稿箠韫囨稒鍋熸い蹇撶墛閻撶喖鏌ｉ弬鍨骇婵炲懎锕弻锝呪槈閸楃偞鐏撻梺閫炲苯澧剧紓宥呮瀹曟澘螖閸涱厾鏌ч梺鍝勮閸庢煡鎮￠弴銏＄厪濠㈣泛鐗嗛悘顏呯箾閸涱厽顥炵紒缁樼箞婵偓闁炽儱纾导灞解攽椤旂》鍔熺紒顕呭灦楠炲繘宕ㄩ弶鎴濈獩婵犵數濮撮崐鐟扳枔濮椻偓濮婄粯鎷呴崨濠傛殘濠碘槅鍋呴崹鍦垝婵犳艾绠荤€规洖娲﹀▓楣冩⒑閻熸澘顣抽柣鈩冩瀵偆鈧綆鍠楅悡鍐喐濠婂牆绀堟繛鍡樻惄閺佸鏌ㄥ┑鍡╂Ц缂佺媭鍣ｉ弻锕€螣閻氬绀嗛梺闈浥堥弲婊堟偂閸愵喗鐓曟繝闈涙椤忊晠鏌嶈閸撴瑩鈥﹀畡鎵殾闁靛繈鍊栫€电姴顭跨捄鐑橆棡闁哄倵鍋撻梻鍌欒兌缁垶鈥﹂崼銉晪婵犲﹤鍠氶崯鍛存煏婢跺棙娅嗛柣鎾存礋閺岋綁寮村槌栨М闂佽楠忕徊璺ㄦ閹烘鏁婇柤鎭掑劤濞堛倝姊洪崷顓熷殌閻庢氨澧楁穱濠傤潰瀹€濠冃梻浣瑰缁嬫帞鍒掑鍥ㄥ床婵犻潧顑呴～鍛存煥濠靛棙顥犻柕鍡樺姍濮婃椽宕楅崗绗轰户闂佹悶鍔忓▔娑㈡偩瀹勬壋鏀介柛顐ｈ壘娴滈箖鏌ㄥ┑鍡涱€楀ù婊勭墪闇夋繝濠傚閻帡鏌＄仦鐐缂佺粯鐩畷褰掝敊閻撳寒娼ラ梻鍌欒兌閹虫捇宕ョ€ｎ喖绀夐柡宥庡幖妗呴梺鍛婃处閸ㄥジ寮崘顔界叆婵犻潧妫欏婵嬫煟閹炬剚妯€闁诡喗顨堥幉鎾礋椤掑偆妲梻渚€娼ч悧鍡涘箟閿熺姴绠為柕濞炬櫅閻掑灚銇勯幒鎴濐仾闁绘挸绻橀悡顐﹀炊瑜濋弨缁樼箾閸涱厽顥㈢€规洦鍨崇划锝夋偝閸?闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簻椤掋垺銇勯幇顏嗙煓闁哄被鍔戦幃銏ゅ传閸曟垯鍨婚惀顏堝箚瑜滈悡濂告煛鐏炲墽鈽夐柍钘夘槸铻ｉ柛蹇撳悑閸犳牠姊绘担瑙勫仩闁稿﹥娲熼幊鐔碱敍濠靛牅绨烽梻鍌欑劍鐎笛呮崲閸岀偛绠犻幖娣妼濮规煡鏌ｉ幇顔煎妺闁绘挻娲熼幃妤呮晲閸愩劌顬堟繝纰樷偓鑼煓闁哄本娲熷畷鎯邦槻妞ゅ浚鍘介〃銉╂倷閸欏鏋犻梺绯曟杹閸撴繈骞忛崨鏉戠闁瑰搫绉撮ˉ姘舵⒒娴ｅ憡鎯堢紒瀣╃窔瀹曘垽鎳栭埡鍐х瑝濠殿喗顭堥崺鏍偂韫囨搩鐔嗛悹楦挎婢ф洟鏌涢弮鈧〃濠囧蓟閿熺姴鐒垫い鎺嶈兌椤╃兘鎮楅敐搴′簽闁告妫勯埞鎴﹀煡閸℃浠村銈嗘肠閸涱厾绛忛柣鐘叉穿椤ュ棝鎮烽柇锔惧弳闂佸憡渚楅崢鍝勎ｉ幇鐗堚拺?/text>
        <text x="${Math.min(centerX + 12, width - 190)}" y="82">${center} Hz 闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁惧墽鎳撻—鍐偓锝庝簻椤掋垺銇勯幇顏嗙煓闁哄被鍔戦幃銏ゅ传閸曟垯鍨婚惀顏堝箚瑜滈悡濂告煛鐏炲墽鈽夐柍钘夘樀瀹曪繝鎮欓懠顒夊晪闂傚倷绀侀幖顐⑽涘Δ鈧灋婵犻潧顑呴拑鐔哥箾閹寸們姘ｉ崼鐔稿弿婵°倐鍋撻柣妤€妫欓幈銊モ槈濮楀棙瀵?/text>
        <path d="${pointPath(impulse)}" fill="none" stroke="${c.gold}" stroke-width="2.4" opacity=".85"/>
        <text x="558" y="48" fill="${c.muted}">Gammatone 闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾剧懓顪冪€ｎ亝鎹ｉ柣顓炴閵嗘帒顫濋敐鍛婵°倗濮烽崑娑⑺囬悽绋挎瀬闁瑰墽绮崑鎰版煠绾板崬澧绘俊鑼厴濮婄粯鎷呴崨濠冨創濠电偛鐪伴崝鎴濈暦閺囥垹绠涢柡澶婄仢閹偤姊洪崫鍕偍闁搞劍妞介幃锟犲即閵忥紕鍘甸梺纭咁潐閸旀洟鎷曟總鍛婄厱闊洦鎸鹃悘杈╃磼鏉堛劌娴鐐差槺閳ь剨缍嗛崰妤咁敁瀹ュ洨纾藉ù锝堟鐢稓绱掔€ｎ偄鐏存い銏＄懆缁犳稑鈽夋潏銊︽珦闂備胶鍘ч～鏇㈠磹濡も偓閳绘棃宕归瑙勬杸闂佺粯鍔栭鏍涙惔銊︾厱閻庯綆鍋勬慨鍫ユ煙娓氬灝濮傞柟顔界矒閹稿﹥寰勭仦钘壭曞┑锛勫亼閸婃牕顔忔繝姘；闁规儳澧庣壕濂告煟濡灝鐨洪弫鍫ユ倵鐟欏嫭绀冩繛鑼枛瀵宕卞Δ濠傛倯闂佸憡渚楅崹鎶藉几閸愵喗鈷掑ù锝呮憸缁夋椽鏌涚€ｎ亷韬€规洑鍗抽獮鎺懳旈埀顒傚婵犳碍鐓欓柛鎾楀懎绗￠梺绋款儜缁绘繂顫忓ú顏嶆晣闁靛ň鏅滈宥嗕繆閵堝棙顥堟慨濠勭帛閹峰懘鎮滃Ο鐑樼暚闁诲孩顔栭崰鏍偉婵傚摜宓侀柛鎰靛枛绾惧ジ鏌ｉ幇顖氱毢闁汇倕娲ら埞鎴︽偐鐠囇冧紣闂佺粯顨嗙划鎾愁嚕椤愶箑骞㈡繛鎴炵懅閸樻捇鎮峰鍕煉鐎规洘绮撻幃銏ゆ偂鎼达絿鏆繝娈垮枟閵囨盯宕戦幘娣簻闁靛骏绱曢幊鍛瑰鍕€愮€殿喕绮欐俊鎼佹晜閼恒儳甯?/text>
      `);
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
        <text x="64" y="48">ERB 闂傚倸鍊搁崐鎼佸磹閹间礁纾瑰瀣捣閻棗銆掑锝呬壕濡ょ姷鍋為悧鐘汇€侀弴姘辩Т闂佹悶鍎洪崜锕傚极閸愵喗鐓ラ柡鍥殔娴滈箖姊哄Ч鍥р偓妤呭磻閹捐埖宕叉繝闈涙川缁♀偓闂佺鏈划宀勩€傚ú顏呪拺闁硅偐鍋涙俊濂告煕婵犲倹鍋ョ€殿喖顭烽幃銏ゆ偂鎼达絿鏆伴梻浣虹帛椤ㄥ懘鎮у鍏炬盯宕熼鐘碉紳婵炶揪绲介幖顐︻敁瀹€鍕厱闁挎繂绻掔粔顔锯偓娈垮枦椤曆囶敇婵傜閱囨い鎰剁秵閳ь剙娲缁樻媴閸涘﹤鏆堥梺瑙勬倐缁犳牕鐣锋导鏉戝唨妞ゆ挾濮寸粊锕傛⒑閸涘﹤濮€闁哄懏绻堥妴鍛存倻閼恒儱鈧敻鏌ㄥ┑鍡樺櫧濞寸姵鐩弻锟犲椽娴ｇ鈷嬪┑顔硷攻濡炶棄螞閸愩劉妲堟慨姗嗗墻閺嗩偅绻濋悽闈涗粶闁活亙鍗冲畷婵嬪箣濠垫劕娈ㄩ梺瑙勫劶婵倝宕戦幇顔瑰亾閻熸澘顥忛柛鐘愁殘閳ь剟娼ч惌鍌氼潖濞差亝顥堟繛鎴炶壘椤ｅ搫鈹戦埥鍡椾簼闁荤啿鏅犲畷鍝勨槈閵忕姷鐤€濡炪倖鎸荤换鍕不濮橆剦娓婚柕鍫濇婵倿鏌涢妸銉хШ鐎殿喖鍟块埢搴ㄥ箛閳衡偓缁ㄨ顪冮妶鍡楀闁搞劏宕电划鑽ょ磼濮楀棙顔旈梺缁樺姈濞兼瑩鎮樼€涙﹩娈介柣鎰级閸犳ɑ銇勯姀锛勬噰闁诡喗鐟╅、妤佹媴閸濆嫮顏归梻鍌氬€搁崐鐑芥嚄閸洖绠犻柟鎹愵嚙鐟欙箓鎮楅敐搴℃灍闁稿鏅滈妵鍕疀閹捐泛顣虹紒鐐劤缂嶅﹪寮婚敓鐘茬倞闁靛鍎虫导鍕倵鐟欏嫭灏紒鑸靛哺瀵顓奸崼顐ｎ€囬梻浣告啞閹搁箖宕版惔顭掔稏闊洦娲滅壕鍏间繆椤栨繂浜归柣锕€鐗撻弻鐔兼嚃閳哄媻澶愭煃瑜滈崜婵堜焊濞嗘挻鍎庨幖娣灮缁♀偓闂佹眹鍨藉褎绂掑鍫熺厽妞ゅ繐鍟畵鍡欌偓瑙勬礃閸旀洟鍩為幋锕€骞㈡繛鍡樺姈椤旀洘淇婇悙顏勨偓鏍偋濠婂牆纾绘繛鎴炴皑娑撳秶绱撴担楠ㄦ粍绂嶅鍫熺厸闁告劑鍔嶉崒銊╂煃瑜滈崗姗€宕戦幘缁樷拺缂佸顑欓崕鎰版煙閻熺増鎼愰柣锝囧厴楠炴帒螖娴ｇ硶鍋撻悜鑺ョ厸閻忕偠顕ч崝姘舵煛娴ｅ摜绉烘慨濠勭帛閹峰懘宕ㄦ繝鍐ㄥ壍婵犵數鍋涢惇浼村礉閹存繄鏆﹂柣妤€鐗婇崕鐔兼煏韫囧鐒烘繛鏉戝濮婃椽妫冨☉姘辩杽闂佺锕ラ悧鐘诲春濞戙垹绠ｉ柨鏃傛櫕閸樼敻姊洪崗鑲┿偞闁哄懏绋掔粋鎺戭煥閸喓鍘遍梺鍝勫€搁幖顐ｇ妤ｅ啯鈷掗柛灞剧懅椤︼箓鏌熺拠褏绡€鐎规洘绻堥弫鍌炴偩瀹€濠冮敜闂備胶绮崝鏇㈡倶閸儱鐭楁繛宸簼閳?/text>
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
      setText("audibleText", audible ? "目标可能可听" : "目标可能被掩蔽");
      setText("distanceText", `相距 ${Math.abs(tf - mf)} Hz`);
      makeSvg(masking, `0 0 ${width} ${height}`, `
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <path d="${pointPath(pts)}" fill="${c.cyan}" opacity=".12" stroke="${c.cyan}" stroke-width="3"/>
        <line x1="${mx}" x2="${mx}" y1="${yMap(ml, 0, 95, height, pad)}" y2="${height - pad}" stroke="${c.gold}" stroke-width="6"/>
        <line x1="${tx}" x2="${tx}" y1="${ty}" y2="${height - pad}" stroke="${audible ? c.cyan : c.red}" stroke-width="5"/>
        <circle cx="${tx}" cy="${ty}" r="8" fill="${audible ? c.cyan : c.red}"/>
        <text x="64" y="48">缂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻锝夊箣閿濆憛鎾绘煕閵堝懎顏柡灞诲€楃划娆戞崉閵娿倗椹抽梻浣告啞閻熴儳鎹㈤幋锕€桅闁告洦鍨扮粻濠氭煕濡ゅ啫浠уù鐘哄亹缁辨帡鎮欓鈧崝銈嗐亜椤撶姴鍘寸€殿喖顭烽幃銏ゆ偂鎼达綆妲堕柣鐔哥矊缁绘帡寮灏栨闁靛骏绱曢崢浠嬫⒑鐟欏嫬鍔ら柣掳鍔庣划鍫⑩偓锝庡枟閻撴盯鎮橀悙鐢点€婇柛瀣崌楠炲洦鎷呴崨濠傗偓顖炴⒒娴ｅ憡鍟為柛鏃€鍨垮畷婵嗙暆閸曘劉鍋撻弽顐熷亾閿濆骸浜炵紒鈾€鍋撻梻浣稿暱閻ㄦ繈宕戦幘缁樼厱闁规澘鍚€缁ㄩ绱掗鐐毈婵﹥妞藉Λ鍐ㄢ槈濞嗘劖鍊烽梺璇插閻噣宕￠崘宸殨妞ゆ劧绠戠粻娑㈡煛婢跺﹦浠㈢紒鎰☉椤啴濡堕崱娆忣潷濠殿喗菧閸旀垵鐣烽姀锛勵浄閻庯綆鍋嗛崢浠嬫煙閸忚偐鏆橀柛濞垮€曢…鍥箛椤撶姷顔曢梺鍛婄懃椤ャ垽顢旈崼姘ｅ亾閺冨牆绀冮柍鍝勫枤濞村嫰鏌ｆ惔顖滅У濞存粎鍋ら幃鎯洪鍛嫼闂傚倸鐗婄粙鎾剁不閻愮儤鐓曢柕濞垮労閻撳ジ鏌熼姘冲闁宠閰ｉ獮妯尖偓鐢殿焾楠炴﹢姊绘担鍝ョШ妞わ綇濡囩划鍫熺瑹閳ь剟骞冨鈧弫鎰板幢閹邦亞鐩庨梻浣瑰閺屻劑鎮樺┑鍡欐殼闁糕剝蓱閸欏繐鈹戦悩鎻掝伀閻㈩垱鐩弻鐔风暋閻楀牆娈楅梺鐟扮－閸嬨倖淇婇悜绛嬫晩缂佹稑顑嗛ˉ澶愭⒒閸屾瑦绁版い鏇嗗應鍋撳☉鎺撴珚鐎规洘鐟ч幉鎾礋椤撗勯敜闂備胶绮崝鏇㈠箹椤愩倗鐭嗛柛鈩冪⊕閻撴瑩鏌ｉ幋鐏活亪鎮樺澶嬬厸閻庯綆浜濋幑锝夋煃瑜滈崜娑㈠极婵犳艾纾诲┑鐘叉搐绾惧鏌熼幆褍顣崇紒鈧繝鍋綊鏁愰崨顔藉枑闂佸搫妫寸粻鎾诲蓟濞戙埄鏁冮柨婵嗘椤︹晠姊烘潪鎵槮婵☆偅绻堝璇差吋閸偅顎囬梻浣告啞閹歌崵绮欓幒鏃傚崥?/text>
        <text x="${tx + 12}" y="${ty - 8}">${audible ? "高于阈值" : "低于阈值"}</text>
      `);
    }

    function drawMp3Flow() {
      if (!mp3Flow) return;
      const c = colors();
      const width = 900, height = 320;
      const boxes = [
        { x: 52, y: 72, w: 150, h: 76, title: "PCM input", detail: "time samples" },
        { x: 260, y: 44, w: 170, h: 76, title: "filterbank", detail: "frequency bands" },
        { x: 260, y: 184, w: 170, h: 76, title: "masking model", detail: "audibility threshold" },
        { x: 500, y: 92, w: 170, h: 88, title: "quantize bits", detail: "keep audible detail" },
        { x: 728, y: 92, w: 130, h: 88, title: "MP3 stream", detail: "compressed audio" },
      ];
      const boxSvg = boxes.map((box, index) => `
        <rect x="${box.x}" y="${box.y}" width="${box.w}" height="${box.h}" rx="16"
          fill="${index === 2 ? c.gold : c.bg}" opacity="${index === 2 ? ".22" : "1"}"
          stroke="${index === 2 ? c.gold : c.line}" />
        <text x="${box.x + 18}" y="${box.y + 32}" font-weight="700">${box.title}</text>
        <text x="${box.x + 18}" y="${box.y + 58}" fill="${c.muted}">${box.detail}</text>
      `).join("");
      const arrow = (x1, y1, x2, y2, color = c.cyan) => `
        <line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" marker-end="url(#arrow)"/>
      `;
      makeSvg(mp3Flow, `0 0 ${width} ${height}`, `
        <defs>
          <marker id="arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto">
            <path d="M0,0 L0,6 L8,3 Z" fill="${c.cyan}"/>
          </marker>
        </defs>
        <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="20" fill="${c.bg}" stroke="${c.line}"/>
        ${boxSvg}
        ${arrow(202, 110, 260, 82)}
        ${arrow(202, 110, 260, 222, c.gold)}
        ${arrow(430, 82, 500, 120)}
        ${arrow(430, 222, 500, 152, c.gold)}
        ${arrow(670, 136, 728, 136)}
        <text x="54" y="286" fill="${c.muted}">缂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磼閻愵剙鍔ゆ繝鈧柆宥呯疅闁归棿鐒﹂崑瀣煕椤愶絿绠橀柣鐔哥叀濮婅櫣绮欏▎鎯у壈濡炪倖鍨靛Λ娑㈠箲閵忕姭鏀介柛銉㈡櫇閻﹀牓姊虹粙鎸庢拱缂侇喖鐭傝矾闁逞屽墴濮婄粯鎷呮笟顖滃姼濡炪倖鍨甸幊妯挎闂佽顔栭崰妤€鐣烽崣澶岀瘈闂傚牊绋掑婵堢磼閳锯偓閸嬫捇姊绘担渚劸闁哄牜鍓涢崚鎺戠暆閸曗斁鍋撻崒姣椽顢旈崨顏呭闂備胶顭堥張顒勬嚌閻愵剛顩查柣鎰劋閻撴洟鏌曟繛鍨姢闁糕晪绲块埀顒侇問閸犳牠鈥﹀畡閭﹀殨闁圭虎鍠楅崑鍕煣韫囨凹鍤冮柛鐔烽叄濮婄粯鎷呯粙娆炬闂佺粯鎸搁悧鎾崇暦娴兼潙绠虫俊銈傚亾缁炬儳顭烽弻鐔兼倷椤掑倻鐛梺鍝勫暙閻楀棗顔忓┑鍥ヤ簻闁哄啫鐗婇敍鐔兼煟閵忋垻甯涚紒缁樼箞閹粙妫冨☉鎺撶€版繝鐢靛仒閸栫娀宕堕懜鍨珗闂備胶纭堕崜婵堢矙閹烘纾婚柛灞剧〒缁犻箖鏌熺€涙鎳冮柣蹇ｄ邯閺岋綁骞樼€涙顦伴梺鍝勭焿缁绘繂鐣烽崼鏇炍ㄩ柕澹倻妫┑鐘垫暩閸嬬偤宕甸鍫濈倞闁靛ě鍐ㄧ闂傚倸顭崑鍕洪敃鈧～蹇旂節濮橆剛鐤囬梺鎼炲労閸撴岸鎮″☉銏″€堕柣鎰仛濞呮洟宕粙娆炬富闁靛洤宕崐鑽ょ玻閺冨牊鐓涢悘鐐插⒔濞插瓨顨ラ悙鎼劷闁逞屽墯缁嬫帡鈥﹂崶褉鏋旈柕鍫濐槹閳锋垿鏌涘☉姗堝伐缂佹宀搁幃浠嬵敍閵堝洨鐦堥梺缁樹緱閸犳牠锝炲鍫濈劦妞ゆ巻鍋撴い鏇秮椤㈡宕熼瀣ㄥ姂閺屻劑寮崹顔剧◤缂備降鍔嶉幐鍐差潖婵犳艾纾兼繛鍡樺灩閻涖垹鈹戦悙鏉垮皟闁告侗鍠栨惔濠囨⒑閸撴彃浜栭柛搴や含婢规洝銇愰幒鎾跺幐闂佹悶鍎弲娑溾叴闂備胶顭堥鍡涘箰閹间緤缍栨繝闈涱儛閺佸棗顭跨捄渚剬闁哄鎳樺缁樻媴閸涘﹥鍎撻梺鍝勭墱閸撴稓鍒掑▎鎾崇闁挎洍鍋撻柣鎾达耿閺岀喐娼忛崜褏鏆犲Δ鐘靛亼閸ㄧ儤绌辨繝鍥ч柛婊冨暞椤ｅジ姊虹拠鈥虫珯缂傚秳绀侀～蹇曠磼濡顎撶紓浣圭☉椤戝懎鈻撻鐘电＝濞达絿鐡旈崵娆愪繆椤愶絿绠撴い鏇秮瀵濡烽敃鈧禍褰掓倵閻熸澘顥忛柛鐘愁殘缁辩偞鎯旈姀銏㈢槇闂佹眹鍨藉褎鐗庨梻浣藉亹閹虫挻鏅堕悾灞藉灊闁割偀鎳囬崑鎾绘晲鎼粹剝鐏嶉梺缁樻尭閸熸潙顕ｉ崼鏇熷€烽柡澶嬪焾閳ь剚绮嶉妵鍕棘濞嗙偓鈻堥梺鍝勬湰缁嬫捇鍩€椤掑﹦绉甸柛瀣噽娴滄悂顢橀姀锛勫帗闁荤喐鐟ョ€氼剟鎮橀埡鍛厓鐟滄粓宕滈妸褏绀婇柛鈩冾焽椤╁弶銇勮箛鎾崇弸婵炴垯鍨洪悡銉╂倵閿濆骸澧版い鏃€娲熷娲传閸曞灚效闂佹悶鍔庨弫濠氱嵁閸愵喖绠ｉ柣鎰暩椤旀洟姊虹粙璺ㄧ闁稿鍔欓獮濠囧炊閳规儳浜鹃悷娆忓缁€鍐煥閺囨ê鐏茬€规洘妞介崺鈧い鎺嶉檷娴滄粓鏌熼崫鍕ｆい锕傤棑缁辨帞鎷犻崣澶樻＆闂佸搫鐭夌紞渚€鐛崶顒夋晢濞达絽寮堕悘鍡涙⒒娴ｄ警鐒惧Δ鐘叉憸閹广垽骞囬婊€绨烽梻鍌欒兌缁垶鏁嬮悗娈垮枛閻栫厧鐣烽鐐村€烽柣銏㈡暩閿涙粓姊虹粙鎸庢拱缂佸鍨甸湁妞ゆ柨顫曟禍婊堟煏韫囥儳纾挎繛鍙夋尦閺岀喖顢欓悾灞惧櫘闂侀€炲苯澧伴柡浣规倐閳ワ箓宕奸姀鈩冩濠德板€曢幊蹇涘煕閹烘垯鈧帒顫濋敐鍛婵犵數鍋橀崠鐘诲吹闊彃濮傞柛鈹惧亾濡炪倖宸婚崑鎾绘煃鐟欏嫬鐏撮柛銊╃畺閹煎綊顢曢姀銏㈠春缂傚倸鍊风欢锟犲窗閺嶎厸鈧箓鎮滈悾灞界ウ閻庡箍鍎遍ˇ浠嬪极婵犲洦鐓曢柟鐐殔缁夎埖鎯旀繝鍥ㄢ拻濞达絽鎲￠幆鍫熴亜閿旇鐏﹂柟顔ㄥ洤绀嬫い鏍ㄦ皑椤︻噣鏌熼懝鐗堝涧缂佸弶瀵х粙澶婎吋婢跺鍘介梺褰掑亰閸犳牠宕濈€ｎ喗鐓熼柟鎯ь嚟閹冲洭鏌＄仦鐔锋閻も偓闂佹寧绻傞幊宥囪姳婵傚憡鐓熼煫鍥ㄦ尵缁犵粯绻涙担鍐叉处缁犳帡姊绘担铏瑰笡闁荤喆鍎甸獮濠囧箛閻楀牆浠奸梺姹囧灩閹诧繝鎮″▎鎰╀簻闁哄啫鍊瑰▍鏇㈡煙閸愬弶澶勯柕鍥у婵偓闁挎稑瀚埛灞筋渻閵堝啫鐏繛鑼枛閵嗕礁螖閸涱厾锛滃┑鐘诧工鐎氼參顢欓幘缁樷拻闁稿本鐟чˇ锕傛煙绾板崬浜扮€殿喚鏁婚、妤呭礋椤掆偓閸擃喖顪冮妶鍡欏⒈闁稿鐩鍛婄瑹閳ь剟寮诲☉妯兼殕闁逞屽墴瀹曟垵鈽夊▎蹇ｅ殼闂佺粯顭囩划顖炴偂閺囥垺鐓涢柛銉ｅ劚婵＄厧霉濠婂棗袚缂佺粯鐩幃鈩冩償閳藉棗濡峰┑鐑囩到濞层倝鏁冮鍫濈畺婵炲棙鎼╅弫鍌炴煕閺囨ê濡煎ù婊冨⒔閹叉瓕绠涢幙鍐ㄦ婵犵數濮村ú锕傚吹瀹ュ鐓忓鑸电洴濡绢噣鏌ｅ┑鍫濆幋闁哄瞼鍠栧畷妤呮嚃閳哄倹顔冮梻浣告啞閺屻劑鎯夐懖鈺佸灊濠电姵鍑归弫宥嗙箾閹寸偟澧х紒銊ヮ煼濮婅櫣鎲撮崟顒傚嚒婵犫拃鍐弰闁诡喚鍋撳蹇涘煛閸愨晪绱℃俊鐐€栭幐鑽ょ矙閹寸偟顩插Δ锝呭暞閳锋帡鏌涚仦鍓ф噯闁稿繐鐬肩槐鎺楊敋閸涱厾浠搁悗瑙勬礃缁诲倽鐏掗梻鍌氬€搁顓㈠礈閵娿儮鏀介柣鎰级椤ョ偤鏌熼崨濠冨€愰柟顔惧仱瀹曞綊顢曢悩杈╃泿闂備胶鎳撻幖顐⑽涘Δ浣侯洸闁诡垎灞惧瘜闂侀潧鐗嗘鎼佺嵁濮椻偓閺屾稖绠涢弬鍡╀邯椤㈡岸鏁愰崱娆戠槇濠殿喗锕╅崢钘夆枍閺嶎厽鈷戦柛娑橈攻绾炬悂鏌涢弬鎸庢拱缂佸倸绉甸妶锝夊礃閳哄啫寮虫繝鐢靛█濞佳兾涘┑瀣垫晛婵°倐鍋撻棁澶嬬節婵犲倸顏柣顓烇躬閺屽秶鎲撮崟顐や紝濡炪們鍨洪悷鈺佺暦濡ゅ懏鍋傞幖娣灮娴滅兘姊婚崒娆戭槮闁圭⒈鍋婇幆澶嬬附缁嬭法鐛ラ梺鍝勭▉閸樺綊鍩€椤戣法顦﹂柍璇查叄楠炲鎮╅悜鈺傛暯闂備浇顕ч崙鐣岀礊閸℃稑纾婚柛鈩冪☉缁狙呮喐閻楀牆绗氶柍閿嬪笒闇夐柨婵嗘川閹藉倿鏌涢妶鍛殻闁哄本鐩幃鈺呮惞椤愩値妲堕梻浣告啞鐢鏁幒妤€鐓濋幖娣妼缁犳稒銇勮箛鎾搭棤闁伙綁绠栧缁樻媴閸濄儳楔濠碘槅鍋夊▔鏇犲垝閸喐濯撮柛娑橈攻濞堜即姊绘担钘夊惞闁哥姵鍔楅崚鎺戠暆閳ь剛鍒掗弮鍥ヤ汗闁圭儤鍤﹂妷鈺傜厱婵炴垶鐟﹂崕妤呮煛娴ｅ憡顥㈤柡灞剧洴瀵挳濡搁妷銉ョ闂備礁缍婇弨鍗烆渻閽樺娼栨繛宸簼閸嬪倿骞栭幖顓炴灍缂傚秵顨婂铏圭矙閸栤剝鏁惧┑鐐插级椤洨鍒掔€ｎ喖绠抽柟鎼幘閸欏棝姊洪崨濠冨濞存粎鍋熺划璇差潩椤掑瀵岄梺闈涚墕濡鎱ㄨ缁辨挸顓奸崨顕呮闂佸磭绮幐鎼佲€﹂妸鈺侀唶闁绘柨鎼獮鎰攽閻愯埖褰х紒韫矙楠炴顭ㄩ崟顒佺彙婵犲痉鏉库偓妤佹叏閻戣棄纾绘繛鎴炩棨濞差亶鏁囨い顐厴閸嬫挻鎷呯化鏇熺€婚梺鍦亾濞兼瑦绂掗鐔剁箚妞ゆ劧瀵岄弳鎺旂磼閳ь剚绗熼埀顒冩＂濠殿喗锕╅崢鍓у姬閳ь剟姊哄Ч鍥х伈婵炰匠鍕浄闁挎洖鍊归悡鏇㈡煏婵炲灝濡奸柣鎾村姉缁辨帞绱掑Ο灏栧缂備胶绮换鍫濈暦閹烘围闁搞儻绲芥禍楣冩煠閸濄儱浠ù婊勭矒閺岋繝宕堕…鎴炵暥婵炲瓨绮撶粻鏍ь潖閾忚鍏滈柛娑卞枤瑜把囨倵閸忓浜鹃梺褰掓？缁€渚€寮伴妷鈺傜叆闁绘柨鎼瓭閻庣懓鎲＄换鍐Φ閸曨垰绫嶉柍褜鍓熷畷鏇㈠箮閻ｅ苯绁﹂梺鍓插亖閸庢煡鍩涢幒鎴欌偓鎺戭潩閿濆懍澹曟繝鐢靛仒閸栫娀宕堕敐鍌氫壕闁挎洖鍊搁柋鍥煏婢跺牆鍔ら柨娑氬枎閳规垿鎮欓崣澶嗘灆婵炲瓨绮嶇划搴㈢珶閺囥垹閿ゆ俊銈勮兌閸樼敻姊虹憴鍕靛晱闁哥姵鐗犻妴鍌涚附閸涘﹦鍘辨繝鐢靛Т鐎氼參寮抽鍕厸閻忕偛澧藉ú鎾煃閵夘垳鐣垫鐐差儏閳规垿宕ㄩ姘瘓闂傚倸鍊烽悞锕傛儑瑜版帒绀夌€广儱顦崹鍌炴煕瑜庨〃鍛存嫅閻旇　鍋撻獮鍨姎闁绘绮岄‖濠囧Ω閳哄倵鎷洪梺鍛婄☉閿曘儳浜搁悽鍛婄厱闁绘ɑ鐓￠崣鍕煃閵夘垳鐣电€规洖鐖奸、鏂款吋閸″繑鐎稿┑鐘垫暩婵兘銆傛禒瀣劦妞ゆ巻鍋撶痪缁㈠弮瀹曟椽鏁愰崱鈺傤啍闂佺粯鍔曢顓熸櫠椤掑嫭鐓欑€瑰嫮澧楅崵鍥殽閻愬澧柟宄版嚇閹倿宕妷銊ョ厴婵犵數濮烽弫鍛婃叏閻戣棄鏋侀柟闂寸绾剧粯绻涢幋鐑嗙劯闁绘柨鎽滅弧鈧梺鍛婂姦娴滆泛煤缁嬪簱鏀介柣妯款嚋瀹搞儵鏌熼搹顐㈠闁诡垰鐭傚畷鍗炩枎鐏炴垝澹曢梺绋跨箰椤︻垱绂嶆ィ鍐┾拺闁告稑锕ユ径鍕煕閹惧娲寸€规洏鍨介獮鏍ㄦ媴閻熸壋鍋撻悽鍛婂仭婵炲棗绻愰顏堟煙椤栨艾顏柡灞剧洴閹晛鐣烽崶褉鎷￠梻渚€鈧偛鑻晶顖炴煕閹存繄绉虹€规洘婢橀埥澶愬閻樻牭绠撻弻鐔煎箥椤旂⒈鏆梺鍝勬噺閻擄繝寮诲☉銏犵労闁告劦浜濋崳顕€姊烘导娆戠暠闁绘鎸搁～蹇撁洪鍜佹濠电偞鍨崹璇茬暦椤忓棛纾介柛灞炬皑瀛濆┑鈽嗗亝椤ㄥ﹪鍨鹃敃鍌氱倞妞ゆ巻鍋撶紒鐘崇⊕閵囧嫰骞樼捄鐩掋儵鏌ｉ敃鈧悧鎾愁潖濞差亝顥堟繛鎴炴皑閻ｆ儳鈹戦埄鍐ㄧ祷閻庢矮鍗抽獮濠囧箻鐠囪尙顔囬柟鍏兼儗閸犳顢欓弮鍫熲拺缂備焦锚婵矂鎮樿箛鏃傛噮缂侇喖顭烽幊锟犲Χ閸屾矮澹曞┑鐐茬墕閻忔繈寮稿☉銏＄厽闁哄稁鍋勭敮鍫曟煟閿濆洤鍘存い銏＄洴閹瑩鎳犻澶嬓為梻鍌欑閻ゅ洤顩奸妸鈺傚€块柨鏃傚亾鐎氭岸鏌ｉ幇顔煎妺闁稿﹤鐏氱换娑㈠醇濠靛牅铏庡┑鐐叉噺閿曘垽寮诲☉銏℃櫜闊洦娲栭崺宀勬⒑娴兼瑧鎮奸柛蹇旓耿閻涱噣骞掑Δ鈧粻锝嗐亜閹捐泛鏋庨柛蹇擄躬濮婄粯鎷呮笟顖滃姼缂備胶绮敮锟犲春濞戙垹閱囨繝銏╀簼閻╊垶骞冨▎鎾村€绘俊顖炴敱鐎氫粙姊绘担渚劸闁哄牜鍓熼幃鐤樄閽樻繈鏌ㄩ弴鐐测偓褰掓偂濞嗘挻鍋ｉ柛銉ユ搐閹虫劙鏁嶉悢鍏尖拺閺夌偞澹嗙拹浼存煕閿濆繒绉柣娑卞櫍楠炴帒螖閳ь剛绮婚悩缁樼叄闊浄绲芥禍鐐烘煃閽樺妯€闁哄苯绉堕幉鎾礋椤愩倓鎮ｉ梻渚€鈧偛鑻晶鍓х磽瀹ュ懏顥炵紒鍌氱Т椤劑宕煎┑鍫幢闁诲骸绠嶉崕閬嵥囨导鏉戠厱闁硅揪闄勯埛鎺楁煕椤愩倕鏋旈柕鍡樺笒椤儻顦虫繛鍙夛耿婵＄敻宕熼娑欐珕闁荤姴娲╃亸娆愮鐎靛摜纾?/text>
      `);
    }

    $all("[data-auditory-control]").forEach((input) => input.addEventListener("input", () => {
      drawAuditoryFilter(); drawLoudness(); drawBand(); drawMasking();
    }));
    $("#playMaskDemo")?.addEventListener("click", () => playToneSet(Number(maskerFreq.value), [0.9, 0, 0, 0], 0.9));
    $("#playTargetDemo")?.addEventListener("click", () => playToneSet(Number(targetFreq.value), [0.6], 0.9));
    drawAuditoryFilter(); drawLoudness(); drawBand(); drawMasking();
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
        ctx.fillText(data.missingOn ? "Missing fundamental: H1 muted, periodic cue remains" : "Fundamental and harmonics shape pitch", 22, 24);
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
        ctx.fillText(data.missingOn ? "Missing fundamental: H1 muted, periodic cue remains" : "Fundamental and harmonics shape pitch", 22, 24);
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
      setText("azimuthText", `${az} deg`);
      setText("cueFreqText", `${freq} Hz`);
      setText("itdReadout", `${itd.toFixed(2)} ms`);
      setText("ildReadout", `${ild.toFixed(1)} dB`);
      setText("dominantCue", freq < 1500 ? "ITD dominant at low frequency" : "ILD dominant at high frequency");
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
        <text x="52" y="58">ITD/ILD 闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌熼梻瀵割槮缁炬儳缍婇弻鐔兼⒒鐎靛壊妲紒鐐劤缂嶅﹪寮婚悢鍏尖拻閻庨潧澹婂Σ顔剧磽娴ｅ搫啸濠电偐鍋撳Δ鐘靛仦閻楁顭囪箛娑樼鐟滃繗鎽梺璇叉唉椤煤濮椻偓閹繝鏁撻悩鑼舵憰闂佺粯鏌ㄩ幉锛勭礊閸ヮ剚鐓曢柟鐐殔閹冲繐鈻撻幖浣光拻濞达綀濮らˉ澶愭煕閻旇泛宓嗙€规洑鍗冲浠嬵敇閻愯埖鎲伴梻浣瑰缁诲倿藝椤栨娑橆潨閳ь剟寮婚悢铏圭煓闁秆勵殢閳ь剚顨婇弻锟犲幢濡ゅ啫顤€缂備胶绮换鍌炲煝閹捐鍨傛い鏂垮綖閸濇淇婇悙顏勨偓鏍洪敃鍌氱煑闁告劦鍠栭弰銉╂煃瑜滈崜姘跺Φ閸曨垰绠抽柛鈩冦仦婢规洜绱撻崒娆掑厡濠殿喖顕划鏃堟偡閹殿喗娈鹃梺鍝勬储閸ㄦ椽鎮為懖鈹惧亾楠炲灝鍔氶柟铏姍閹潡宕堕渚囨濡炪倖鍔戦崹鐑樺緞閸曨剛绠鹃柟缁樺笧鏁堥悗瑙勬礃閸ㄥ潡鐛鈧獮鍥ㄦ媴閻熸澘鍘炲┑锛勫亼閸婃牠骞愭ィ鍐ㄧ；闁绘棁娅ｉ惌鍫ユ煟閹达絽袚闁绘搫缍侀弻銈嗘叏閹邦兘鍋撻弴鐔侯浄闂侇剙绉甸悡娑氣偓鍏夊亾閻庯綆鍓欓崺宀勬煣缂佹澧甸柡灞界Х椤т線鏌涢幘璺烘灈妤犵偛鍟抽ˇ鍦偓瑙勬礀瀹曨剟鍩ユ径濞炬瀻闊洤锕ゆ禍楣冩煕椤愶絾绀冮柣鎾冲暣閺屾稑鈹戦崱妤婁患闂佸搫妫楅敃顏堝蓟濞戞埃鍋撻敐搴′簼鐎规洖鐬奸埀顒冾潐濞叉粓宕楀鈧妴浣肝熷▎鐐梻浣告啞濮婂綊骞冮崒姘兼綎婵炲樊浜濋ˉ鍫熺箾閹寸偠澹橀柍顏勫船椤啴濡舵惔鈥崇闂佺粯顨嗛幑鍥Υ娴ｅ壊娼╅柤绋跨仛濞呮粍绻濋姀锝嗙【鐠嬧晠鏌嶉崫鍕櫤闁绘挸鍟撮弻娑樷攽閸℃浠奸梺閫炲苯澧柟璇х磿缁骞掑Δ濠冩櫍闂侀潧绻嗗褔骞忓ú顏呪拺闁告稑锕︾粻鎾绘倵濮橆剙妲婚崡閬嶆煕韫囨艾浜圭紒鐘冲劤椤法鎹勬笟顖氬壉缂備讲鍋撻柛顐犲灮绾?/text>
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
      setText("hrtfAzText", `${az} deg`);
      setText("hrtfElevText", `${ev} deg`);
      setText("listenerText", `listener ${String.fromCharCode(65 + li)}`);
      setText("notchReadout", `${(notch / 1000).toFixed(1)} kHz`);
      setText("externalReadout", li === 0 ? "centered image" : "externalized lateral image");
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
        <text x="58" y="50">HRTF 闂傚倸鍊搁崐鎼佸磹閹间礁纾圭€瑰嫭鍣磋ぐ鎺戠倞鐟滃繘寮抽敃鍌涚厱妞ゎ厽鍨垫禍婵嬫煕濞嗗繒绠婚柡宀€鍠撶槐鎺楀閻樺磭褰梻浣芥〃缁€浣衡偓姘嵆瀵鈽夐姀鈺傛櫇闂侀潧鐗嗛幊蹇涙倶娴ｅ壊娓婚柕鍫濆€瑰▍鍛偓娈垮枛閻栧吋淇婇悽绋跨妞ゆ牗姘ㄩ濠囨⒑閻熸壆鎽犵紒璇茬У缁傛帗绺介崨濞炬嫼闂佸憡绋戦敃銊︾珶濡偐纾界€广儱鎷戦煬顒勬煟濞戝崬娅嶇€殿喕绮欐俊鎼佹晜閸擃灝銈夋⒒娴ｅ憡鍟為柟绋挎瀹曘儵鏌ㄧ€ｎ亞浠村銈庝簻閸熷瓨淇婇懜鍨劅闁炽儴灏欓崙瑙勭節閻㈤潧浠滅€殿喖鐖奸弫鍐閳ヨ尙绠氶梺姹囧灮椤牏绮堢€ｎ偁浜滈柡宥囨暩缁嬪鏌￠崨顔剧畵妞ゎ亜鍟存俊鍫曞幢濡も偓椤洭姊洪幖鐐插婵＄偘绮欓獮鍐潨閳ь剟鐛鈧畷婊勬媴閻氬闂繝鐢靛仩閹活亞寰婇崸妤€绠犻柟鎯х摠閸欏繘鏌涢銈呮瀭濞存粍绮撻弻鏇熺箾閸喖濮烽梻濠庡墻閸撴盯鍩€椤掍緡鍟忛柛鐘崇墵閳ワ箓鎮滈挊澶嬬€梺鐟板⒔缁垶宕戦幇鐗堢厾缁炬澘宕晶鍓х磼閸楃偛绾х紒缁樼箞閹粙妫冨ù韬插灲閺屻劑寮村Ο琛″亾濡ゅ懎鐒垫い鎺嶇閸ゎ剟鏌涢幘瀵告噰闁糕斂鍨介獮妯虹暦閸ャ劍鐣烽梻浣告啞濞诧箓宕楀鈧獮蹇撁洪鍛幗闂佺粯锚瀵墎绮堝畝鍕厓鐟滄粓宕滃┑鍡忔瀺闁哄洢鍨洪崐鍓佲偓骞垮劚濞层劎澹曢挊澶堚偓鎺戭潩椤掍焦鎮欓梺鍝勵儑閸犳牠寮婚悢鐓庝紶闁靛／鍐偧缂傚倷绀侀惌浣广仈閸濄儲宕叉繝闈涱儏缁€瀣煏婵炲灝鍔欏瑙勬礀閳规垿鎮欓弶鎴犱桓濡炪倕绻嬮崡鎶界嵁鐎ｎ喗鍊烽柟缁樺笧娴滄牠姊绘担鍛婅础闁惧繐閰ｅ畷鏉课旈崨顔间簵闂佺粯鏌ㄩ崥瀣偂韫囨稒鐓曟い鎰剁悼缁犵偞銇勬惔銏╂疁闁哄矉缍€缁犳盯濡疯钃卞┑鐑囩到濞层倝鏁冮鍫涒偓浣糕槈濮楀棙鍍甸梺鍛婎殘閸嬫劙宕ｅú顏呪拻濞达絽鎲￠幆鍫ユ煟椤撶儐妲虹紒杈╁仦缁楃喖鍩€椤掑嫮宓侀柛鎰靛枛椤懘鏌曢崼婵囧櫢缂佸崬鐖煎娲濞戣鲸顎嗙紓浣哄У閸ㄧ敻鍩㈠鍛傛棃宕ㄩ瑙勫婵犳鍠氶幊鎾趁洪妶澶嬪€挎繛宸簼閻撴洟鏌曟繛鍨闁告凹鍋婇弻鈩冪瑹閸パ勭彎闂佽桨鐒﹂幑鍥箖閳哄懏顥堟繛鎴炲搸閸嬪﹪姊婚崒姘肩叕闁稿瀚叅闁挎柨澧介惌娆撴煙閻戞﹩娈旂痪鎯ь煼閹鏁愭惔鈩冪亶闂佺粯鎸诲ú姗€濡甸崟顖氱疀妞ゆ柨鍚嬮悗楣冩⒑闂堚晝瀵奸柛妤佸▕瀵鏁嶉崟銊ヤ壕闁挎繂楠告禍鐐差熆瑜滄禍婵嬪Φ閸曨垼鏁傞柛鏇ㄥ亝濞堢粯绻濈喊妯峰亾瀹曞洤鐓熼悗瑙勬磸閸旀垿銆佸☉姗嗙叆閹肩补鍓濋弳顏堟⒒閸屾艾鈧绮堟笟鈧獮妤€顭ㄩ崼婵堢崶闂佸綊鍋婇崢楣冩偟閸洘鐓曢柍鈺佸暟閹冲啴鏌涢妸锔剧疄闁哄矉绻濆畷姗€濡歌椤も偓闂備焦鎮堕崐鏇㈠疮閹绢喖钃熺€广儱娲﹂崰鍡涙煕閺囥劌浜滃┑顔哄灪缁绘稓鈧稒顭囬惌鎺旂磼閻樺磭澧电€殿喖顭烽弫鎰緞鐎ｎ亙绨婚梻浣告啞缁嬫垿鏁冮敃鍌氱闁炽儲鍓氬〒濠氭煏閸繂鏆欓柛鏃€姘ㄧ槐鎺旂磼濮楀牐鈧法鈧鍠涢褔鍩ユ径鎰潊闁炽儱鍘栧Ч妤呮煟鎼淬値娼愭繛鍙夌墪鐓ら柕鍫濐槸閻撴洟鏌涢锝囧闁衡偓娴犲鐓冮柕澶堝劚閺嗚京绱掗悪娆忔处閻撴洟鏌￠崘锝呬壕闂佽崵鍟块弲鐘诲箖娴兼惌鏁婇柛銏狀槺閸犳牕鐣峰Δ鍛亗閹艰揪绲介柊閬嶆⒒閸屾瑦绁伴柛瀣姍閸╂盯宕奸妷銉ь槶濠电偛妫欓幐鍝ョ不濞差亝鍊甸柨婵嗛閺嬬喖鏌嶉柨瀣瑨闂囧鏌ㄥ┑鍡欏妞ゃ儱顦甸弻娑橆潩椤掑倻楔闂佸搫鏈惄顖炲箖閳哄懎绀冮柟缁樺俯濞兼挻淇婇悙顏勨偓銈夊储婵傚憡鍊舵繝闈涳功娴滀粙姊绘担绋挎倯缂佷焦鎸冲鎻掆攽鐎ｅ骸娲、娑樷槈濮橀硸鍟庨梻浣告贡閸嬫挸顭囧▎鎾村€跨憸鐗堝笚閻撴洟鎮楅敐搴′簼鐎规洖鐭傞弻鈥崇暆鐎ｎ剛锛熸繛瀵稿缁犳挸鐣峰鍡╂Ъ闂佸憡甯楃粙鎴ｇ亙闂佺粯锕㈠褎绂掑鍕╀簻闁瑰瓨绻冮崵鍥煕閳哄啫浠辨鐐差儔閺佸啴鍩€椤掑嫭鐓侀柛銉墯閻撳啴鏌熼姘盎濡ょ姴绻橀弻娑㈠棘鐠恒劎鍔梺绯曟櫇閸嬨倝鐛€ｎ喗鏅滈柦妯侯槴閸嬫捇鎮滈懞銉у幈濠电偛妫楀ù姘ｉ崨濠勭闁告侗鍠氱粻鐐存叏婵犲啯銇濈€规洏鍔嶇换婵嬪礃閵娾晝鈧櫣绱撻崒娆愮グ妞ゆ泦鍥ㄥ亱闁瑰墽绮崑妯汇亜閺冨洦纭堕柣銈傚亾婵犵數鍋為崹鍫曟晪缂備焦鍔栫粙鎴︹€旈崘顔嘉ч柛鈩兠惁鐑芥⒑閸涘﹤濮€闁哄懏鐩崺鈧い鎺戭槸閻忥附鎱ㄦ繝鍕笡闁瑰嘲鎳愰幉鎾礋椤愨€虫憢闂傚倷鑳堕…鍫⑩偓鍨浮瀹曟娊鏁愰崪浣告闂佸湱绮敮鈺呮偂閵夆晜鐓曟い鎰╁€曢弸搴ㄦ煃?/text>
        <text x="650" y="72" fill="${c.cyan}">left</text>
        <text x="650" y="96" fill="${c.gold}">right</text>
      `);
    }

    function drawIacc() {
      const canvas = $("#iaccCanvas");
      if (!canvas || !iacc) return;
      const value = Number(iacc.value);
      setText("iaccText", value.toFixed(2));
      setText("widthReadout", value > 0.78 ? "narrow image" : value > 0.42 ? "medium width" : "wide diffuse image");
      setText("envelopmentReadout", value < 0.5 ? "strong envelopment" : "weak envelopment");
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
      const state = d < 5 ? "fusion region" : d < 35 ? "precedence region" : "echo region";
      setText("echoDelayText", `${d} ms`);
      setText("fusionReadout", state);
      const x2 = 150 + d * 7;
      makeSvg(el, "0 0 860 260", `
        <rect x="20" y="20" width="820" height="210" rx="18" fill="${c.bg}" stroke="${c.line}"/>
        <line x1="90" y1="150" x2="770" y2="150" stroke="${c.line}" stroke-width="2"/>
        <line x1="150" y1="80" x2="150" y2="190" stroke="${c.cyan}" stroke-width="8"/>
        <line x1="${x2}" y1="102" x2="${x2}" y2="190" stroke="${c.gold}" stroke-width="8"/>
        <text x="132" y="64">闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌ｉ幋锝呅撻柛銈呭閺屾盯顢曢敐鍡欘槬缂佺偓鍎冲锟犲蓟閿濆顫呴柕蹇婃櫇閸旀悂姊哄Ч鍥р偓妤呭磻閹捐埖宕叉繝闈涱儐椤ュ牊绻涢幋鐐殿暡闁革絻鍎茬换婵嬪閿濆懐鍘梺鍛婃⒐濞叉粎鍒掔拠娴嬫闁靛骏绱曢崢鍛婄節閵忥絾纭鹃悗娑掓櫇濞戠敻鎳滈悙閫涚盎闂佸搫鍊介崕鑽も偓姘卞閵囧嫰顢旈崟顐ｆ婵犵鈧磭鍩ｇ€规洏鍔戦、娑橆煥鎼粹剝鏆梻鍌氬€烽懗鍫曘€佹繝鍌楁瀺闁哄洢鍨圭粈澶嬬箾閸℃ɑ灏紒?/text>
        <text x="${x2 - 28}" y="88">闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾剧懓顪冪€ｎ亝鎹ｉ柣顓炴閵嗘帒顫濋敐鍛婵°倗濮烽崑娑⑺囬悽绋挎瀬闁瑰墽绮崑鎰版煕閹邦垰绱﹂柣銏狀煼濮婄粯绗熼埀顒€顭囪閺佸秷绠涘☉妯虹獩濡炪倖鐗楃划宀€鏁鍕拻闁稿本鐟чˇ锔界節閳ь剟鏌嗗鍡樺劒闁瑰吋鐣崝宀€绮ｅΔ浣风箚闁靛牆鎳忛崳鍦棯?/text>
        <text x="90" y="218">${state}</text>
      `);
    }

    function drawAsa() {
      const el = $("#asaDiagram");
      if (!el) return;
      const c = colors();
      const active = asaControls.filter((input) => input.checked).length;
      const count = active >= 3 ? 1 : active >= 1 ? 2 : 4;
      setText("asaCount", `${count} cues selected`);
      setText("asaConfidence", active >= 3 ? "high organization confidence" : active >= 1 ? "partial organization confidence" : "low organization confidence");
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
        <text x="58" y="54">闂傚倸鍊搁崐鎼佸磹閹间礁纾归柟闂寸绾惧綊鏌ｉ幋锝呅撻柛銈呭閺屾盯顢曢敐鍡欙紩闂侀€炲苯澧剧紒鐘虫尭閻ｉ攱绺界粙娆炬綂闂佺偨鍎遍崯璺ㄨ姳閵夆晜鈷掑ù锝呮憸缁夋椽鏌涚€ｎ亷韬€规洘绮岄埥澶愬閻樺疇绶㈤梻浣瑰閺屻劑锝為弴鐔侯洸婵犲﹤鐗婇悡娆撴煟閹寸伝顏堟倶閵夛负浜滈煫鍥э攻濞呭洨绱掓潏銊ユ诞闁诡喒鏅涢悾鐑藉炊瑜夐幏浼存⒒娴ｅ憡鎯堥柣顒€銈稿畷浼村冀椤撶姴绁﹂梺纭呮彧缁犳垹绮诲☉娆嶄簻闁圭儤鍨甸埀顒€鎽滈弫顕€宕稿Δ浣叉嫼闁荤姴娲╃亸娆戠不閹殿喚纾肩紓浣姑慨宥夋煛鐏炴枻韬柡浣瑰姈瀵板嫭绻濋崨顔藉暫闂傚倷鐒︾€笛呮崲閸岀倛鍥敍濠婂懍绗夐梺鎸庣箓椤︿即鎮￠悢闀愮箚妞ゆ牗绋戦婊堟煟濠垫劒閭柡宀嬬到閳规垿骞囬鍫濅粣婵犳鍠栭敃銉ヮ渻閽樺鏆﹂柕濠忓缁♀偓闂佸憡娲﹂崜娆忊枍濮樿京纾介柛灞剧懆閸忓苯鈹戦鐐毈闁诡啫鍥ㄥ亹鐎瑰壊鍠栧▓銊︾節閻㈤潧校闁煎綊绠栧畷锟犲箮閼恒儳鍘棅顐㈡处濞叉牕鐡梻浣稿悑濠㈡ê顭囬垾鎰佹綎婵炲樊浜滄导鐘绘煕閺囥劌澧版い锕備憾濮婃椽鏌呴悙鑼跺濠⒀屽櫍閺屾盯鎮㈢紒妯笺€婇梺杞扮贰閸ｏ綁銆佸☉銏″€风紒顔款潐鐎氳棄鈹戦悙鑸靛涧缂佽弓绮欓獮妤€顭ㄩ崼婵嗗殤闂佸憡鍔忛弬鍌涚濠婂嫨浜滈柟鎵虫櫅閻掔儤淇婇妤€浜鹃梻鍌欐祰椤曟牠宕锕€鐐婇柕濞垮劙濮规鏌ｆ惔锝嗗殌濠㈢懓锕畷鏉课旈崘顏嗩槸闁瑰吋鐣崝宥夊煕閹达附鐓熼柟鎯у暱閻︺劍绻涢懖鈺佹灈闁哄本绋掔换婵嬪礃閻愵剛鏆紓鍌欑贰閸犳牠鎮ч幘宕囨殾闁绘梻鈷堥弫宥嗙箾閹寸偠澹樻鐐搭殕缁绘繄鍠婂Ο娲绘綉闂佹悶鍔屽畷顒勨€旈崘顔奸敜婵°倐鍋撻柣銈庡櫍閻擃偊宕堕妸锕€顎涢悷婊呭鐢宕戦崒鐐茬婵烇綆鍓欓悘鈺呮煛鐎ｎ剙孝闁宠鍨块、娆戞兜瀹勬澘顫犻梻浣侯焾缁ㄦ椽宕愬Δ鍐＝闁规儳顕々鐑芥倵閿濆簼绨荤紒鎰⊕缁绘繈鎮介棃娴躲垽鏌涢悤浣哥仩闁崇粯鎹囬獮鏍ㄦ媴閸忓瀚藉┑鐐舵彧缂嶄線藟閹惧鈻旈柤纰卞墰绾剧晫鈧箍鍎遍幊蹇浰夐悙鐢电＜闁稿本姘ㄦ晥濡炪們鍨哄Λ鍐ㄧ暦閻撳簶鏀介柛銉ｅ壉濮樿埖鈷掑〒姘ｅ亾闁逞屽墰閸嬫盯鎳熼娑欐珷妞ゆ牜鍋為悡蹇涙煕閵夋垵鍠氭导鍐ㄎ旈悩闈涗粶妞ゆ垵顦靛顐﹀箛閺夊灝鑰垮┑鐐叉缁夘噣宕戦幘瀵哥瘈闁告洦鍘鹃敍婵囩箾鏉堝墽鎮奸柟铏尰閹便劑宕奸悢鍓佺畾濡炪倖鍔戦崹褰掑汲閿濆洠鍋撳▓鍨灈妞ゎ厾鍏樺顐﹀箛椤撶偟绐炴繝鐢靛Т鐎氱兘宕€ｎ喗鐓熼幖娣€ゅ鎰箾閸欏澧悡銈夋煏閸繍妲归柛瀣€块弻锝夊棘閸喗鍊梺鎶芥敱閸ㄥ綊鎯€椤忓牜鏁囬柣鎰綑濞呫倝姊虹紒妯肩濞存粎鍋熷Σ鎰板箳閺冣偓鐎氭岸鏌ょ喊鍗炲闁愁亪娼ц灃闁绘﹢娼ф禒婊堟煥閺囥劋閭鐐插暣閸┾剝瀵兼潏顐ｎ仩缂佽鲸甯掕灒缂備焦顭囪ぐ宥呪攽閻樺灚鏆╅柛瀣█楠炴捇顢旈崱妤冪瓘闂佺粯鍔﹂崜娑€呴幓鎹楀綊鎮╁顔煎壈缂佹儳澧界划顖滄崲濞戙垹绠ｉ柣鎰暞瀹€绋款嚕閵婏妇顩烽悗锝庡亞閸樹粙姊鸿ぐ鎺戜喊闁告瑥閰ｅ畷顖濈疀閺傚墽绠氬銈嗗姂閸ㄤ粙宕ｉ崟顖涚厸閻忕偛澧介妴鎺楁煃瑜滈崜銊х礊閸℃稑纾婚柛鏇ㄥ墯閸欏繒鈧箍鍎卞Λ搴㈢濠婂牊鐓忛煫鍥ュ劤绾惧灝顭胯閺佹悂鍩€椤掍緡鍟忛柛鐘愁殜楠炴劙鎼归锝呭伎闂侀€炲苯澧撮柡宀嬬到椤粓鍩€椤掆偓椤洩顦抽柟渚垮姂閺佸倿骞嬮幒鏃傜暰闂備胶绮崝锔界濠婂牆鐒垫い鎺嶈兌婢х數鈧娲栫紞濠囧箖閳╁啯鍎熸俊顖濆吹娴滄瑩姊绘担鍛婃儓婵炶尙濞€楠炲﹪鎮欓崫鍕€炲銈嗗笂閻掞箑鈻嶉崶顒佲拺缂佸瀵у﹢鎵磼鐎ｎ偅宕岀€规洏鍨藉畷锟犳倷閳哄倹鏉搁梻浣虹帛閸旀洖顕ｉ崼鏇€澶愭倷閻戞鍘介梺缁樻⒐缁诲倿骞婃惔銏″弿妞ゆ帒瀚悡鍐喐濠婂牆绀堥柣鏃傚帶缁犳牗淇婇妶鍛殲闁哥姴妫濋弻娑㈠即閵娿儱顫梺鎸庣⊕閿曘垹顫忛搹鍦煓闁圭楠搁弨顓炩攽閻愬弶鍣烘繛鍙夌矌閸掓帞鈧綆鍠栫粻铏繆閵堝嫮鍔嶆繛鍛喘濮婅櫣绮欓幐搴㈡嫳缂備礁顑嗛崹鍧楀箚閸岀偛绀嬫い鎺戝€婚惁鍫ユ⒑闂堟盯鐛滅紒鎻掑⒔濞戝灚銈ｉ崘鈺冨幗濡炪倖甯掗崯顐λ夊澶嬬厓妞ゅ繐妫欓弳顒佹叏婵犲偆鐓肩€规洘甯掗～婵嬵敄閽樺澹曟俊鐐差儏濞寸兘鎯岄崱妞尖偓鎺戭潩閿濆懍澹曟俊銈囧Х閸嬫盯藝閻㈢鏋侀柟鍓х帛閸嬫劙鏌涢幇顖氱处缂傚啯娲樼换婵嗩嚗闁垮绶查柍褜鍓氬ú鐔肩嵁婵犲懐鐤€婵炴垶顭囬敍娑㈡煟鎼搭垳绉甸柛鐘愁殜閹繝鎮㈤崗鑲╁幍闂備緡鍙忕粻鎴﹀几閻斿吋鐓涢柛鈥崇箲濞呭﹪鏌″畝瀣М妞ゃ垺锕㈤幃銏㈢矙鐠侯煉绱﹂梻鍌欑閹碱偊鎯屾径宀€绀婂〒姘ｅ亾闁绘侗鍠氶埀顒婄秵閸犳宕愰懜鐢电闁煎ジ顤傞崬铏圭磼閵娿劌袚缂佺粯鐩畷閬嶅箛椤掑倷绱欓梻浣筋嚃閸犳鎮疯閸┾偓妞ゆ帊鑳堕埊鏇㈡煥濮樻墎鍋撳▓鍨灈闁诲繑绻堥崺鐐哄箣閿曗偓閻擄繝鏌涢埄鍐炬畼濞寸姭鏅犲娲捶椤撴稒瀚涢梺绋款儏閿曨亜鐣烽崫鍕ㄦ闁靛繒濮烽惈鍕⒑缁嬫寧婀扮紒顔奸叄閺佸秴顭ㄩ崼鐔叉嫼闂備緡鍋嗛崑娑㈡嚐椤栨稒娅犳い鏍ㄥ閸嬫捇宕归锝囧嚒闁诲孩鐭崡鎶芥偘椤曗偓瀹曞爼顢楁径瀣珝闂備胶绮崝妤佹櫠濡ゅ拑缍栭柡鍥ュ灪閳锋帡鏌涚仦鍓ф噮妞わ讣闄勭换婵嬪焵椤掑嫭鐒肩€广儱鎳愰敍鐔兼⒑闂堟稓澧曟い锔诲灦瀵即濡烽妷銏℃杸闂佺粯蓱瑜板啯绂嶉悙鐑樼厱闁绘棃鏀遍崵鍥煛鐏炵偓绀冪€垫澘瀚埥澶婎煥閸滀焦效婵犵數鍋涢悺銊у垝瀹ュ洤鍨濋柟鎹愵嚙閽冪喖鏌ㄩ悢鍝勑㈢紒鈧崘顔界叆婵犻潧妫欓崳绋款熆鐟欏嫭绀嬫慨濠勭帛閹峰懘宕ㄦ繝鍌涙畼婵犳鍠栭敃銈囩礊婵犲洤绠栭柣鎴ｆ鍞梺鍐叉惈閿曘儵寮查鍫熲拺闁圭娴风粻鎾翠繆椤愶綆娈滄い銏″哺閺屽棗顓奸崱娆忓箰濠电姰鍨煎▔娑㈩敄閸涘瓨鍊堕柍鍝勫€舵禍婊堟煛閸愶絽浜鹃柣銏╁灲缁绘繂顕ｆ繝姘櫜闁糕剝锚閸斿懘姊洪弬銉︽珔闁哥喎纾☉鐢稿焵椤掆偓閳规垿鎮╅幇浣告櫛闂佸摜濮甸〃濠囩嵁閹版澘绠柦妯侯槺閻ｆ椽姊虹捄銊ユ灁濠殿喖顕竟鏇熺附閸涘﹦鍘介梺褰掑亰閸犳稖妫㈤梻浣哥秺閺€鍗烆渻閽樺娼栨繛宸簼閸ゆ帡鏌曢崼婵囧櫤闁诲海鍋撶换婵嬪閵忊€虫畬濠碘槅鍋呯换鍫ユ偘椤斿槈鏃堝川椤旈棿姹楃紓鍌氬€烽悞锕傗€﹂崶顒€鍌ㄩ梺顒€绉甸埛鎴︽煕濠靛棗顏╅柡鍡楋躬閺屾稓鈧綆鍋呭畷宀勬煙椤旇崵鐭欐い銏＄☉椤劑宕樿閸╂盯姊绘担鍛婂暈閻㈩垱顨堥弫顕€鏁撻悩鍙夋К闂佽法鍠撴慨瀵哥矆閸愵喗鐓ユ繝闈涙閸ｇ顭跨憴鍕闁宠鍨块幃娆撳级閹寸姳妗撻梻浣藉吹閸ｃ儵宕归崼鏇炵畺闁绘劕顕々鐑芥倵閿濆骸浜為柛妯绘尵缁辨捇宕掑▎鎴濆闁藉啴浜堕弻宥夋煥鐎ｎ亜顫掗梺鍝勬湰濞茬喎鐣烽幆閭︽Щ濡炪倕娴氶崜娑氭閹烘鍋愮€规洖娲﹂崚娑樜旈悩闈涗沪闁挎洏鍨介悰顕€宕堕妸锕€顎撴俊鐐差儏濞寸兘藝椤曗偓濮婂宕掑顑藉亾閻戣姤鍊块柨鏇炲€哥粻鏍煕椤愶絾绀€缁炬崘顫夋穱濠囧Χ閸曨喖鍘＄紓浣哄█缁犳牠寮诲鍫闂佸憡鎸鹃崰鏍ь嚕?/text>
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
    const melBands = $("#melBands");
    const canvas = $("#featureCanvas");
    function drawFeature() {
      if (!canvas || !melBands) return;
      const mel = Number(melBands.value);
      setText("melBandsText", mel);
      setText("timeRes", "2D time-frequency texture");
      setText("freqRes", `${mel} Mel bands`);
      setText("taskHint", mel >= 80 ? "fine-grained texture" : "classification/detection baseline");
      drawCanvas(canvas, (ctx, width, height, c) => {
        ctx.fillStyle = c.ink;
        ctx.fillText("Mel bands, log compression, task cues", 20, 26);
        const left = 42, top = 52;
        const plotW = width - 84, plotH = height - 94;
        ctx.strokeStyle = c.line;
        ctx.strokeRect(left, top, plotW, plotH);
        const cols = 28;
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
        ctx.fillStyle = c.muted;
        ctx.fillText(`${mel} Mel bands / Log-Mel time-frequency representation`, left, height - 24);
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
