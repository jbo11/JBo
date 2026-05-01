/* PROAMP — vanilla JS + Web Audio API */
(function () {
  "use strict";

  /* ── Playlist ────────────────────────────────────── */
  var tracks = [
    { title: "PROAMP - WELCOME TONE",       dur: 27,  bpm: 90,  scale: [261,294,330,349,392,440,494,523] },
    { title: "PROAMP - TRACK 07",           dur: 190, bpm: 128, scale: [220,247,277,294,330,370,415,440] },
    { title: "PROAMP EDITOR - PROAMP TEST", dur: 12,  bpm: 140, scale: [330,370,415,440,494,554,622,659] },
    { title: "PROAMP",                      dur: 27,  bpm: 100, scale: [196,220,247,262,294,330,370,392] },
    { title: "PROAMP - DEMO LOOP",          dur: 108, bpm: 110, scale: [261,311,349,392,466,523,587,622] },
    { title: "PROAMP - SKIN TEST",          dur: 42,  bpm: 95,  scale: [247,277,330,370,415,494,554,587] },
    { title: "PROAMP - EJECT FX",           dur: 8,   bpm: 160, scale: [440,523,587,659,698,784,880,988] },
  ];

  var currentTrack = 1;
  var selectedTrack = 1;
  var state = "playing";
  var seconds = 24; // start at 0:24 like reference
  var shuffle = false;
  var repeat = false;
  var eqOn = true;

  /* ── Audio Engine (Web Audio API) ──────────────────
     Generates synthesized chiptune-style music
  ─────────────────────────────────────────────────── */
  var audioCtx = null;
  var masterGain = null;
  var scheduleHandle = null;
  var nextNoteTime = 0;
  var beatStep = 0;
  var currentScale = tracks[currentTrack].scale;
  var currentBpm = tracks[currentTrack].bpm;

  function getAudioCtx() {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = audioCtx.createGain();
      masterGain.gain.value = 0.18;
      masterGain.connect(audioCtx.destination);
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  /* Play one synth note */
  function playNote(freq, startTime, duration, type, gainVal) {
    var ctx = audioCtx;
    var osc = ctx.createOscillator();
    var env = ctx.createGain();
    osc.connect(env);
    env.connect(masterGain);

    osc.type = type || "square";
    osc.frequency.setValueAtTime(freq, startTime);

    var g = gainVal || 0.5;
    env.gain.setValueAtTime(0, startTime);
    env.gain.linearRampToValueAtTime(g, startTime + 0.01);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  /* Drum-style beat */
  function playBeat(startTime, type) {
    var ctx = audioCtx;
    var osc = ctx.createOscillator();
    var env = ctx.createGain();
    var bpf = ctx.createBiquadFilter();
    bpf.type = "bandpass";
    osc.connect(bpf);
    bpf.connect(env);
    env.connect(masterGain);

    if (type === "kick") {
      osc.frequency.setValueAtTime(150, startTime);
      osc.frequency.exponentialRampToValueAtTime(0.01, startTime + 0.15);
      osc.type = "sine";
      bpf.frequency.value = 200;
      env.gain.setValueAtTime(0.8, startTime);
      env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.2);
    } else if (type === "snare") {
      osc.frequency.setValueAtTime(180, startTime);
      osc.type = "sawtooth";
      bpf.frequency.value = 1500;
      bpf.Q.value = 0.5;
      env.gain.setValueAtTime(0.4, startTime);
      env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.12);
    } else { /* hihat */
      osc.frequency.setValueAtTime(8000, startTime);
      osc.type = "square";
      bpf.frequency.value = 7000; bpf.Q.value = 0.5;
      env.gain.setValueAtTime(0.15, startTime);
      env.gain.exponentialRampToValueAtTime(0.001, startTime + 0.04);
    }

    osc.start(startTime);
    osc.stop(startTime + 0.3);
  }

  /* Bass note */
  function playBass(freq, startTime, duration) {
    var ctx = audioCtx;
    var osc = ctx.createOscillator();
    var env = ctx.createGain();
    var filt = ctx.createBiquadFilter();
    filt.type = "lowpass"; filt.frequency.value = 300;
    osc.connect(filt); filt.connect(env); env.connect(masterGain);
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(freq / 2, startTime);
    env.gain.setValueAtTime(0.7, startTime);
    env.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
    osc.start(startTime); osc.stop(startTime + duration + 0.02);
  }

  /* Melody patterns (4-beat cycle) */
  var melodyPatterns = [
    [0,2,4,5,4,2,0,4],
    [0,0,4,4,5,5,4,3],
    [7,5,4,2,4,5,7,5],
    [0,4,7,4,0,4,7,9],
    [2,4,5,7,5,4,2,0],
  ];
  var bassPatterns = [
    [0,0,4,0,5,0,4,0],
    [0,0,0,4,5,5,5,4],
    [7,7,5,5,4,4,2,2],
    [0,0,4,4,0,0,4,5],
    [0,2,4,5,4,2,0,7],
  ];
  var beatPatterns = [
  //  K   H   S   H   K   H   S   H
    [ 1,  1,  0,  1,  1,  1,  0,  1 ],
    [ 1,  0,  0,  0,  1,  0,  0,  0 ],
    [ 0,  1,  0,  1,  0,  1,  0,  1 ],
  ];

  var patternIdx = 0;

  function scheduleTick() {
    if (state !== "playing" || !audioCtx) return;

    var ctx = audioCtx;
    var secPerBeat = 60 / currentBpm;
    var lookahead = 0.2;

    while (nextNoteTime < ctx.currentTime + lookahead) {
      var step = beatStep % 8;
      var melPat = melodyPatterns[patternIdx % melodyPatterns.length];
      var basPat = bassPatterns[patternIdx % bassPatterns.length];
      var scale = currentScale;

      /* melody */
      var melNote = scale[melPat[step] % scale.length];
      playNote(melNote, nextNoteTime, secPerBeat * 0.5, "square", 0.35);

      /* harmony (fifth above, every other step) */
      if (step % 2 === 0) {
        var harmNote = scale[(melPat[step] + 2) % scale.length] * 2;
        playNote(harmNote, nextNoteTime, secPerBeat * 0.35, "triangle", 0.12);
      }

      /* bass */
      if (step === 0 || step === 4) {
        var basNote = scale[basPat[step] % scale.length];
        playBass(basNote, nextNoteTime, secPerBeat * 1.8);
      }

      /* drums */
      var kickPat  = beatPatterns[0];
      var hhatPat  = beatPatterns[2];
      var snarePat = beatPatterns[1];
      if (kickPat[step])  playBeat(nextNoteTime, "kick");
      if (hhatPat[step])  playBeat(nextNoteTime + 0.002, "hihat");
      if (step === 2 || step === 6) playBeat(nextNoteTime, "snare");

      nextNoteTime += secPerBeat / 2; // eighth notes
      beatStep++;

      /* rotate pattern every 16 steps */
      if (beatStep % 16 === 0) {
        patternIdx = (patternIdx + 1) % melodyPatterns.length;
      }
    }

    scheduleHandle = setTimeout(scheduleTick, 50);
  }

  function startAudio() {
    getAudioCtx();
    if (scheduleHandle) clearTimeout(scheduleHandle);
    nextNoteTime = audioCtx.currentTime + 0.05;
    beatStep = 0;
    scheduleTick();
  }

  function stopAudio() {
    if (scheduleHandle) clearTimeout(scheduleHandle);
    scheduleHandle = null;
  }

  function setVolume(v) { /* 0-100 */
    if (masterGain) masterGain.gain.value = (v / 100) * 0.6;
  }

  /* ── Playlist render ─────────────────────────────── */
  function fmt(s) {
    return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0");
  }

  function renderPlaylist() {
    var pl = document.getElementById("playlist");
    if (!pl) return;
    pl.innerHTML = "";
    tracks.forEach(function (t, i) {
      var row = document.createElement("div");
      row.className = "pl-row" + (i === selectedTrack ? " selected" : "");
      row.innerHTML =
        "<span>" + (i + 1) + ". " + t.title + "</span>" +
        '<span class="pl-time">' + fmt(t.dur) + "</span>";
      row.addEventListener("click", function () {
        selectedTrack = i; renderPlaylist();
      });
      row.addEventListener("dblclick", function () {
        loadTrack(i);
      });
      pl.appendChild(row);
    });
  }

  function loadTrack(i) {
    stopAudio(); // 🔥 prevent stacking
    currentTrack = i;
    selectedTrack = i;
    seconds = 0;

    currentScale = tracks[i].scale;
    currentBpm = tracks[i].bpm;
    patternIdx = 0;
    beatStep = 0;

    renderPlaylist();
    setMarquee((i + 1) + ". " + tracks[i].title + " (" + fmt(tracks[i].dur) + ") • 128KBPS 44KHZ STEREO • PROAMP");

    if (state === "playing") startAudio();
  }

  /* ── State management ──────────────────────────────── */
  function setPlayerState(s) {
    state = s;
    var pp = document.getElementById("ppIndicator");
    if (pp) pp.className = "play-pause-indicator " + s;
    if (s === "playing") {
      startAudio();
    } else {
      stopAudio();
    }
  }

  /* ── Marquee ─────────────────────────────────────── */
  function setMarquee(text) {
    var m = document.getElementById("marquee");
    if (m) m.textContent = text;
  }

  /* ── Clock / scrubber ticker ─────────────────────── */
  setInterval(function () {
    if (state !== "playing") return;
    seconds++;
    var trackDur = tracks[currentTrack].dur;
    if (seconds >= trackDur) {
      if (repeat) {
        seconds = 0;
        startAudio();
      } else {
        var next = shuffle
          ? Math.floor(Math.random() * tracks.length)
          : (currentTrack + 1) % tracks.length;
        loadTrack(next);
      }
      return;
    }
    var mm = Math.floor(seconds / 60);
    var ss = String(seconds % 60).padStart(2, "0");
    var td = document.getElementById("timeText");
    if (td) td.textContent = mm + ":" + ss;

    var pct = (seconds / trackDur) * 100;
    var posEl = document.getElementById("position");
    if (posEl && !posEl._dragging) posEl.value = pct;
  }, 1000);

  /* ── Visualizer ──────────────────────────────────── */
  var vizCanvas = document.getElementById("vizCanvas");
  var vizCtx = vizCanvas ? vizCanvas.getContext("2d") : null;
  var bars = [];
  for (var i = 0; i < 18; i++) {
    bars.push({ h: Math.random() * 6 + 2, v: (Math.random() - 0.5) * 0.4 });
  }

  function drawViz() {
    if (!vizCtx) { requestAnimationFrame(drawViz); return; }
    vizCtx.clearRect(0, 0, 75, 10);
    bars.forEach(function (b, idx) {
      if (state === "playing") {
        b.h += b.v + (Math.random() - 0.5) * 0.5;
        if (b.h >= 9.5) { b.h = 9.5; b.v = -Math.abs(b.v) - Math.random() * 0.3; }
        if (b.h <= 1) { b.h = 1; b.v = Math.abs(b.v) + Math.random() * 0.3; }
      } else {
        b.h = Math.max(b.h - 0.25, 1);
      }
      /* Color from green (low) to yellow (high) */
      var t = b.h / 10;
      var r = Math.round(t * 200);
      var g = 200 + Math.round((1 - t) * 55);
      vizCtx.fillStyle = "rgb(" + r + "," + g + ",0)";
      vizCtx.fillRect(idx * 4, 10 - b.h, 3, b.h);
    });
    requestAnimationFrame(drawViz);
  }
  drawViz();

  /* ── EQ graph curve ──────────────────────────────── */
  function updateEqGraph() {
    var el = document.getElementById("eqGraph");
    if (!el) return;
    var sliders = document.querySelectorAll(".eq-slider");
    if (!sliders.length) return;
    var vals = Array.from(sliders).map(function (s) { return parseFloat(s.value); });
    var pts = vals.map(function (v, i) {
      return [(i / (vals.length - 1)) * 113, ((12 - v) / 24) * 19];
    });
    var d = "M " + pts[0][0] + " " + pts[0][1];
    for (var k = 1; k < pts.length; k++) {
      var cx = (pts[k - 1][0] + pts[k][0]) / 2;
      d += " Q " + cx + " " + pts[k - 1][1] + " " + pts[k][0] + " " + pts[k][1];
    }
    el.innerHTML =
      '<svg width="113" height="19" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="' + d + '" fill="none" stroke="#9bff9b" stroke-width="1.2" opacity=".8"/>' +
      '<path d="' + d + ' L 113 19 L 0 19 Z" fill="rgba(155,255,155,.1)" stroke="none"/>' +
      '</svg>';
  }

  /* ── Transport button wiring ─────────────────────── */
  function wireBtn(id, fn) {
    var el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  }

  wireBtn("btnPlay",  function () { setPlayerState("playing"); });
  wireBtn("btnPause", function () { setPlayerState("paused"); });
  wireBtn("btnStop", function () { setPlayerState("stopped"); seconds = 0; stopAudio(); document.getElementById("timeText").textContent = "0:00"; });
  wireBtn("btnPrev",  function () { loadTrack((currentTrack - 1 + tracks.length) % tracks.length); });
  wireBtn("btnNext",  function () { loadTrack((currentTrack + 1) % tracks.length); });
  wireBtn("btnEject", function () { setPlayerState("stopped"); });

  /* ── Volume / balance ────────────────────────────── */
  var volEl = document.getElementById("volume");
  if (volEl) {
    setVolume(volEl.value);
    volEl.addEventListener("input", function () { setVolume(this.value); });
  }

  /* ── Scrubber ────────────────────────────────────── */
  var posEl = document.getElementById("position");
  if (posEl) {
    posEl.addEventListener("mousedown", function () { this._dragging = true; });
    posEl.addEventListener("mousedown", function () {
      this._dragging = true;
    });

    document.addEventListener("mouseup", () => {
      if (posEl && posEl._dragging) {
        posEl._dragging = false;
        seconds = Math.round((posEl.value / 100) * tracks[currentTrack].dur);
      }
    });
  }

  /* ── Shuffle / Repeat ────────────────────────────── */
  wireBtn("shuffleBtn", function () {
    shuffle = !shuffle;
    document.getElementById("shuffleLed").classList.toggle("on", shuffle);
  });
  wireBtn("repeatBtn", function () {
    repeat = !repeat;
    document.getElementById("repeatLed").classList.toggle("on", repeat);
  });

  /* ── EQ ON / AUTO ────────────────────────────────── */
  wireBtn("eqOnBtn", function () {
    eqOn = !eqOn;
    document.getElementById("eqOnLed").classList.toggle("on", eqOn);
  });
  wireBtn("eqAutoBtn", function () {
    var led = document.getElementById("eqAutoLed");
    led.classList.toggle("on");
  });

  /* ── EQ / PL window toggles ──────────────────────── */
  wireBtn("eqBtn", function () {
    var w = document.getElementById("winEq");
    if (w) w.style.display = w.style.display === "none" ? "" : "none";
  });
  wireBtn("plBtn", function () {
    var w = document.getElementById("winPlaylist");
    if (w) w.style.display = w.style.display === "none" ? "" : "none";
  });
  wireBtn("eqCloseBtn", function () {
    var w = document.getElementById("winEq");
    if (w) w.style.display = "none";
  });
  wireBtn("plCloseBtn", function () {
    var w = document.getElementById("winPlaylist");
    if (w) w.style.display = "none";
  });

  /* ── EQ sliders → graph ──────────────────────────── */
  document.querySelectorAll(".eq-slider").forEach(function (s) {
    s.addEventListener("input", updateEqGraph);
  });
  updateEqGraph();

  /* ── Init ────────────────────────────────────────── */
  renderPlaylist();
  setMarquee("2. PROAMP - TRACK 07 (3:10) \u2022 128KBPS 44KHZ STEREO \u2022 PROAMP");

  /* Set visual state to playing but wait for user gesture before audio */
  state = "playing";
  var pp = document.getElementById("ppIndicator");
  if (pp) pp.className = "play-pause-indicator playing";

  /* Start audio on first click anywhere in the player */
  var audioStarted = false;
  function tryStartAudio() {
    if (!audioStarted) {
      audioStarted = true;
      startAudio();
      document.querySelector(".stage").removeEventListener("click", tryStartAudio);
    }
  }
  var stageEl = document.querySelector(".stage");
  if (stageEl) {
    stageEl.addEventListener("click", tryStartAudio);
  }
})();
