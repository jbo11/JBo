(function () {
  const fp = document.getElementById('fullpage');
  const sections = Array.from(document.querySelectorAll('.page'));
  const dots = Array.from(document.querySelectorAll('.dot-nav a'));
  const label = document.getElementById('sectionLabel');
  const menuToggle = document.getElementById('menuToggle');
  const closeMenu = document.getElementById('closeMenu');
  const overlay = document.getElementById('overlayMenu');

  let current = 0;
  let isAnimating = false;
  const isMobile = () => window.matchMedia('(max-width: 900px)').matches;

  // Pages whose top area is light (header should be dark)
  // Pages with DARK background → header should be WHITE
  const darkPages = ['page1','page2','page4','page5','page6','page8'];

  function setActive(idx, push=true) {
    if (idx < 0 || idx >= sections.length) return;
    current = idx;

    fp.style.willChange = "transform";

    if (!isMobile()) {
      fp.style.transform = `translateY(-${idx * 100}vh)`;
    } else {
      sections[idx].scrollIntoView({behavior:'smooth', block:'start'});
    }

    sections.forEach((s,i) => s.classList.toggle('is-active', i === idx));
    dots.forEach((d,i) => d.classList.toggle('active', i === idx));

    const id = sections[idx].id;

    // 👉 KEY FIX
    document.body.classList.toggle('dark-header', !darkPages.includes(id));

    label.textContent = dots[idx]?.dataset.label || '';

    if (id === 'page2') {
      document.querySelectorAll('.bar span').forEach(b => {
        b.style.width = b.dataset.w + '%';
      });
    }

    if (push && history.replaceState) {
      history.replaceState(null,'','#' + id);
    }
  }

  // Wheel scroll
  let wheelLock = false;
  let lastScrollTime = 0;

  // Scrolling Resume Section
  document.querySelectorAll('.resume-col').forEach(el => {
    el.addEventListener('wheel', (e) => {
      const atTop = el.scrollTop <= 0;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight;

      // 👇 If still scrollable inside → LOCK page scroll
      if (!(atTop && e.deltaY < 0) && !(atBottom && e.deltaY > 0)) {
        e.stopPropagation();   // prevents page change
        return;
      }

      // 👇 If reached edges → allow page scroll
      // do nothing (event bubbles to window)
    }, { passive: false });
  });
  // end

  window.addEventListener('wheel', (e) => {
  if (isMobile()) return;

  // 🔥 If mouse is inside resume-col → DO NOTHING (allow native scroll)
  if (e.target.closest('.resume-col')) return;

    const now = Date.now();
    if (now - lastScrollTime < 800) return; // throttle

    if (wheelLock || isAnimating) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    // Ignore micro scrolls (trackpads cause jitter)
    if (Math.abs(e.deltaY) < 40) return;

    wheelLock = true;
    isAnimating = true;
    lastScrollTime = now;

    if (e.deltaY > 0) {
      setActive(Math.min(current + 1, sections.length - 1));
    } else {
      setActive(Math.max(current - 1, 0));
    }

    setTimeout(() => {
      wheelLock = false;
      isAnimating = false;
    }, 900);
  }, { passive: false });

  // Keyboard
  window.addEventListener('keydown', (e) => {
    if (isMobile()) return;
    if (['ArrowDown','PageDown',' '].includes(e.key)) { e.preventDefault(); setActive(Math.min(current + 1, sections.length - 1)); }
    if (['ArrowUp','PageUp'].includes(e.key))    { e.preventDefault(); setActive(Math.max(current - 1, 0)); }
    if (e.key === 'Home') { e.preventDefault(); setActive(0); }
    if (e.key === 'End')  { e.preventDefault(); setActive(sections.length - 1); }
  });

  // Touch swipe
  let touchY = null;
  window.addEventListener('touchstart', (e) => { touchY = e.touches[0].clientY; }, { passive:true });
  window.addEventListener('touchend', (e) => {
    if (isMobile() || touchY === null) return;
    const diff = touchY - e.changedTouches[0].clientY;
    if (Math.abs(diff) < 60) return;
    if (diff > 0) setActive(Math.min(current + 1, sections.length - 1));
    else setActive(Math.max(current - 1, 0));
    touchY = null;
  });

  // Dot nav clicks
  dots.forEach((d, i) => d.addEventListener('click', (e) => {
    e.preventDefault();
    setActive(i);
  }));

  // Anchor links inside menu / hero
  document.querySelectorAll('a[href^="#page"]').forEach(a => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href').slice(1);
      const idx = sections.findIndex(s => s.id === id);
      if (idx >= 0) {
        e.preventDefault();
        setActive(idx);
        overlay.classList.remove('open');
      }
    });
  });

  // Menu
  menuToggle.addEventListener('click', () => overlay.classList.add('open'));
  closeMenu.addEventListener('click', () => overlay.classList.remove('open'));

  // Resize handler
  window.addEventListener('resize', () => {
    if (isMobile()) {
      fp.style.transform = '';
    } else {
      fp.style.transform = `translateY(-${current * 100}vh)`;
    }
  });

  // Mobile scroll-spy
  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (!isMobile() || scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => {
      const mid = window.scrollY + window.innerHeight / 2;
      let idx = 0;
      sections.forEach((s,i) => { if (s.offsetTop <= mid) idx = i; });
      if (idx !== current) setActive(idx, false);
      scrollTick = false;
    });
  });

  // Contact form
  const form = document.getElementById('contactForm');
  if (form) form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('button');
    const original = btn.innerHTML;
    btn.innerHTML = 'Sent <i class="fas fa-check"></i>';
    btn.style.background = '#1d1d1d';
    btn.style.color = '#fff';
    form.reset();
    setTimeout(() => { btn.innerHTML = original; btn.style.background=''; btn.style.color=''; }, 2200);
  });

  // Init based on hash & when "← Back to Works" is clicked
  let initIdx = 0;
