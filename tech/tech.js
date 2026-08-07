(() => {
  const reduceMotion =
    window
      .matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )
      .matches;

  // =========================================
  // BOOT TRANSITION
  // =========================================

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
          : 450
      );
    }
  );


  // =========================================
  // REVEAL ON SCROLL
  // =========================================

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


  // =========================================
  // ACTIVE NAVIGATION
  // =========================================

  const navLinks = [
    ...document.querySelectorAll(
      '.desktop-nav a[href^="#"]'
    )
  ];

  const sections =
    navLinks
      .map(
        (a) =>
          document.querySelector(
            a.getAttribute(
              "href"
            )
          )
      )
      .filter(Boolean);

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
    (s) =>
      navObserver.observe(s)
  );


  // =========================================
  // MOBILE MENU
  // =========================================

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
            .classList
            .contains(
              "open"
            )
        );

      }
    );

  mobileMenu
    ?.querySelectorAll("a")
    .forEach(
      (a) => {

        a.addEventListener(
          "click",
          () =>
            setMenu(false)
        );

      }
    );


  // =========================================
  // PROJECT ARCHIVE
  // =========================================

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


    // Observe dynamically-created
    // project cards.

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

          } else {

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

        }
      );
  }


  // =========================================
  // OPEN PROJECT MODAL
  // =========================================

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
              (t) =>
                `<span>${t}</span>`
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

    modal.showModal();

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

        if (card) {

          openProject(
            card.dataset.project
          );

        }

      }
    );


  // =========================================
  // CLOSE PROJECT MODAL
  // =========================================

  function closeModal() {

    modal?.close();

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


  // =========================================
  // 3D POINTER PARALLAX
  // =========================================

  const orbital =
    document.getElementById(
      "orbitalCard"
    );

  if (
    orbital &&
    !reduceMotion
  ) {

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
            .5
          ) *
          -7;

        const ry =
          (
            (
              e.clientX -
              rect.left
            ) /
            rect.width -
            .5
          ) *
          7;

        orbital.style.transform =
          `perspective(1000px)
          rotateX(${rx}deg)
          rotateY(${ry}deg)`;

      }
    );

    orbital.addEventListener(
      "pointerleave",
      () => {

        orbital.style.transform =
          "";

      }
    );

  }


  // =========================================
  // MATRIX VISUAL COMMAND
  // =========================================

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

    matrixLayer
      .classList.add(
        "active"
      );

    const ctx =
      matrixCanvas
        .getContext("2d");

    const fontSize =
      15;

    let columns =
      0;

    let drops =
      [];


    const resize = () => {

      const dpr =
        Math.min(
          window.devicePixelRatio ||
          1,
          2
        );

      matrixCanvas.width =
        innerWidth *
        dpr;

      matrixCanvas.height =
        innerHeight *
        dpr;

      matrixCanvas.style.width =
        `${innerWidth}px`;

      matrixCanvas.style.height =
        `${innerHeight}px`;

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
          innerWidth /
          fontSize
        );

      drops =
        Array(columns)
          .fill(1);
    };


    resize();


    const chars =
      "01JB<>/{}[]#@$%&*+=TECHSYSTEM";


    const draw = () => {

      ctx.fillStyle =
        "rgba(2, 6, 23, .08)";

      ctx.fillRect(
        0,
        0,
        innerWidth,
        innerHeight
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
            innerHeight &&
          Math.random() >
            .975
        ) {

          drops[i] =
            0;

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

  }


  window.addEventListener(
    "tech:matrix",
    startMatrix
  );


  matrixClose
    ?.addEventListener(
      "click",
      stopMatrix
    );


  document.addEventListener(
    "keydown",
    (e) => {

      if (
        e.key === "Escape" &&
        matrixLayer
          ?.classList
          .contains(
            "active"
          )
      ) {

        stopMatrix();

      }

    }
  );

})();