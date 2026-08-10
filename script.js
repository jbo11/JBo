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

  const isMobile = () =>
    window.matchMedia('(max-width: 900px)').matches;

  // Pages with DARK backgrounds → header should stay white
  const darkPages = [
    'page1',
    'page2',
    'page4',
    'page5',
    'page6',
    'page8'
  ];

  function setActive(idx, push = true) {
    if (idx < 0 || idx >= sections.length) return;

    current = idx;

    fp.style.willChange = 'transform';

    if (!isMobile()) {
      fp.style.transform = `translateY(-${idx * 100}vh)`;
    } else if (push) {
      // Only scroll on direct navigation.
      // Scroll-spy calls setActive(..., false),
      // preventing mobile scroll jumping.
      sections[idx].scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }

    sections.forEach((section, i) => {
      section.classList.toggle(
        'is-active',
        i === idx
      );
    });

    dots.forEach((dot, i) => {
      dot.classList.toggle(
        'active',
        i === idx
      );
    });

    const id = sections[idx].id;

    document.body.classList.toggle(
      'dark-header',
      !darkPages.includes(id)
    );

    if (label) {
      label.textContent =
        dots[idx]?.dataset.label || '';
    }

    // Animate skill bars
    if (id === 'page2') {
      document
        .querySelectorAll('.bar span')
        .forEach((bar) => {
          bar.style.width =
            bar.dataset.w + '%';
        });
    }

    if (
      push &&
      history.replaceState
    ) {
      history.replaceState(
        null,
        '',
        '#' + id
      );
    }
  }

  // ============================================================
  // DESKTOP WHEEL SCROLL
  // ============================================================

  let wheelLock = false;
  let lastScrollTime = 0;

  // Resume section internal scrolling
  document
    .querySelectorAll('.resume-col')
    .forEach((el) => {
      el.addEventListener(
        'wheel',
        (e) => {
          const atTop =
            el.scrollTop <= 0;

          const atBottom =
            el.scrollTop +
              el.clientHeight >=
            el.scrollHeight;

          if (
            !(atTop && e.deltaY < 0) &&
            !(atBottom && e.deltaY > 0)
          ) {
            e.stopPropagation();
            return;
          }
        },
        {
          passive: false
        }
      );
    });

  window.addEventListener(
    'wheel',
    (e) => {
      if (isMobile()) return;

      // Allow native scrolling inside resume panels
      if (
        e.target.closest(
          '.resume-col'
        )
      ) {
        return;
      }

      const now = Date.now();

      if (
        now - lastScrollTime <
        800
      ) {
        return;
      }

      if (
        wheelLock ||
        isAnimating
      ) {
        e.preventDefault();
        return;
      }

      e.preventDefault();

      // Ignore trackpad micro movements
      if (
        Math.abs(e.deltaY) <
        40
      ) {
        return;
      }

      wheelLock = true;
      isAnimating = true;
      lastScrollTime = now;

      if (e.deltaY > 0) {
        setActive(
          Math.min(
            current + 1,
            sections.length - 1
          )
        );
      } else {
        setActive(
          Math.max(
            current - 1,
            0
          )
        );
      }

      setTimeout(() => {
        wheelLock = false;
        isAnimating = false;
      }, 900);
    },
    {
      passive: false
    }
  );

  // ============================================================
  // DESKTOP KEYBOARD NAVIGATION
  // ============================================================

  window.addEventListener(
    'keydown',
    (e) => {
      if (isMobile()) return;

      if (
        [
          'ArrowDown',
          'PageDown',
          ' '
        ].includes(e.key)
      ) {
        e.preventDefault();

        setActive(
          Math.min(
            current + 1,
            sections.length - 1
          )
        );
      }

      if (
        [
          'ArrowUp',
          'PageUp'
        ].includes(e.key)
      ) {
        e.preventDefault();

        setActive(
          Math.max(
            current - 1,
            0
          )
        );
      }

      if (e.key === 'Home') {
        e.preventDefault();
        setActive(0);
      }

      if (e.key === 'End') {
        e.preventDefault();

        setActive(
          sections.length - 1
        );
      }
    }
  );

  // ============================================================
  // TOUCH SWIPE — DESKTOP/TABLET FULLPAGE ONLY
  // ============================================================

  let touchY = null;

  window.addEventListener(
    'touchstart',
    (e) => {
      touchY =
        e.touches[0].clientY;
    },
    {
      passive: true
    }
  );

  window.addEventListener(
    'touchend',
    (e) => {
      // On mobile we want natural scrolling
      if (
        isMobile() ||
        touchY === null
      ) {
        return;
      }

      const diff =
        touchY -
        e.changedTouches[0]
          .clientY;

      if (
        Math.abs(diff) <
        60
      ) {
        return;
      }

      if (diff > 0) {
        setActive(
          Math.min(
            current + 1,
            sections.length - 1
          )
        );
      } else {
        setActive(
          Math.max(
            current - 1,
            0
          )
        );
      }

      touchY = null;
    }
  );

  // ============================================================
  // DOT NAVIGATION
  // ============================================================

  dots.forEach(
    (dot, i) => {
      dot.addEventListener(
        'click',
        (e) => {
          e.preventDefault();
          setActive(i);
        }
      );
    }
  );

  // ============================================================
  // OVERLAY MENU
  // ============================================================

  function setMenuOpen(open) {
    if (!overlay) return;

    overlay.classList.toggle(
      'open',
      open
    );

    document.body.classList.toggle(
      'menu-open',
      open
    );

    if (menuToggle) {
      menuToggle.setAttribute(
        'aria-expanded',
        String(open)
      );
    }
  }

  if (menuToggle) {
    menuToggle.setAttribute(
      'aria-expanded',
      'false'
    );

    menuToggle.addEventListener(
      'click',
      () => {
        setMenuOpen(true);
      }
    );
  }

  if (closeMenu) {
    closeMenu.addEventListener(
      'click',
      () => {
        setMenuOpen(false);
      }
    );
  }

  // Anchor links
  document
    .querySelectorAll(
      'a[href^="#page"]'
    )
    .forEach((link) => {
      link.addEventListener(
        'click',
        (e) => {
          const id =
            link
              .getAttribute('href')
              .slice(1);

          const idx =
            sections.findIndex(
              (section) =>
                section.id === id
            );

          if (idx < 0) return;

          e.preventDefault();

          setActive(idx);

          setMenuOpen(false);
        }
      );
    });

  document.addEventListener(
    'keydown',
    (e) => {
      if (
        e.key === 'Escape' &&
        overlay?.classList.contains(
          'open'
        )
      ) {
        setMenuOpen(false);
      }
    }
  );

  // ============================================================
  // RESIZE
  // ============================================================

  window.addEventListener(
    'resize',
    () => {
      if (isMobile()) {
        fp.style.transform = '';
      } else {
        fp.style.transform =
          `translateY(-${
            current * 100
          }vh)`;
      }
    }
  );

  // ============================================================
  // MOBILE SCROLL SPY
  // ============================================================

  let scrollTick = false;

  window.addEventListener(
    'scroll',
    () => {
      if (
        !isMobile() ||
        scrollTick
      ) {
        return;
      }

      scrollTick = true;

      requestAnimationFrame(
        () => {
          const mid =
            window.scrollY +
            window.innerHeight /
              2;

          let idx = 0;

          sections.forEach(
            (section, i) => {
              if (
                section.offsetTop <=
                mid
              ) {
                idx = i;
              }
            }
          );

          if (idx !== current) {
            // Important:
            // false = update state
            // without scrollIntoView()
            setActive(
              idx,
              false
            );
          }

          scrollTick = false;
        }
      );
    }
  );

  // ============================================================
  // CONTACT FORM
  // ============================================================

  const form =
    document.getElementById(
      'contactForm'
    );

  if (form) {
    form.addEventListener(
      'submit',
      (e) => {
        e.preventDefault();

        const btn =
          form.querySelector(
            'button'
          );

        if (!btn) return;

        const original =
          btn.innerHTML;

        btn.innerHTML =
          'Sent <i class="fas fa-check"></i>';

        btn.style.background =
          '#1d1d1d';

        btn.style.color =
          '#fff';

        form.reset();

        setTimeout(() => {
          btn.innerHTML =
            original;

          btn.style.background =
            '';

          btn.style.color =
            '';
        }, 2200);
      }
    );
  }

  // ============================================================
  // INITIAL PAGE
  // ============================================================

  let initIdx = 0;

  const hash =
    window.location.hash.slice(
      1
    );

  if (hash) {
    const found =
      sections.findIndex(
        (section) =>
          section.id === hash
      );

    if (found !== -1) {
      initIdx = found;
    }
  }

  // Disable animation during initial positioning
  fp.style.transition =
    'none';

  setActive(
    initIdx,
    false
  );

  // Re-enable after first paint
  setTimeout(() => {
    fp.style.transition = '';
  }, 50);
})();


