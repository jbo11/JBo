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
})();
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
  // EASTER EGG — CLICK TO REVEAL SECRET
  // XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
(() => {
  const easterEgg =
    document.getElementById("easterEgg");
  const tooltip =
    document.getElementById("easterTooltip");
  if (!easterEgg || !tooltip) {
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
  let audio = null;
  let activated = false;
  // ==========================================================
  // CLICK EGG
  // ==========================================================
  easterEgg.addEventListener("click", (event) => {
    event.preventDefault();
    // Cancel previous attempt
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
      audio = null;
    }
    activated = true;
    // Reset tooltip
    easterEgg.classList.remove(
      "secret-revealed"
    );
    tooltip.textContent =
      normalMessage;
    // ========================================================
    // PLAY SECRET AUDIO
    // ========================================================
    audio = new Audio(
      "public/sounds/contra.mp3"
    );
    audio.volume = 0.6;
    // ========================================================
    // AUDIO FINISHED
    // ========================================================
    audio.addEventListener(
      "ended",
      () => {
        // Reveal ONLY if:
        // 1. egg was clicked
        // 2. mouse is STILL hovering
        if (
          activated &&
          easterEgg.matches(":hover")
        ) {
          tooltip.innerHTML =
            secretMessage;
          easterEgg.classList.add(
            "secret-revealed"
          );
        }
        audio = null;
      }
    );
    audio.play().catch((error) => {
      console.log(
        "Audio could not play:",
        error
      );
      activated = false;
    });
  });
  // ==========================================================
  // MOUSE LEAVES EGG
  // ==========================================================
  easterEgg.addEventListener(
    "mouseleave",
    () => {
      // Cancel the secret attempt
      activated = false;
      // Hide/reset secret
      easterEgg.classList.remove(
        "secret-revealed"
      );
      tooltip.textContent =
        normalMessage;
    }
  );
})();
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
// PARTNER COIN BOX EASTER EGG
// XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
(() => {
  // ==========================================================
  // CONFIGURATION
  // ==========================================================
  const REQUIRED_PARTNER_CLICKS = 5;
  const MAX_COINS = 10;
  const USED_BLOCK_DURATION = 5000;
  const COIN_FRAME_SPEED = 65;
  // ==========================================================
  // FILE PATHS
  // ==========================================================
  const COINBOX_PATH =
    "public/partners/coinBox";
  const BOX_ACTIVE =
    `${COINBOX_PATH}/box1.png`;
  const BOX_USED =
    `${COINBOX_PATH}/box2.png`;
  const COIN_FRAMES = [
    `${COINBOX_PATH}/coin-1.png`,
    `${COINBOX_PATH}/coin-2.png`,
    `${COINBOX_PATH}/coin-3.png`,
    `${COINBOX_PATH}/coin-4.png`,
    `${COINBOX_PATH}/coin-5.png`,
    `${COINBOX_PATH}/coin-6.png`
  ];
  // ==========================================================
  // FIND PARTNERS
  // ==========================================================
  const partners =
    document.querySelectorAll(
      ".partner"
    );
  if (!partners.length) {
    return;
  }
  // ==========================================================
  // PRELOAD GAME IMAGES
  // Prevents first-time animation flicker.
  // ==========================================================
  const preloadAssets = [
    BOX_ACTIVE,
    BOX_USED,
    ...COIN_FRAMES
  ];
  preloadAssets.forEach(
    (src) => {
      const img =
        new Image();
      img.src = src;
    }
  );
  // ==========================================================
  // SHARED RETRO SOUND ENGINE
  // ==========================================================
  let audioContext = null;
  function getAudioContext() {
    try {
      if (!audioContext) {
        const AudioContext =
          window.AudioContext ||
          window.webkitAudioContext;
        if (!AudioContext) {
          return null;
        }
        audioContext =
          new AudioContext();
      }
      if (
        audioContext.state ===
        "suspended"
      ) {
        audioContext.resume();
      }
      return audioContext;
    } catch (error) {
      return null;
    }
  }
  // ==========================================================
  // COIN SOUND
  // ==========================================================
  const coinSound =
    new Audio(
      "public/sounds/coin-sound.mp3"
    );
  coinSound.preload = "auto";
  coinSound.volume = 0.15;
  function playCoinSound() {
    try {
      // Restart sound from beginning
      // every time the block is clicked.
      coinSound.currentTime = 0;
      coinSound
        .play()
        .catch(() => {});
    } catch (error) {
      // Sound is optional.
      // Game continues even if audio fails.
    }
  }
  // ==========================================================
  // QUESTION BLOCK ACTIVATION SOUND
  // ==========================================================
  function playBlockRevealSound() {
    const ctx =
      getAudioContext();
    if (!ctx) {
      return;
    }
    try {
      const oscillator =
        ctx.createOscillator();
      const gain =
        ctx.createGain();
      oscillator.type =
        "square";
      oscillator.connect(
        gain
      );
      gain.connect(
        ctx.destination
      );
      const now =
        ctx.currentTime;
      oscillator.frequency
        .setValueAtTime(
          330,
          now
        );
      oscillator.frequency
        .setValueAtTime(
          440,
          now + 0.07
        );
      oscillator.frequency
        .setValueAtTime(
          660,
          now + 0.14
        );
      gain.gain
        .setValueAtTime(
          0.02,
          now
        );
      gain.gain
        .exponentialRampToValueAtTime(
          0.0001,
          now + 0.23
        );
      oscillator.start(
        now
      );
      oscillator.stop(
        now + 0.24
      );
    } catch (error) {
      // Optional sound.
    }
  }
  // ==========================================================
  // EMPTY BLOCK SOUND
  // ==========================================================
  function playEmptyBlockSound() {
    const ctx =
      getAudioContext();
    if (!ctx) {
      return;
    }
    try {
      const oscillator =
        ctx.createOscillator();
      const gain =
        ctx.createGain();
      oscillator.type =
        "square";
      oscillator.connect(
        gain
      );
      gain.connect(
        ctx.destination
      );
      const now =
        ctx.currentTime;
      oscillator.frequency
        .setValueAtTime(
          260,
          now
        );
      oscillator.frequency
        .setValueAtTime(
          190,
          now + 0.08
        );
      gain.gain
        .setValueAtTime(
          0.018,
          now
        );
      gain.gain
        .exponentialRampToValueAtTime(
          0.0001,
          now + 0.18
        );
      oscillator.start(
        now
      );
      oscillator.stop(
        now + 0.19
      );
    } catch (error) {
      // Optional sound.
    }
  }
  // ==========================================================
  // INITIALIZE EACH PARTNER INDIVIDUALLY
  // ==========================================================
  partners.forEach(
    (partner) => {
      // Prevent accidental duplicate initialization.
      if (
        partner.dataset.coinBoxInitialized ===
        "true"
      ) {
        return;
      }
      partner.dataset.coinBoxInitialized =
        "true";
      // ------------------------------------------------------
      // ORIGINAL PARTNER LOGO
      // ------------------------------------------------------
      const partnerLogo =
        partner.querySelector(
          ":scope > img"
        );
      if (!partnerLogo) {
        return;
      }
      partnerLogo.classList.add(
        "partner-logo"
      );
      const partnerName =
        partnerLogo.alt ||
        "Partner";
      // ------------------------------------------------------
      // STATE
      // ------------------------------------------------------
      let partnerClickCount = 0;
      let coinCount = 0;
      let gameActive = false;
      let blockUsed = false;
      let gameBox = null;
      let usedBlockTimer = null;
      // ======================================================
      // ACCESSIBILITY
      // ======================================================
      partner.setAttribute(
        "tabindex",
        "0"
      );
      partner.setAttribute(
        "role",
        "button"
      );
      partner.setAttribute(
        "aria-label",
        partnerName
      );
      // ======================================================
      // NORMAL PARTNER CLICK
      // Must click logo 5 times.
      // ======================================================
      partner.addEventListener(
        "click",
        (event) => {
          // If game is active,
          // question block handles clicks.
          if (gameActive) {
            return;
          }
          partnerClickCount++;
          if (
            partnerClickCount >=
            REQUIRED_PARTNER_CLICKS
          ) {
            activateQuestionBlock();
          }
        }
      );
      // ======================================================
      // KEYBOARD SUPPORT
      // ======================================================
      partner.addEventListener(
        "keydown",
        (event) => {
          if (
            event.key !== "Enter" &&
            event.key !== " "
          ) {
            return;
          }
          event.preventDefault();
          if (!gameActive) {
            partnerClickCount++;
            if (
              partnerClickCount >=
              REQUIRED_PARTNER_CLICKS
            ) {
              activateQuestionBlock();
            }
            return;
          }
          if (
            gameActive &&
            !blockUsed
          ) {
            releaseCoin();
          }
        }
      );
      // ======================================================
      // ACTIVATE QUESTION BLOCK
      // ======================================================
      function activateQuestionBlock() {
        if (gameActive) {
          return;
        }
        gameActive = true;
        blockUsed = false;
        coinCount = 0;
        partner.classList.add(
          "partner-game-active"
        );
        partner.classList.remove(
          "partner-block-used"
        );
        partner.setAttribute(
          "aria-label",
          `${partnerName} hidden question block`
        );
        // ----------------------------------------------------
        // CREATE QUESTION BLOCK
        // ----------------------------------------------------
        gameBox =
          document.createElement(
            "img"
          );
        gameBox.src =
          BOX_ACTIVE;
        gameBox.alt =
          "Question block";
        gameBox.className =
          "partner-game-box";
        gameBox.draggable =
          false;
        gameBox.setAttribute(
          "aria-hidden",
          "true"
        );
        partner.appendChild(
          gameBox
        );
        playBlockRevealSound();
        // ----------------------------------------------------
        // BLOCK CLICK
        // ----------------------------------------------------
        gameBox.addEventListener(
          "click",
          (event) => {
            /*
            Critical:
            prevents click from bubbling
            back into .partner and changing
            the original 5-click counter.
            */
            event.preventDefault();
            event.stopPropagation();
            if (
              blockUsed ||
              !gameActive
            ) {
              return;
            }
            releaseCoin();
          }
        );
      }
      // ======================================================
      // RELEASE COIN
      // ======================================================
      function releaseCoin() {
        if (
          !gameActive ||
          blockUsed ||
          !gameBox ||
          coinCount >= MAX_COINS
        ) {
          return;
        }
        coinCount++;
        // ----------------------------------------------------
        // BLOCK BUMP
        // ----------------------------------------------------
        gameBox.classList.remove(
          "bump"
        );
        /*
        Force reflow so CSS animation
        restarts on every click.
        */
        void gameBox.offsetWidth;
        gameBox.classList.add(
          "bump"
        );
        // ----------------------------------------------------
        // CREATE ANIMATED ROTATING COIN
        // ----------------------------------------------------
        createAnimatedCoin();
        // ----------------------------------------------------
        // SOUND
        // ----------------------------------------------------
        playCoinSound();
        // ----------------------------------------------------
        // 10TH COIN
        // ----------------------------------------------------
        if (
          coinCount >=
          MAX_COINS
        ) {
          /*
          Lock immediately so rapid clicks
          cannot generate coin #11.
          */
          blockUsed = true;
          setTimeout(
            () => {
              switchToUsedBlock();
            },
            180
          );
        }
      }
      // ======================================================
      // CREATE ROTATING COIN
      // ======================================================
      function createAnimatedCoin() {
        const coin =
          document.createElement(
            "img"
          );
        coin.className =
          "partner-coin";
        coin.src =
          COIN_FRAMES[0];
        coin.alt = "";
        coin.draggable =
          false;
        coin.setAttribute(
          "aria-hidden",
          "true"
        );
        partner.appendChild(
          coin
        );
        // ----------------------------------------------------
        // ROTATING FRAME ANIMATION
        // ----------------------------------------------------
        let frameIndex = 0;
        const frameTimer =
          setInterval(
            () => {
              frameIndex =
                (
                  frameIndex + 1
                ) %
                COIN_FRAMES.length;
              coin.src =
                COIN_FRAMES[
                  frameIndex
                ];
            },
            COIN_FRAME_SPEED
          );
        // ----------------------------------------------------
        // REMOVE AFTER COIN FINISHES RISING
        // ----------------------------------------------------
        const cleanupCoin =
          () => {
            clearInterval(
              frameTimer
            );
            coin.remove();
          };
        coin.addEventListener(
          "animationend",
          cleanupCoin,
          {
            once: true
          }
        );
        /*
        Fallback in case animationend
        doesn't fire for any reason.
        */
        setTimeout(
          () => {
            if (
              coin.isConnected
            ) {
              cleanupCoin();
            }
          },
          1200
        );
      }
      // ======================================================
      // SWITCH TO BROWN / EMPTY BLOCK
      // ======================================================
      function switchToUsedBlock() {
        if (
          !gameActive ||
          !gameBox
        ) {
          return;
        }
        blockUsed = true;
        partner.classList.add(
          "partner-block-used"
        );
        gameBox.classList.remove(
          "bump"
        );
        gameBox.src =
          BOX_USED;
        gameBox.alt =
          "Used block";
        gameBox.style.cursor =
          "default";
        partner.setAttribute(
          "aria-label",
          `${partnerName} used coin block`
        );
        playEmptyBlockSound();
        // ----------------------------------------------------
        // USED BLOCK STAYS FOR 5 SECONDS
        // ----------------------------------------------------
        clearTimeout(
          usedBlockTimer
        );
        usedBlockTimer =
          setTimeout(
            () => {
              resetPartner();
            },
            USED_BLOCK_DURATION
          );
      }
      // ======================================================
      // RESET BACK TO ORIGINAL PARTNER LOGO
      // ======================================================
      function resetPartner() {
        clearTimeout(
          usedBlockTimer
        );
        usedBlockTimer = null;
        // Remove any coins still visible.
        partner
          .querySelectorAll(
            ".partner-coin"
          )
          .forEach(
            (coin) => {
              coin.remove();
            }
          );
        // Remove question / used block.
        if (gameBox) {
          gameBox.remove();
          gameBox = null;
        }
        // Remove game state classes.
        partner.classList.remove(
          "partner-game-active",
          "partner-block-used"
        );
        // Restore original state.
        partnerClickCount = 0;
        coinCount = 0;
        gameActive = false;
        blockUsed = false;
        partner.setAttribute(
          "aria-label",
          partnerName
        );
      }
    }
  );
})();
