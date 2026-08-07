(() => {
  const canvas =
    document.getElementById(
      "particleCanvas"
    );

  if (!canvas) return;

  const ctx =
    canvas.getContext("2d");

  const reduceMotion =
    window
      .matchMedia?.(
        "(prefers-reduced-motion: reduce)"
      )
      .matches;

  let particles = [];

  let width = 0;
  let height = 0;

  let raf = 0;

  function resize() {
    const dpr =
      Math.min(
        window.devicePixelRatio || 1,
        2
      );

    width =
      window.innerWidth;

    height =
      window.innerHeight;

    canvas.width =
      width * dpr;

    canvas.height =
      height * dpr;

    canvas.style.width =
      `${width}px`;

    canvas.style.height =
      `${height}px`;

    ctx.setTransform(
      dpr,
      0,
      0,
      dpr,
      0,
      0
    );

    const count =
      Math.min(
        70,
        Math.max(
          24,
          Math.floor(
            width / 22
          )
        )
      );

    particles =
      Array.from(
        {
          length: count
        },
        () => ({
          x:
            Math.random() *
            width,

          y:
            Math.random() *
            height,

          r:
            Math.random() *
            1.3 +
            .3,

          vx:
            (Math.random() - .5) *
            .14,

          vy:
            (Math.random() - .5) *
            .14,

          a:
            Math.random() *
            .45 +
            .08
        })
      );
  }

  function draw() {
    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    for (
      const p
      of particles
    ) {
      p.x += p.vx;

      p.y += p.vy;

      if (p.x < -10) {
        p.x =
          width + 10;
      }

      if (
        p.x >
        width + 10
      ) {
        p.x = -10;
      }

      if (p.y < -10) {
        p.y =
          height + 10;
      }

      if (
        p.y >
        height + 10
      ) {
        p.y = -10;
      }

      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        p.r,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(
          103,
          232,
          249,
          ${p.a}
        )`;

      ctx.fill();
    }

    raf =
      requestAnimationFrame(
        draw
      );
  }

  resize();

  window.addEventListener(
    "resize",
    resize
  );

  if (reduceMotion) {
    drawStatic();
  } else {
    draw();
  }

  function drawStatic() {
    ctx.clearRect(
      0,
      0,
      width,
      height
    );

    for (
      const p
      of particles
    ) {
      ctx.beginPath();

      ctx.arc(
        p.x,
        p.y,
        p.r,
        0,
        Math.PI * 2
      );

      ctx.fillStyle =
        `rgba(
          103,
          232,
          249,
          ${p.a}
        )`;

      ctx.fill();
    }
  }

  window.addEventListener(
    "beforeunload",
    () => {
      cancelAnimationFrame(
        raf
      );
    }
  );
})();