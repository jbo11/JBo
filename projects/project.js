const fp = document.getElementById("fullpage-works");

let current = 0;
let isAnimating = false;

function getSections() {
  return document.querySelectorAll(".page");
}

function setActive(idx) {
  const sections = getSections();

  if (!fp) return;
  if (idx < 0 || idx >= sections.length) return;

  current = idx;

  fp.style.transform = `translateY(-${idx * 100}vh)`;

  sections.forEach((s, i) => {
    s.classList.toggle("is-active", i === idx);
  });
}

// SCROLL
window.addEventListener("wheel", (e) => {
  if (isAnimating) return;

  // ✅ Allow scrolling/clicking inside links or interactive elements
  if (e.target.closest("a, button, input, textarea")) return;

  if (Math.abs(e.deltaY) < 30) return;

  e.preventDefault();
  isAnimating = true;

  const sections = getSections();

  if (e.deltaY > 0) {
    setActive(Math.min(current + 1, sections.length - 1));
  } else {
    setActive(Math.max(current - 1, 0));
  }

  setTimeout(() => {
    isAnimating = false;
  }, 900);
}, { passive: false });

// ARROWS
document.querySelectorAll(".arrow-down").forEach(btn => {
  btn.addEventListener("click", () => {
    const sections = getSections();
    setActive(Math.min(current + 1, sections.length - 1));
  });
});

document.querySelectorAll(".arrow-up").forEach(btn => {
  btn.addEventListener("click", () => {
    setActive(Math.max(current - 1, 0));
  });
});

// INIT
setActive(0);

// For mobile scrolling

let startY = 0;

window.addEventListener("touchstart", (e) => {
  startY = e.touches[0].clientY;
});

window.addEventListener("touchend", (e) => {
  if (isAnimating) return;

  // ✅ Allow taps on links
  if (e.target.closest("a, button")) return;

  const endY = e.changedTouches[0].clientY;
  const diff = startY - endY;

  if (Math.abs(diff) < 50) return;

  const sections = getSections();

  if (diff > 0) {
    setActive(Math.min(current + 1, sections.length - 1));
  } else {
    setActive(Math.max(current - 1, 0));
  }
});

