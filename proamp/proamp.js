/* PROAMP — vanilla JS interactivity */
(function () {
  "use strict";

  // ---------------- Playlist data ----------------
  const tracks = [
    { title: "Proamp - Welcome Tone",        time: "0:27" },
    { title: "Proamp - Track 07",            time: "3:10" },
    { title: "Proamp Editor - Proamp Test",  time: "0:12" },
    { title: "Proamp",                       time: "0:27" },
    { title: "Proamp - Demo Loop",           time: "1:48" },
    { title: "Proamp - Skin Test",           time: "0:42" },
    { title: "Proamp - Eject FX",            time: "0:08" },
  ];

  const playlistEl = document.getElementById("playlist");
  let selected = 1;
  let playing = 1;

  function renderPlaylist() {
    playlistEl.innerHTML = "";
    tracks.forEach((t, i) => {
      const row = document.createElement("div");
      row.className = "playlist__row";
      if (i === selected) row.classList.add("playlist__row--sel");
      if (i === playing && i !== selected)
        row.classList.add("playlist__row--playing");
      row.innerHTML =
        '<span>' + (i + 1) + ". " + t.title + "</span>" +
        '<span>' + t.time + "</span>";
      row.addEventListener("click", function () {
        selected = i;
        renderPlaylist();
      });
      row.addEventListener("dblclick", function () {
        playing = i;
        selected = i;
        document.getElementById("track").textContent =
          (i + 1) + ". " + t.title.toUpperCase() + " (" + t.time + ")";
        renderPlaylist();
      });
      playlistEl.appendChild(row);
    });
  }
  renderPlaylist();

  // ---------------- Time counter ----------------
  let seconds = 1;
  const timeEl = document.getElementById("time");
  setInterval(function () {
    seconds = (seconds + 1) % 600;
    const m = Math.floor(seconds / 60);
    const s = String(seconds % 60).padStart(2, "0");
    timeEl.textContent = m + ":" + s;
  }, 1000);

  // ---------------- Toggle buttons ----------------
  ["shuffleBtn", "repeatBtn", "eqOn", "eqAuto"].forEach(function (id) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("click", function () {
      el.classList.toggle("on");
      const led = el.querySelector(".toggle-btn__led, .led");
      if (led) led.classList.toggle("on");
    });
  });

  // ---------------- Transport feedback ----------------
  document.querySelectorAll(".tb").forEach(function (b) {
    b.addEventListener("click", function () {
      const act = b.dataset.act;
      if (act === "next") {
        playing = (playing + 1) % tracks.length;
        selected = playing;
        renderPlaylist();
        document.getElementById("track").textContent =
          (playing + 1) + ". " + tracks[playing].title.toUpperCase() +
          " (" + tracks[playing].time + ")";
      } else if (act === "prev") {
        playing = (playing - 1 + tracks.length) % tracks.length;
        selected = playing;
        renderPlaylist();
        document.getElementById("track").textContent =
          (playing + 1) + ". " + tracks[playing].title.toUpperCase() +
          " (" + tracks[playing].time + ")";
      } else if (act === "stop") {
        seconds = 0;
        timeEl.textContent = "0:00";
      }
    });
  });

  // ---------------- Slider dragging (volume + balance + scrubber) ----------------
  function makeHorizontalDraggable(thumb, min, max) {
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    thumb.addEventListener("mousedown", function (e) {
      dragging = true;
      startX = e.clientX;
      startLeft = parseFloat(thumb.style.left || "0");
      e.preventDefault();
    });
    window.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      // /2 because the page is scaled 2x
      const dx = (e.clientX - startX) / 2;
      let next = startLeft + dx;
      if (next < min) next = min;
      if (next > max) next = max;
      thumb.style.left = next + "px";
    });
    window.addEventListener("mouseup", function () { dragging = false; });
  }
  document.querySelectorAll(".vslider__thumb").forEach(function (t) {
    makeHorizontalDraggable(t, 0, 53);
  });
  document.querySelectorAll(".bslider__thumb").forEach(function (t) {
    makeHorizontalDraggable(t, 0, 24);
  });
  const scrub = document.getElementById("scrubThumb");
  if (scrub) makeHorizontalDraggable(scrub, 0, 224);

  // ---------------- EQ slider thumbs (vertical) ----------------
  const SLIDER_TRACK_H = 50; // px in unscaled coords
  const THUMB_H = 8;
  document.querySelectorAll(".eq__slider__thumb").forEach(function (thumb) {
    const pos = parseFloat(thumb.dataset.pos || "50"); // 0..100
    function setPos(p) {
      const top = ((100 - p) / 100) * (SLIDER_TRACK_H - THUMB_H);
      thumb.style.top = top + "px";
    }
    setPos(pos);
    thumb.dataset.cur = String(pos);

    let dragging = false;
    let startY = 0;
    let startCur = pos;
    thumb.addEventListener("mousedown", function (e) {
      dragging = true;
      startY = e.clientY;
      startCur = parseFloat(thumb.dataset.cur || "50");
      e.preventDefault();
    });
    window.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      const dy = (e.clientY - startY) / 2; // /2 for page scale
      let next = startCur - (dy / (SLIDER_TRACK_H - THUMB_H)) * 100;
      if (next < 0) next = 0;
      if (next > 100) next = 100;
      thumb.dataset.cur = String(next);
      setPos(next);
    });
    window.addEventListener("mouseup", function () { dragging = false; });
  });
})();
