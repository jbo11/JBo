(() => {
  const fp =
    document.getElementById(
      "fullpage-works"
    );
  if (!fp) return;
  const sections =
    Array.from(
      fp.querySelectorAll(
        ".page"
      )
    );
  if (!sections.length) {
    return;
  }
  const desktopQuery =
    window.matchMedia(
      "(min-width: 901px)"
    );
  const reduceMotion =
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  let current = 0;
  let isAnimating =
    false;
  let wheelTimer =
    null;
  let touchStartY =
    null;
  // ============================================================
  // HELPERS
  // ============================================================
  function isDesktop() {
    return desktopQuery.matches;
  }
  function clampIndex(index) {
    return Math.max(
      0,
      Math.min(
        index,
        sections.length - 1
      )
    );
  }
  function updateClasses() {
    sections.forEach(
      (section, index) => {
        section.classList.toggle(
          "is-active",
          index === current
        );
      }
    );
  }
  // ============================================================
  // SET ACTIVE PAGE
  // ============================================================
  function setActive(
    index,
    options = {}
  ) {
    const {
      scrollMobile = true
    } = options;
    current =
      clampIndex(index);
    updateClasses();
    // ========================================================
    // DESKTOP
    // ========================================================
    if (isDesktop()) {
      const offset =
        current *
        window.innerHeight;
      fp.style.transform =
        `translate3d(
          0,
          -${offset}px,
          0
        )`;
      return;
    }
    // ========================================================
    // MOBILE
    // ========================================================
    fp.style.transform =
      "none";
    if (scrollMobile) {
      sections[current]
        .scrollIntoView({
          behavior:
            reduceMotion
              ? "auto"
              : "smooth",
          block:
            "start"
        });
    }
  }
  // ============================================================
  // DESKTOP WHEEL
  // ============================================================
  window.addEventListener(
    "wheel",
    (event) => {
      if (!isDesktop()) {
        return;
      }
      /*
        Don't intercept typing /
        form controls.
      */
      if (
        event.target.closest(
          "input, textarea, select, [contenteditable='true']"
        )
      ) {
        return;
      }
      /*
        Important:
        We DO NOT exclude <a>
        elements anymore.
        Your old code did this:
        if (e.target.closest("a")) return;
        which meant desktop scrolling
        stopped whenever the cursor
        was over a project card.
      */
      if (
        Math.abs(
          event.deltaY
        ) < 35
      ) {
        return;
      }
      event.preventDefault();
      if (isAnimating) {
        return;
      }
      isAnimating =
        true;
      if (
        event.deltaY > 0
      ) {
        setActive(
          current + 1
        );
      } else {
        setActive(
          current - 1
        );
      }
      clearTimeout(
        wheelTimer
      );
      wheelTimer =
        setTimeout(
          () => {
            isAnimating =
              false;
          },
          850
        );
    },
    {
      passive: false
    }
  );
  // ============================================================
  // DESKTOP KEYBOARD
  // ============================================================
  document.addEventListener(
    "keydown",
    (event) => {
      if (!isDesktop()) {
        return;
      }
      const tag =
        event.target
          ?.tagName
          ?.toLowerCase();
      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select"
      ) {
        return;
      }
      switch (
        event.key
      ) {
        case "ArrowDown":
        case "PageDown":
        case " ":
          event.preventDefault();
          setActive(
            current + 1
          );
          break;
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          setActive(
            current - 1
          );
          break;
        case "Home":
          event.preventDefault();
          setActive(0);
          break;
        case "End":
          event.preventDefault();
          setActive(
            sections.length - 1
          );
          break;
      }
    }
  );
  // ============================================================
  // GALLERY ARROWS
  // ============================================================
  document
    .querySelectorAll(
      ".arrow-down"
    )
    .forEach(
      (button) => {
        /*
          Your markup currently uses
          <div>. Give it button-like
          accessibility automatically.
        */
        if (
          button.tagName !==
          "BUTTON"
        ) {
          button.setAttribute(
            "role",
            "button"
          );
          button.setAttribute(
            "tabindex",
            "0"
          );
        }
        button.setAttribute(
          "aria-label",
          "Next project section"
        );
        const activate = () => {
          setActive(
            current + 1
          );
        };
        button.addEventListener(
          "click",
          activate
        );
        button.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key ===
                "Enter" ||
              event.key ===
                " "
            ) {
              event.preventDefault();
              activate();
            }
          }
        );
      }
    );
  document
    .querySelectorAll(
      ".arrow-up"
    )
    .forEach(
      (button) => {
        if (
          button.tagName !==
          "BUTTON"
        ) {
          button.setAttribute(
            "role",
            "button"
          );
          button.setAttribute(
            "tabindex",
            "0"
          );
        }
        button.setAttribute(
          "aria-label",
          "Previous project section"
        );
        const activate = () => {
          setActive(
            current - 1
          );
        };
        button.addEventListener(
          "click",
          activate
        );
        button.addEventListener(
          "keydown",
          (event) => {
            if (
              event.key ===
                "Enter" ||
              event.key ===
                " "
            ) {
              event.preventDefault();
              activate();
            }
          }
        );
      }
    );
  // ============================================================
  // TOUCH SWIPE
  //
  // Only used when viewport is
  // desktop-width.
  //
  // Mobile gets natural scrolling.
  // ============================================================
  window.addEventListener(
    "touchstart",
    (event) => {
      if (!isDesktop()) {
        return;
      }
      touchStartY =
        event.touches[0]
          .clientY;
    },
    {
      passive: true
    }
  );
  window.addEventListener(
    "touchend",
    (event) => {
      if (
        !isDesktop() ||
        touchStartY === null
      ) {
        return;
      }
      const touchEndY =
        event.changedTouches[0]
          .clientY;
      const difference =
        touchStartY -
        touchEndY;
      touchStartY =
        null;
      if (
        Math.abs(
          difference
        ) < 60
      ) {
        return;
      }
      if (
        difference > 0
      ) {
        setActive(
          current + 1
        );
      } else {
        setActive(
          current - 1
        );
      }
    },
    {
      passive: true
    }
  );
  // ============================================================
  // MOBILE SCROLL TRACKING
  //
  // Keeps "current" accurate when
  // the visitor manually scrolls.
  // ============================================================
  if (
    "IntersectionObserver"
    in window
  ) {
    const observer =
      new IntersectionObserver(
        (entries) => {
          if (isDesktop()) {
            return;
          }
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }
              const index =
                sections.indexOf(
                  entry.target
                );
              if (
                index !== -1
              ) {
                current =
                  index;
                updateClasses();
              }
            }
          );
        },
        {
          rootMargin:
            "-35% 0px -35% 0px",
          threshold:
            0
        }
      );
    sections.forEach(
      (section) => {
        observer.observe(
          section
        );
      }
    );
  }
  // ============================================================
  // RESPONSIVE MODE SWITCH
  // ============================================================
  function syncMode() {
    isAnimating =
      false;
    clearTimeout(
      wheelTimer
    );
    if (
      isDesktop()
    ) {
      /*
        Enter desktop full-page
        mode.
      */
      setActive(
        current,
        {
          scrollMobile: false
        }
      );
    } else {
      /*
        Remove the transform
        completely.
        This is what makes mobile
        a normal scrolling page.
      */
      fp.style.transform =
        "none";
    }
  }
  if (
    desktopQuery
      .addEventListener
  ) {
    desktopQuery
      .addEventListener(
        "change",
        syncMode
      );
  } else {
    desktopQuery
      .addListener(
        syncMode
      );
  }
  // ============================================================
  // RESIZE
  // ============================================================
  let resizeTimer;
  window.addEventListener(
    "resize",
    () => {
      clearTimeout(
        resizeTimer
      );
      resizeTimer =
        setTimeout(
          () => {
            if (
              isDesktop()
            ) {
              setActive(
                current,
                {
                  scrollMobile:
                    false
                }
              );
            } else {
              fp.style.transform =
                "none";
            }
          },
          80
        );
    }
  );
  // ============================================================
  // INITIALIZE
  // ============================================================
  updateClasses();
  syncMode();
})();
// ============================================================
// LOAD SAVED ACCENT COLOR
// ============================================================
(() => {
  const DEFAULT_ACCENT = "#f4ca30";
  const savedAccent =
    localStorage.getItem("accent") ||
    DEFAULT_ACCENT;
  document.documentElement.style.setProperty(
    "--accent",
    savedAccent
  );
})();