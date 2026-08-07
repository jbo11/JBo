(() => {
  const TECH_URL = "./tech/";
  let running = false;

  const styles = `
    .tech-activation-overlay {
      position: fixed;
      inset: 0;
      z-index: 2147483647;
      display: grid;
      place-items: center;
      background:
        radial-gradient(
          circle at 50% 40%,
          rgba(56, 189, 248, .12),
          transparent 35%
        ),
        rgba(2, 6, 23, .97);
      color: #d9f8ff;
      font-family:
        ui-monospace,
        SFMono-Regular,
        Menlo,
        Monaco,
        Consolas,
        monospace;
      opacity: 0;
      animation: techOverlayIn .25s ease forwards;
      overflow: hidden;
    }

    .tech-activation-overlay::before {
      content: "";
      position: absolute;
      inset: 0;
      pointer-events: none;
      background: repeating-linear-gradient(
        to bottom,
        rgba(255,255,255,.028) 0,
        rgba(255,255,255,.028) 1px,
        transparent 1px,
        transparent 4px
      );
      mix-blend-mode: overlay;
    }

    .tech-activation-overlay::after {
      content: "";
      position: absolute;
      inset: -20%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(56,189,248,.08),
        transparent
      );
      transform: translateX(-70%);
      animation: techScan 1.35s ease-in-out infinite;
    }

    .tech-activation-panel {
      width: min(680px, calc(100vw - 36px));
      padding: 36px;
      border: 1px solid rgba(103, 232, 249, .34);
      background: rgba(2, 10, 24, .82);

      box-shadow:
        0 0 0 1px rgba(56,189,248,.05),
        0 30px 100px rgba(0,0,0,.55),
        0 0 70px rgba(56,189,248,.1);

      position: relative;
      z-index: 1;

      backdrop-filter: blur(18px);
    }

    .tech-activation-kicker {
      color: #67e8f9;
      font-size: 12px;
      letter-spacing: .22em;
      text-transform: uppercase;
      margin-bottom: 16px;
    }

    .tech-activation-title {
      margin: 0;
      color: #f8fdff;
      font-family: inherit;

      font-size: clamp(
        28px,
        7vw,
        58px
      );

      line-height: .94;
      letter-spacing: -.04em;
      text-transform: uppercase;

      text-shadow:
        2px 0 #22d3ee,
        -2px 0 #8b5cf6;

      animation:
        techGlitch .65s
        steps(2, end)
        2;
    }

    .tech-activation-copy {
      margin: 18px 0 26px;
      color: #8ba9b5;
      line-height: 1.65;
      font-size: 13px;
    }

    .tech-activation-log {
      display: grid;
      gap: 8px;
      margin-bottom: 24px;

      color: #9defff;
      font-size: 12px;

      min-height: 76px;
    }

    .tech-activation-log span {
      opacity: 0;
      animation:
        techLine .18s
        ease forwards;
    }

    .tech-activation-progress {
      height: 4px;
      background:
        rgba(148,163,184,.13);
      overflow: hidden;
    }

    .tech-activation-progress span {
      display: block;
      height: 100%;
      width: 0;

      background:
        linear-gradient(
          90deg,
          #22d3ee,
          #8b5cf6
        );

      box-shadow:
        0 0 18px #22d3ee;

      animation:
        techLoad
        1.75s
        cubic-bezier(.45,0,.15,1)
        forwards;
    }

    .tech-activation-code {
      margin-top: 12px;
      color: #46616d;
      font-size: 10px;
      letter-spacing: .08em;
    }

    @keyframes techOverlayIn {
      to {
        opacity: 1;
      }
    }

    @keyframes techLine {
      to {
        opacity: 1;
      }
    }

    @keyframes techLoad {
      to {
        width: 100%;
      }
    }

    @keyframes techScan {
      50% {
        transform: translateX(70%);
      }

      100% {
        transform: translateX(70%);
      }
    }

    @keyframes techGlitch {
      0%,
      100% {
        transform: translate(0);
      }

      20% {
        transform: translate(-2px, 1px);
      }

      40% {
        transform: translate(2px, -1px);
      }

      60% {
        transform: translate(1px, 1px);
      }

      80% {
        transform: translate(-1px, -1px);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .tech-activation-overlay,
      .tech-activation-overlay::after,
      .tech-activation-title,
      .tech-activation-log span,
      .tech-activation-progress span {
        animation: none !important;
      }

      .tech-activation-overlay,
      .tech-activation-log span {
        opacity: 1;
      }

      .tech-activation-progress span {
        width: 100%;
      }
    }
  `;

  function ensureStyles() {
    if (
      document.getElementById(
        "tech-activation-styles"
      )
    ) {
      return;
    }

    const style =
      document.createElement("style");

    style.id =
      "tech-activation-styles";

    style.textContent = styles;

    document.head.appendChild(style);
  }

  function beep(
    frequency = 680,
    duration = .07,
    volume = .025
  ) {
    try {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) return;

      const ctx =
        new AudioContext();

      const osc =
        ctx.createOscillator();

      const gain =
        ctx.createGain();

      osc.type = "sine";

      osc.frequency.value =
        frequency;

      gain.gain.value =
        volume;

      osc.connect(gain);

      gain.connect(
        ctx.destination
      );

      osc.start();

      gain.gain.exponentialRampToValueAtTime(
        .0001,
        ctx.currentTime + duration
      );

      osc.stop(
        ctx.currentTime + duration
      );

      osc.addEventListener(
        "ended",
        () => ctx.close()
      );
    } catch (_) {}
  }

  function start() {
    if (running) return;

    running = true;

    ensureStyles();

    document
      .querySelectorAll(".gravity-layer")
      .forEach((el) => el.remove());

    const overlay =
      document.createElement("div");

    overlay.className =
      "tech-activation-overlay";

    overlay.setAttribute(
      "role",
      "dialog"
    );

    overlay.setAttribute(
      "aria-modal",
      "true"
    );

    overlay.setAttribute(
      "aria-label",
      "Tech Profile Activated"
    );

    overlay.innerHTML = `
      <div class="tech-activation-panel">

        <div class="tech-activation-kicker">
          // hidden profile access
        </div>

        <h2 class="tech-activation-title">
          Tech Profile<br>
          Activated
        </h2>

        <p class="tech-activation-copy">
          Konami sequence accepted.
          Switching from remote-support
          profile to digital systems
          interface.
        </p>

        <div
          class="tech-activation-log"
          aria-live="polite"
        >

          <span
            style="animation-delay:.12s"
          >
            [01] validating access token...
            accepted
          </span>

          <span
            style="animation-delay:.42s"
          >
            [02] mounting project archive...
            ready
          </span>

          <span
            style="animation-delay:.78s"
          >
            [03] initializing developer
            interface...
          </span>

        </div>

        <div
          class="tech-activation-progress"
        >
          <span></span>
        </div>

        <div class="tech-activation-code">
          ACCESS: JB-TECH //
          MODE: DEVELOPER //
          STATUS: GRANTED
        </div>

      </div>
    `;

    document.body.appendChild(
      overlay
    );

    try {
      const cue =
        new Audio(
          "./tech/sounds/activate.mp3"
        );

      cue.volume = .32;

      cue.play().catch(() => {
        beep(520, .08);

        setTimeout(
          () => beep(710, .08),
          220
        );

        setTimeout(
          () => beep(940, .14),
          620
        );
      });

    } catch (_) {
      beep(520, .08);
    }

    const redirect = () => {
      window.location.assign(
        TECH_URL
      );
    };

    const reduceMotion =
      window
        .matchMedia?.(
          "(prefers-reduced-motion: reduce)"
        )
        .matches;

    setTimeout(
      redirect,
      reduceMotion
        ? 650
        : 2050
    );
  }

  window.TechProfileActivation = {
    start
  };
})();