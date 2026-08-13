(() => {
  const reduceMotion =
    window
      .matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )
      .matches;
  // ============================================================
  // BOOT TRANSITION
  // ============================================================
  const boot =
    document.getElementById(
      "bootScreen"
    );
  window.addEventListener(
    "load",
    () => {
      setTimeout(
        () =>
          boot?.classList.add(
            "boot-complete"
          ),
        reduceMotion
          ? 0
          : 3000
      );
    }
  );
  // ============================================================
  // REVEAL ON SCROLL
  // ============================================================
  const revealItems =
    document.querySelectorAll(
      ".reveal"
    );
  if (
    reduceMotion ||
    !(
      "IntersectionObserver"
      in window
    )
  ) {
    revealItems.forEach(
      (el) =>
        el.classList.add(
          "revealed"
        )
    );
  } else {
    const observer =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                entry.isIntersecting
              ) {
                entry.target
                  .classList.add(
                    "revealed"
                  );
                observer.unobserve(
                  entry.target
                );
              }
            }
          );
        },
        {
          threshold: .12
        }
      );
    revealItems.forEach(
      (el) =>
        observer.observe(el)
    );
  }
  // ============================================================
  // ACTIVE NAVIGATION
  // ============================================================
  const navLinks = [
    ...document.querySelectorAll(
      '.desktop-nav a[href^="#"]'
    )
  ];
  const sections =
    navLinks
      .map((a) =>
        document.querySelector(
          a.getAttribute(
            "href"
          )
        )
      )
      .filter(Boolean);
  if (
    "IntersectionObserver"
    in window
  ) {
    const navObserver =
      new IntersectionObserver(
        (entries) => {
          entries.forEach(
            (entry) => {
              if (
                !entry.isIntersecting
              ) {
                return;
              }
              navLinks.forEach(
                (a) => {
                  a.classList.toggle(
                    "active",
                    a.getAttribute(
                      "href"
                    ) ===
                      `#${entry.target.id}`
                  );
                }
              );
            }
          );
        },
        {
          rootMargin:
            "-35% 0px -55% 0px"
        }
      );
    sections.forEach(
      (section) =>
        navObserver.observe(
          section
        )
    );
  }
  // ============================================================
  // MOBILE MENU
  // ============================================================
  const menuBtn =
    document.getElementById(
      "menuBtn"
    );
  const mobileMenu =
    document.getElementById(
      "mobileMenu"
    );
  function setMenu(open) {
    mobileMenu
      ?.classList.toggle(
        "open",
        open
      );
    mobileMenu
      ?.setAttribute(
        "aria-hidden",
        String(!open)
      );
    menuBtn
      ?.setAttribute(
        "aria-expanded",
        String(open)
      );
    menuBtn
      ?.setAttribute(
        "aria-label",
        open
          ? "Close tech navigation"
          : "Open tech navigation"
      );
    if (menuBtn) {
      menuBtn.textContent =
        open
          ? "CLOSE"
          : "MENU";
    }
    document.body
      .classList.toggle(
        "menu-open",
        open
      );
  }
  menuBtn
    ?.addEventListener(
      "click",
      () => {
        setMenu(
          !mobileMenu
            ?.classList
            .contains(
              "open"
            )
        );
      }
    );
  mobileMenu
    ?.querySelectorAll("a")
    .forEach((a) => {
      a.addEventListener(
        "click",
        () =>
          setMenu(false)
      );
    });
  window.addEventListener(
    "resize",
    () => {
      if (
        window.innerWidth >
        1120
      ) {
        setMenu(false);
      }
    }
  );
  // ============================================================
  // PROJECT ARCHIVE
  // ============================================================
  const grid =
    document.getElementById(
      "projectGrid"
    );
  const modal =
    document.getElementById(
      "projectModal"
    );
  const modalContent =
    document.getElementById(
      "projectModalContent"
    );
  const modalClose =
    document.getElementById(
      "modalClose"
    );
  const projects =
    window.TECH_PROJECTS ||
    [];
  if (grid) {
    grid.innerHTML =
      projects
        .map(
          (p) => `
            <button
              class="project-card reveal"
              data-project="${p.id}"
              type="button"
            >
              <div
                class="project-card-top"
              >
                <span>
                  ${p.number}
                </span>
                <em>
                  ${p.status}
                </em>
              </div>
              <div
                class="project-card-body"
              >
                <small>
                  ${p.label}
                </small>
                <h3>
                  ${p.title}
                </h3>
                <p>
                  ${p.summary}
                </p>
              </div>
              <div
                class="project-card-footer"
              >
                <span>
                  ${
                    p.technologies
                      .slice(0, 3)
                      .join(" // ")
                  }
                </span>
                <b>
                  OPEN FILE ↗
                </b>
              </div>
            </button>
          `
        )
        .join("");
    // Project cards are dynamically created,
    // so observe them separately.
    grid
      .querySelectorAll(
        ".reveal"
      )
      .forEach(
        (el) => {
          if (
            reduceMotion
          ) {
            el.classList.add(
              "revealed"
            );
            return;
          }
          const obs =
            new IntersectionObserver(
              ([entry]) => {
                if (
                  entry.isIntersecting
                ) {
                  el.classList.add(
                    "revealed"
                  );
                  obs.disconnect();
                }
              },
              {
                threshold: .1
              }
            );
          obs.observe(el);
        }
      );
  }
  // ============================================================
  // OPEN PROJECT
  // ============================================================
  function openProject(id) {
    const p =
      projects.find(
        (item) =>
          item.id === id
      );
    if (
      !p ||
      !modal ||
      !modalContent
    ) {
      return;
    }
    modalContent.innerHTML = `
      <div
        class="modal-kicker"
      >
        PROJECT FILE //
        ${p.number}
      </div>
      <div
        class="modal-status"
      >
        ${p.status}
      </div>
      <h2>
        ${p.title}
      </h2>
      <p
        class="modal-summary"
      >
        ${p.summary}
      </p>
      <div
        class="modal-tags"
      >
        ${
          p.technologies
            .map(
              (technology) =>
                `<span>${technology}</span>`
            )
            .join("")
        }
      </div>
      <div
        class="modal-grid"
      >
        <div>
          <small>
            CHALLENGE
          </small>
          <p>
            ${p.challenge}
          </p>
        </div>
        <div>
          <small>
            APPROACH
          </small>
          <p>
            ${p.approach}
          </p>
        </div>
        <div>
          <small>
            OPERATIONAL VALUE
          </small>
          <p>
            ${p.impact}
          </p>
        </div>
      </div>
    `;
    if (
      typeof modal.showModal ===
      "function"
    ) {
      modal.showModal();
    } else {
      modal.setAttribute(
        "open",
        ""
      );
    }
    document.body
      .classList.add(
        "modal-open"
      );
  }
  grid
    ?.addEventListener(
      "click",
      (e) => {
        const card =
          e.target.closest(
            "[data-project]"
          );
        if (!card) return;
        window.TechSound
          ?.open?.();
        openProject(
          card.dataset.project
        );
      }
    );
  // ============================================================
  // CLOSE PROJECT MODAL
  // ============================================================
  function closeModal() {
    window.TechSound
      ?.close?.();
    if (
      modal?.open &&
      typeof modal.close ===
        "function"
    ) {
      modal.close();
    } else {
      modal?.removeAttribute(
        "open"
      );
    }
    document.body
      .classList.remove(
        "modal-open"
      );
  }
  modalClose
    ?.addEventListener(
      "click",
      closeModal
    );
  modal
    ?.addEventListener(
      "click",
      (e) => {
        if (
          e.target === modal
        ) {
          closeModal();
        }
      }
    );
  modal
    ?.addEventListener(
      "close",
      () => {
        document.body
          .classList.remove(
            "modal-open"
          );
      }
    );
  // ============================================================
  // 3D ORBITAL
  // Desktop: pointer parallax
  // Touch: autonomous orbit handled by CSS
  // ============================================================
  const orbital =
    document.getElementById(
      "orbitalCard"
    );
  const canTilt =
    window
      .matchMedia?.(
        "(hover: hover) and (pointer: fine)"
      )
      .matches;
  if (
    orbital &&
    !reduceMotion
  ) {
    // =========================================
    // DESKTOP — MOUSE PARALLAX
    // =========================================
    if (canTilt) {
      orbital.classList.add(
        "orbital-pointer-mode"
      );
      orbital.addEventListener(
        "pointermove",
        (e) => {
          const rect =
            orbital
              .getBoundingClientRect();
          const rx =
            (
              (
                e.clientY -
                rect.top
              ) /
                rect.height -
              0.5
            ) * -7;
          const ry =
            (
              (
                e.clientX -
                rect.left
              ) /
                rect.width -
              0.5
            ) * 7;
          orbital.style.transform =
            `
              perspective(1000px)
              rotateX(${rx}deg)
              rotateY(${ry}deg)
            `;
        }
      );
      orbital.addEventListener(
        "pointerleave",
        () => {
          orbital.style.transform =
            `
              perspective(1000px)
              rotateX(0deg)
              rotateY(0deg)
            `;
        }
      );
    }
    // =========================================
    // TOUCH — AUTOMATIC ORBIT
    // =========================================
    else {
      orbital.classList.add(
        "orbital-auto-mode"
      );
    }
  }
  // ============================================================
  // SOUND INTERACTIONS
  // ============================================================
  const soundToggle =
    document.getElementById(
      "soundToggle"
    );
  function updateSoundButton() {
    if (!soundToggle) return;
    const enabled =
      window.TechSound
        ?.isEnabled?.();
    soundToggle.textContent =
      enabled
        ? "SOUND: ON"
        : "SOUND: OFF";
    soundToggle.setAttribute(
      "aria-pressed",
      String(Boolean(enabled))
    );
  }
  soundToggle
    ?.addEventListener(
      "click",
      () => {
        window.TechSound
          ?.toggle?.();
        updateSoundButton();
      }
    );
  updateSoundButton();
  // Only use hover sounds where hover
  // actually exists.
  const canHover =
    window
      .matchMedia?.(
        "(hover: hover)"
      )
      .matches;
  if (canHover) {
    document
      .querySelectorAll(
        "a, button"
      )
      .forEach(
        (element) => {
          element.addEventListener(
            "mouseenter",
            () => {
              window.TechSound
                ?.hover?.();
            }
          );
        }
      );
  }
  document
    .querySelectorAll(
      "a, button"
    )
    .forEach(
      (element) => {
        element.addEventListener(
          "click",
          () => {
            window.TechSound
              ?.click?.();
          }
        );
      }
    );
  // ============================================================
  // MATRIX VISUAL COMMAND
  // ============================================================
  const matrixLayer =
    document.getElementById(
      "matrixLayer"
    );
  const matrixCanvas =
    document.getElementById(
      "matrixCanvas"
    );
  const matrixClose =
    document.getElementById(
      "matrixClose"
    );
  let matrixRaf = 0;
  function startMatrix() {
    if (
      !matrixLayer ||
      !matrixCanvas
    ) {
      return;
    }
    cancelAnimationFrame(
      matrixRaf
    );
    matrixLayer
      .classList.add(
        "active"
      );
    document.body
      .classList.add(
        "matrix-open"
      );
    const ctx =
      matrixCanvas
        .getContext("2d");
    if (!ctx) return;
    const fontSize =
      window.innerWidth <
      600
        ? 12
        : 15;
    let columns = 0;
    let drops = [];
    const resizeMatrix =
      () => {
        const dpr =
          Math.min(
            window.devicePixelRatio ||
              1,
            2
          );
        const width =
          window.innerWidth;
        const height =
          window.innerHeight;
        matrixCanvas.width =
          width * dpr;
        matrixCanvas.height =
          height * dpr;
        matrixCanvas.style.width =
          `${width}px`;
        matrixCanvas.style.height =
          `${height}px`;
        ctx.setTransform(
          dpr,
          0,
          0,
          dpr,
          0,
          0
        );
        columns =
          Math.ceil(
            width /
              fontSize
          );
        drops =
          Array(columns)
            .fill(1);
      };
    resizeMatrix();
    const chars =
      "01JB<>/{}[]#@$%&*+=TECHSYSTEM";
    const draw = () => {
      const width =
        window.innerWidth;
      const height =
        window.innerHeight;
      ctx.fillStyle =
        "rgba(2, 6, 23, .08)";
      ctx.fillRect(
        0,
        0,
        width,
        height
      );
      ctx.fillStyle =
        "rgba(103,232,249,.75)";
      ctx.font =
        `${fontSize}px IBM Plex Mono, monospace`;
      for (
        let i = 0;
        i < drops.length;
        i++
      ) {
        const char =
          chars[
            Math.floor(
              Math.random() *
                chars.length
            )
          ];
        ctx.fillText(
          char,
          i * fontSize,
          drops[i] *
            fontSize
        );
        if (
          drops[i] *
            fontSize >
            height &&
          Math.random() >
            .975
        ) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      matrixRaf =
        requestAnimationFrame(
          draw
        );
    };
    draw();
  }
  function stopMatrix() {
    cancelAnimationFrame(
      matrixRaf
    );
    matrixLayer
      ?.classList.remove(
        "active"
      );
    document.body
      .classList.remove(
        "matrix-open"
      );
  }
  window.addEventListener(
    "tech:matrix",
    () => {
      window.TechSound
        ?.matrix?.();
      startMatrix();
    }
  );
  matrixClose
    ?.addEventListener(
      "click",
      stopMatrix
    );
  // ============================================================
  // ESCAPE HANDLING
  // ============================================================
  document.addEventListener(
    "keydown",
    (e) => {
      if (
        e.key !== "Escape"
      ) {
        return;
      }
      if (
        matrixLayer
          ?.classList
          .contains(
            "active"
          )
      ) {
        stopMatrix();
        return;
      }
      if (
        modal?.open
      ) {
        closeModal();
        return;
      }
      if (
        mobileMenu
          ?.classList
          .contains(
            "open"
          )
      ) {
        setMenu(false);
      }
    }
  );
})();