const hash = window.location.hash.slice(1);

if (hash) {
  const found = sections.findIndex(s => s.id === hash);
  if (found !== -1) {
    initIdx = found;
  }
}

// 🔥 disable animation on first load
fp.style.transition = "none";
setActive(initIdx, false);

// re-enable after paint
setTimeout(() => {
  fp.style.transition = "";
}, 50);
})();

// Accent Picker
const DEFAULT_ACCENT = "#f4ca30";

const settingsBtn = document.getElementById("settingsBtn");
const modal = document.getElementById("settingsModal");
const accentPicker = document.getElementById("accentPicker");
const resetBtn = document.getElementById("resetAccent");

// Load saved or default
const savedAccent = localStorage.getItem("accent") || DEFAULT_ACCENT;
document.documentElement.style.setProperty("--accent", savedAccent);
accentPicker.value = savedAccent;

// Open / toggle modal
settingsBtn.addEventListener("click", (e) => {
  e.preventDefault();
  modal.classList.toggle("hidden");
  settingsBtn.classList.toggle("active");
});

// Change accent
accentPicker.addEventListener("input", (e) => {
  const color = e.target.value;
  document.documentElement.style.setProperty("--accent", color);
  localStorage.setItem("accent", color);
});

// Reset to default
resetBtn.addEventListener("click", () => {
  document.documentElement.style.setProperty("--accent", DEFAULT_ACCENT);
  accentPicker.value = DEFAULT_ACCENT;
  localStorage.removeItem("accent");
});

// Click outside to close
document.addEventListener("click", (e) => {
  const modalContent = modal.querySelector(".modal-content");

  if (!modal.classList.contains("hidden")) {
    if (
      !modalContent.contains(e.target) &&
      !settingsBtn.contains(e.target)
    ) {
      modal.classList.add("hidden");
      settingsBtn.classList.remove("active");
    }
  }
});

// ESC key to close
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    modal.classList.add("hidden");
    settingsBtn.classList.remove("active");
  }
});

// Gravity XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
function triggerGravity() {
  const activePage = document.querySelector(".page.is-active");
  if (!activePage) return;

  const elements = activePage.querySelectorAll("h1, h2, h3, h4, p, img, span, a, div");

  const gravityBtn = document.getElementById("gravityBtn");

  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.top = 0;
  container.style.left = 0;
  container.style.width = "100vw";
  container.style.height = "100vh";
  container.style.pointerEvents = "none";
  container.style.zIndex = 9999;
  container.className = "gravity-layer"; // Reset
  document.body.appendChild(container);

  elements.forEach(el => {
    const rect = el.getBoundingClientRect();

    const clone = el.cloneNode(true);
    container.appendChild(clone);

    clone.style.position = "absolute";
    clone.style.left = rect.left + "px";
    clone.style.top = rect.top + "px";
    clone.style.margin = 0;
    clone.style.transform = "none";

    // hide original (ONLY inside active page)
    el.style.opacity = 0;

    applyGravity(clone);
  });
}

function applyGravity(el) {
  let velocity = 0;
  let rotation = Math.random() * 10 - 5;
  let posY = parseFloat(el.style.top);

  function animate() {
    velocity += 0.6; // gravity
    posY += velocity;

    // floor collision
    const floor = window.innerHeight - el.offsetHeight;

    if (posY > floor) {
      posY = floor;
      velocity *= -0.4; // bounce
    }

    el.style.top = posY + "px";
    el.style.transform = `rotate(${rotation}deg)`;

    requestAnimationFrame(animate);
  }

  animate();
}

function resetGravity() {
  // restore original elements
  document.querySelectorAll(".page *").forEach(el => {
    el.style.opacity = "";
  });

  // remove ALL gravity layers (in case multiple were created)
  document.querySelectorAll(".gravity-layer").forEach(layer => {
    layer.remove();
  });
}

document.addEventListener("keydown", (e) => {
  const tag = e.target.tagName.toLowerCase();
  if (tag === "input" || tag === "textarea") return;

  const key = e.key.toLowerCase();

  if (key === "g") triggerGravity();
  if (key === "f") resetGravity();
});

gravityBtn.addEventListener("click", (e) => {
  e.preventDefault();

  resetGravity();   // clears previous fall
  triggerGravity(); // starts gravity
});

// MUSIC XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

const musicToggle = document.getElementById("musicToggle");

let webampInstance = null;

musicToggle.addEventListener("click", async (e) => {
  e.preventDefault();

  // 🔥 FIRST CLICK → CREATE PLAYER
  if (!webampInstance) {
    const Winamp = window.Webamp;

    webampInstance = new Winamp({
      initialTracks: [
        {
          metaData: {
            artist: "Eminem",
            title: "Fast Lane",
          },
          url: "https://file.garden/ae-SQnRY3UKpjLFX/fast%20lane.mp3",
        },
        {
          metaData: {
            artist: "Wiz Khalifa",
            title: "Fly You",
          },
          url: "https://file.garden/ae-SQnRY3UKpjLFX/fly%20you.mp3",
        },
        {
          metaData: {
            artist: "Snoop Dogg",
            title: "Maybe Tonight",
          },
          url: "https://file.garden/ae-SQnRY3UKpjLFX/maybe%20tonight.mp3",
        }
      ],
    });

    await webampInstance.renderWhenReady(
      document.getElementById("winamp-container")
    );

    return;
  }

  // 🔥 AFTER THAT → TOGGLE VISIBILITY
  const el = document.getElementById("webamp");

  if (!el) return;

  el.style.display = (el.style.display === "none") ? "block" : "none";
});