// ============================================================
// ACCENT COLOR PICKER
// ============================================================

const DEFAULT_ACCENT =
  '#f4ca30';

const settingsBtn =
  document.getElementById(
    'settingsBtn'
  );

const modal =
  document.getElementById(
    'settingsModal'
  );

const accentPicker =
  document.getElementById(
    'accentPicker'
  );

const resetBtn =
  document.getElementById(
    'resetAccent'
  );

if (
  settingsBtn &&
  modal &&
  accentPicker &&
  resetBtn
) {
  const savedAccent =
    localStorage.getItem(
      'accent'
    ) ||
    DEFAULT_ACCENT;

  document.documentElement
    .style.setProperty(
      '--accent',
      savedAccent
    );

  accentPicker.value =
    savedAccent;

  settingsBtn.addEventListener(
    'click',
    (e) => {
      e.preventDefault();

      modal.classList.toggle(
        'hidden'
      );

      settingsBtn.classList.toggle(
        'active'
      );
    }
  );

  accentPicker.addEventListener(
    'input',
    (e) => {
      const color =
        e.target.value;

      document.documentElement
        .style.setProperty(
          '--accent',
          color
        );

      localStorage.setItem(
        'accent',
        color
      );
    }
  );

  resetBtn.addEventListener(
    'click',
    () => {
      document.documentElement
        .style.setProperty(
          '--accent',
          DEFAULT_ACCENT
        );

      accentPicker.value =
        DEFAULT_ACCENT;

      localStorage.removeItem(
        'accent'
      );
    }
  );

  document.addEventListener(
    'click',
    (e) => {
      const modalContent =
        modal.querySelector(
          '.modal-content'
        );

      if (
        !modal.classList.contains(
          'hidden'
        ) &&
        modalContent &&
        !modalContent.contains(
          e.target
        ) &&
        !settingsBtn.contains(
          e.target
        )
      ) {
        modal.classList.add(
          'hidden'
        );

        settingsBtn.classList.remove(
          'active'
        );
      }
    }
  );

  document.addEventListener(
    'keydown',
    (e) => {
      if (
        e.key === 'Escape'
      ) {
        modal.classList.add(
          'hidden'
        );

        settingsBtn.classList.remove(
          'active'
        );
      }
    }
  );
}

// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// Gravity
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

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

// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// MUSIC
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

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

// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// Konami Code → Hidden Tech Profile
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

(() => {
  const KONAMI_CODE = [
    "ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown",
    "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight",
    "b", "a"
  ];

  let input = [];

  document.addEventListener("keydown", (e) => {
    const tag = e.target?.tagName?.toLowerCase();

    if (tag === "input" || tag === "textarea") return;

    const key =
      e.key.length === 1
        ? e.key.toLowerCase()
        : e.key;

    input.push(key);

    if (input.length > KONAMI_CODE.length) {
      input.shift();
    }

    const matched = KONAMI_CODE.every(
      (expected, index) => input[index] === expected
    );

    if (!matched) return;

    input = [];

    window.TechProfileActivation?.start?.();
  });

  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // EASTER EGG — CLICK TO REVEAL SECRET
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

  (() => {

    const easterEgg =
      document.getElementById(
        "easterEgg"
      );

    const tooltip =
      document.getElementById(
        "easterTooltip"
      );

    if (
      !easterEgg ||
      !tooltip
    ) {
      return;
    }


    const normalMessage =
      "There’s a legendary sequence hidden here...";


    const secretMessage = `
      <strong>U</strong>nder
      <strong>U</strong>nknown
      <strong>D</strong>epths,
      <strong>D</strong>ark
      <strong>L</strong>egends
      <strong>R</strong>emain;
      <strong>L</strong>ost
      <strong>R</strong>elics
      <strong>B</strong>ring
      <strong>A</strong>dventure
    `;


    let secretTimer = null;


    easterEgg.addEventListener(
      "click",
      (event) => {

        event.preventDefault();

        clearTimeout(
          secretTimer
        );


        // Reset
        easterEgg.classList.remove(
          "secret-revealed"
        );

        tooltip.textContent =
          normalMessage;


        // Play Contra sound

        const audio =
          new Audio(
            "public/contra.wav"
          );

        audio.volume = 0.6;

        audio.play().catch(() => {});


        // Reveal clue after 3 seconds

        secretTimer =
          setTimeout(
            () => {

              tooltip.innerHTML =
                secretMessage;

              easterEgg.classList.add(
                "secret-revealed"
              );

            },
            5500
          );

      }
    );


    // Reset after leaving
    // once secret was revealed

    easterEgg.addEventListener(
      "mouseleave",
      () => {

        if (
          easterEgg.classList.contains(
            "secret-revealed"
          )
        ) {

          easterEgg.classList.remove(
            "secret-revealed"
          );

          tooltip.textContent =
            normalMessage;

        }

      }
    );

  })();

})();