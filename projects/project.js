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

// ====================================================================================================================================================================================

/* ============================================================
   INTERACTIVE SPHERE IMAGE GALLERY
   Vanilla JavaScript
   ============================================================ */

/* ============================================================
   GALLERY IMAGE AUTO-DETECTION
   Supports mixed PNG / JPG / JPEG / GIF
============================================================ */

let imagePaths = [];

const galleryBaseURL =
  "https://file.garden/ae-SQnRY3UKpjLFX/JBo-websites/Gallery";

const galleryImageCount = 59;

const galleryExtensions = [
  "png",
  "jpg",
  "jpeg",
  "gif"
];


/* Test whether an image URL exists */
function testImageURL(url) {
  return new Promise((resolve) => {

    const img = new Image();

    img.onload = () => resolve(url);

    img.onerror = () => resolve(null);

    img.src = url;

  });
}


/* Find the correct extension for one image */
async function findGalleryImage(number) {

  for (const extension of galleryExtensions) {

    const url =
      `${galleryBaseURL}/image-${number}.${extension}`;

    const validURL =
      await testImageURL(url);

    if (validURL) {
      return validURL;
    }

  }

  console.warn(
    `Gallery image-${number} was not found.`
  );

  return null;
}


/* Build the complete image list */
async function buildGalleryImagePaths() {

  const searches = [];

  for (
    let i = 1;
    i <= galleryImageCount;
    i++
  ) {

    searches.push(
      findGalleryImage(i)
    );

  }

  const results =
    await Promise.all(searches);

  imagePaths =
    results.filter(Boolean);

  console.log(
    `Gallery: ${imagePaths.length} of ${galleryImageCount} images found.`
  );

  return imagePaths;
}


/* ============================================================
   UTILITIES
   ============================================================ */

class Utilities {
  static norm(value, min, max) {
    return (value - min) / (max - min);
  }

  static lerp(norm, min, max) {
    return (max - min) * norm + min;
  }

  static map(value, sourceMin, sourceMax, destMin, destMax) {
    return this.lerp(
      this.norm(value, sourceMin, sourceMax),
      destMin,
      destMax
    );
  }

  static clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
  }

  static distance(x0, y0, x1, y1) {
    const dx = x1 - x0;
    const dy = y1 - y0;

    return Math.sqrt(dx * dx + dy * dy);
  }

  static randomRange(min, max) {
    return min + Math.random() * (max - min);
  }

  static randomInt(min, max) {
    return Math.floor(
      min + Math.random() * (max - min + 1)
    );
  }

  static degreesToRads(degrees) {
    return (degrees / 180) * Math.PI;
  }

  static radsToDegrees(radians) {
    return (radians * 180) / Math.PI;
  }
}


/* ============================================================
   LOADING SCREEN
   ============================================================ */

class Loading {
  constructor(root) {
    this.root = root;

    this.load = root.querySelector(".gallery-loading");
    this.line = root.querySelector(".gallery-line");
    this.counter = root.querySelector(".gallery-counter");

    this.imagePaths = imagePaths;

    this.loadedNumber = 0;
    this.percentage = 0;
    this.num = 0;

    this.animationID = null;
  }

  initialize() {
    return new Promise((resolve) => {
      /*
       * If loader HTML isn't present, don't stop the gallery.
       */
      if (!this.load || !this.line || !this.counter) {
        resolve();
        return;
      }

      /*
       * No images = nothing to preload.
       */
      if (!this.imagePaths.length) {
        this.percentage = 100;
        this.drawPercentage(resolve);
        return;
      }

      this.loadImages(resolve);
    });
  }

  loadImages(resolve) {
    let completed = 0;

    const completedImage = () => {
      completed++;

      this.percentage = Math.floor(
        (completed / this.imagePaths.length) * 100
      );
    };

    this.imagePaths.forEach((path) => {
      const image = new Image();

      /*
       * Count failed images as "completed" so the loader
       * never gets permanently stuck.
       */
      image.addEventListener(
        "load",
        completedImage,
        { once: true }
      );

      image.addEventListener(
        "error",
        completedImage,
        { once: true }
      );

      image.crossOrigin = "anonymous";
      image.src = path;
    });

    this.drawPercentage(resolve);
  }

  drawPercentage(resolve) {
    if (this.num < this.percentage) {
      this.num++;
    }

    this.line.style.width = `${this.num}%`;
    this.counter.textContent = `${this.num}%`;

    if (this.num >= 100) {
      if (this.animationID) {
        cancelAnimationFrame(this.animationID);
      }

      setTimeout(() => {
        this.load.classList.add("loaded");
        this.line.classList.add("loaded");
        this.counter.classList.add("loaded");

        resolve();
      }, 400);

      return;
    }

    this.animationID = requestAnimationFrame(() => {
      this.drawPercentage(resolve);
    });
  }
}


/* ============================================================
   STOPWATCH
   Used for image reveal animation.
   ============================================================ */

class Stopwatch {
  constructor() {
    this.initialize();
  }

  initialize() {
    const time = Date.now();

    this.startTime = time;
    this.lastTime = time;
    this.elapsedTime = 0;
  }

  calculateTime() {
    const time = Date.now();

    this.elapsedTime = time - this.startTime;
    this.lastTime = time;
  }

  getElapsedTime() {
    return this.elapsedTime;
  }
}


/* ============================================================
   LARGE / SELECTED IMAGE

   STATIC:
   - PNG
   - JPG
   - JPEG
   - WEBP
   Uses the glitch/slice animation.

   GIF:
   Uses a REAL HTML <img> above the canvas
   so the animation continues playing.
============================================================ */

class DrawMainImage {

  constructor(
    ctx,
    width,
    height,
    root
  ) {

    this.ctx = ctx;

    this.width = width;
    this.height = height;

    this.root = root;

    this.initialize();

  }


  /* ========================================================
     INITIALIZE
  ======================================================== */

  initialize() {

    /*
     * Offscreen canvas used for static-image
     * pixel slicing.
     */

    this.canvas =
      document.createElement(
        "canvas"
      );


    this.ctx2 =
      this.canvas.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );


    this.image = null;

    this.src = "";

    this.isGif = false;

    this.isLoaded = false;

    this.dataArr = [];

    this.displayWidth = 0;
    this.displayHeight = 0;


    this.stopWatch =
      new Stopwatch();


    /*
     * Create REAL animated GIF element.
     *
     * This is deliberately NOT part of
     * the canvas.
     */

    this.liveGif =
      document.createElement(
        "img"
      );


    this.liveGif.className =
      "gallery-live-gif";


    this.liveGif.alt =
      "Animated graphic design preview";


    this.liveGif.draggable =
      false;


    /*
     * Put GIF inside the interactive
     * gallery.
     */

    if (this.root) {

      this.root.appendChild(
        this.liveGif
      );

    }

  }



  /* ========================================================
     OPEN IMAGE
  ======================================================== */

  drawImage(src) {

    /*
     * Clear any previous GIF.
     */

    this.hideGif(true);


    this.src = src;

    this.dataArr = [];

    this.isLoaded = false;


    /*
     * Detect GIF.
     */

    this.isGif =
      /\.gif(?:$|[?#])/i.test(
        src
      );


    /* ======================================================
       GIF
    ====================================================== */

    if (this.isGif) {

      this.showGif(src);

      return;

    }



    /* ======================================================
       STATIC IMAGE
    ====================================================== */

    this.image =
      new Image();


    this.image.crossOrigin =
      "anonymous";


    this.image.addEventListener(
      "load",
      () => {

        this.stopWatch.initialize();


        const naturalWidth =
          this.image.naturalWidth ||
          this.image.width;


        const naturalHeight =
          this.image.naturalHeight ||
          this.image.height;


        /*
         * Allow image to use FULL gallery height.
         *
         * Width has a tiny margin so horizontal
         * artwork doesn't touch the border.
         */

        const maxWidth =
          this.width * 0.96;


        const maxHeight =
          this.height;


        /*
         * Maintain correct aspect ratio.
         */

        const scale =
          Math.min(
            maxWidth /
            naturalWidth,

            maxHeight /
            naturalHeight
          );


        this.displayWidth =
          naturalWidth *
          scale;


        this.displayHeight =
          naturalHeight *
          scale;


        /*
         * Configure offscreen canvas.
         */

        this.canvas.width =
          Math.max(
            1,
            Math.round(
              this.displayWidth
            )
          );


        this.canvas.height =
          Math.max(
            1,
            Math.round(
              this.displayHeight
            )
          );


        this.ctx2.clearRect(
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );


        this.ctx2.drawImage(
          this.image,

          0,
          0,

          this.canvas.width,
          this.canvas.height
        );


        /*
         * Create glitch slices.
         */

        this.getImageData();


        this.isLoaded =
          true;

      },
      {
        once: true
      }
    );


    this.image.addEventListener(
      "error",
      () => {

        console.error(
          "Gallery preview failed to load:",
          src
        );

      },
      {
        once: true
      }
    );


    this.image.src =
      src;

  }



  /* ========================================================
     SHOW REAL GIF
  ======================================================== */

  showGif(src) {

    if (!this.liveGif) {
      return;
    }


    this.isGif = true;

    this.isLoaded = false;


    /*
     * Make element available first.
     */

    this.liveGif.style.display =
      "block";


    this.liveGif.classList.remove(
      "is-visible"
    );


    /*
     * Wait for the actual GIF to load.
     */

    this.liveGif.onload =
      () => {

        this.isLoaded =
          true;


        /*
         * Next frame ensures browser paints
         * the image before fading it in.
         */

        requestAnimationFrame(
          () => {

            this.liveGif.classList.add(
              "is-visible"
            );

          }
        );

      };


    this.liveGif.onerror =
      () => {

        console.error(
          "Animated GIF failed to load:",
          src
        );


        this.hideGif(true);

      };


    /*
     * Assigning src to an actual <img>
     * causes browser-native GIF animation.
     */

    this.liveGif.src =
      src;

  }



  /* ========================================================
     HIDE GIF
  ======================================================== */

  hideGif(immediate = false) {

    if (!this.liveGif) {
      return;
    }


    this.liveGif.classList.remove(
      "is-visible"
    );


    if (immediate) {

      this.liveGif.style.display =
        "none";


      /*
       * Remove old GIF entirely so selecting
       * it again restarts animation.
       */

      this.liveGif.removeAttribute(
        "src"
      );


      return;

    }


    setTimeout(
      () => {

        if (
          !this.liveGif.classList.contains(
            "is-visible"
          )
        ) {

          this.liveGif.style.display =
            "none";


          this.liveGif.removeAttribute(
            "src"
          );

        }

      },
      180
    );

  }



  /* ========================================================
     STATIC IMAGE PIXEL SLICES
  ======================================================== */

  getImageData() {

    this.dataArr = [];


    let preHeight =
      0;


    while (
      preHeight <
      this.canvas.height
    ) {

      let addHeight =
        Utilities.randomInt(
          5,
          20
        );


      if (
        preHeight +
        addHeight >
        this.canvas.height
      ) {

        addHeight =
          this.canvas.height -
          preHeight;

      }


      if (
        addHeight <= 0
      ) {

        break;

      }


      try {

        const image =
          this.ctx2.getImageData(

            0,

            preHeight,

            this.canvas.width,

            addHeight

          );


        this.dataArr.push({

          image: image,

          height:
            preHeight,

          width:

            Math.random() *
            this.width *
            0.5 -

            this.width *
            0.25

        });


      } catch (error) {

        /*
         * CORS fallback.
         */

        console.warn(
          "Pixel effect unavailable. Using normal image preview.",
          error
        );


        this.dataArr = [];


        break;

      }


      preHeight +=
        addHeight;

    }

  }



  /* ========================================================
     DRAW PREVIEW
  ======================================================== */

  addImage(t) {

    if (
      !this.isLoaded
    ) {

      return;

    }


    /*
     * GIF is being rendered by the DOM,
     * not canvas.
     */

    if (
      this.isGif
    ) {

      return;

    }


    /*
     * If pixel slicing isn't available,
     * draw static image normally.
     */

    if (
      !this.dataArr.length
    ) {

      this.drawNormalImage();

      return;

    }


    /*
     * Static sliced/glitch image.
     */

    for (
      let i = 0;
      i < this.dataArr.length;
      i++
    ) {

      const item =
        this.dataArr[i];


      /*
       * IMPORTANT:
       *
       * putImageData ignores canvas transforms,
       * therefore these coordinates use the
       * actual top-left canvas coordinate system.
       */

      this.ctx.putImageData(

        item.image,


        Math.round(

          this.width / 2 -

          this.canvas.width / 2 +

          item.width

        ),


        Math.round(

          this.height / 2 -

          this.canvas.height / 2 +

          item.height

        )

      );

    }


    this.moveImage();

  }



  /* ========================================================
     NORMAL STATIC FALLBACK
  ======================================================== */

  drawNormalImage() {

    if (
      !this.image ||
      !this.image.complete ||
      !this.image.naturalWidth
    ) {

      return;

    }


    /*
     * IMPORTANT:
     *
     * Sketch.render() has ALREADY translated
     * the canvas coordinate system to:
     *
     * width / 2
     * height / 2
     *
     * Therefore the image center is 0,0.
     *
     * This fixes the lower-right problem.
     */

    const x =
      -this.displayWidth /
      2;


    const y =
      -this.displayHeight /
      2;


    this.ctx.drawImage(

      this.image,

      x,
      y,

      this.displayWidth,
      this.displayHeight

    );

  }



  /* ========================================================
     STATIC IMAGE ENTRANCE
  ======================================================== */

  moveImage() {

    this.stopWatch.calculateTime();


    const t =

      1 -

      Math.min(

        this.stopWatch.getElapsedTime() *
        0.0002,

        1

      );


    const easing =
      this.ease(t);


    for (
      let i = 0;
      i < this.dataArr.length;
      i++
    ) {

      this.dataArr[i].width *=
        easing;

    }

  }



  /* ========================================================
     CLOSE PREVIEW
  ======================================================== */

  deleteImage(t) {

    if (
      !this.isLoaded
    ) {

      return;

    }


    /* ======================================================
       GIF
    ====================================================== */

    if (
      this.isGif
    ) {

      /*
       * Fade the real GIF out.
       */

      this.liveGif.classList.remove(
        "is-visible"
      );


      return;

    }



    /* ======================================================
       STATIC FALLBACK
    ====================================================== */

    if (
      !this.dataArr.length
    ) {

      this.drawNormalImage();

      return;

    }



    /* ======================================================
       STATIC GLITCH CLOSE
    ====================================================== */

    for (
      let i = 0;
      i < this.dataArr.length;
      i++
    ) {

      const item =
        this.dataArr[i];


      const offset =

        Math.tan(

          t * 0.01 +

          item.height /
          Math.PI

        ) *

        100;


      this.ctx.putImageData(

        item.image,


        Math.round(

          this.width / 2 -

          this.canvas.width / 2 +

          item.width +

          offset

        ),


        Math.round(

          this.height / 2 -

          this.canvas.height / 2 +

          item.height

        )

      );

    }

  }



  /* ========================================================
     EASING
  ======================================================== */

  ease(x) {

    const safeX =
      Utilities.clamp(
        x,
        0,
        1
      );


    return (

      1 -

      Math.sqrt(

        1 -

        Math.pow(
          safeX,
          2
        )

      )

    );

  }

}


/* ============================================================
   INDIVIDUAL GALLERY IMAGE
   ============================================================ */

class Shape {
  constructor(params) {
    this.ctx = params.c;

    this.xIndex = params.x;
    this.yIndex = params.y;

    this.index = params.i;

    this.radius = params.r;

    this.numberOfShape = params.n;

    this.size = params.s;

    this.image = new Image();

    this.image.crossOrigin = "anonymous";

    this.image.src = params.p;

    this.ratio = 0;

    this.displayed = true;

    this.x = 0;
    this.y = 0;

    this.initialize();
  }

  initialize() {
    this.xRadian =
      (Math.PI * 2 /
        this.numberOfShape) *
      this.xIndex;

    this.yRadian =
      (Math.PI * 2 /
        this.numberOfShape) *
      this.yIndex;
  }

  updateParams(infos) {
    this.x =
      Math.sin(
        this.xRadian +
        infos.delta.x
      ) * this.radius;

    this.y =
      Math.cos(
        this.yRadian +
        infos.delta.y
      ) * this.radius;

    this.ratio =
      this.getNormalizedDist();
  }

  getNormalizedDist() {
    let tmp =
      Math.sqrt(
        this.x * this.x +
        this.y * this.y
      ) / this.radius;

    tmp = this.ease(tmp);

    tmp =
      1 -
      Math.min(
        tmp,
        1
      );

    return tmp;
  }

  ease(t) {
    return t * t * t;
  }

  draw(infos) {
    this.updateParams(infos);

    /*
     * Hide images on the rear half of the sphere.
     */
    if (
      Math.sin(
        this.yRadian +
        infos.delta.y
      ) > 0 ||
      Math.cos(
        this.xRadian +
        infos.delta.x
      ) > 0
    ) {
      this.displayed = false;
      return;
    }

    this.displayed = true;

    /*
     * Image may not have loaded yet.
     */
    if (
      !this.image.complete ||
      !this.image.naturalWidth ||
      !this.image.naturalHeight
    ) {
      return;
    }

    /*
     * Don't attempt to draw effectively invisible images.
     */
    if (this.ratio <= 0.01) {
      return;
    }

    this.ctx.save();

    this.ctx.translate(
      this.x,
      this.y
    );

    this.ctx.scale(
      this.ratio,
      this.ratio
    );

    this.ctx.translate(
      -this.x,
      -this.y
    );

    this.ctx.globalAlpha =
      this.ratio;

    /*
     * Source crop:
     * Take the centered square of the image.
     */
    const cropSize =
      Math.min(
        this.image.naturalWidth,
        this.image.naturalHeight
      );

    const sourceX =
      (this.image.naturalWidth -
        cropSize) /
      2;

    const sourceY =
      (this.image.naturalHeight -
        cropSize) /
      2;

    /*
     * Draw square image.
     */
    this.ctx.drawImage(
      this.image,

      sourceX,
      sourceY,

      cropSize,
      cropSize,

      this.x - this.size / 2,
      this.y - this.size / 2,

      this.size,
      this.size
    );

    this.ctx.restore();
  }
}


/* ============================================================
   GLITCH
   ============================================================ */

class Glitch {
  constructor(
    ctx,
    width,
    height,
    min,
    max
  ) {
    this.ctx = ctx;

    this.width = width;
    this.height = height;

    this.min = min;
    this.max = max;

    this.dataArr = [];
  }

  getImageData() {
    this.dataArr = [];

    let preHeight = 0;

    while (
      preHeight <
      this.height
    ) {
      let addHeight =
        Utilities.randomInt(
          this.min,
          this.max
        );

      if (
        preHeight +
        addHeight >
        this.height
      ) {
        addHeight =
          this.height -
          preHeight;
      }

      if (addHeight <= 0) {
        break;
      }

      try {
        /*
         * Correct fourth parameter = height.
         */
        const image =
          this.ctx.getImageData(
            0,
            preHeight,
            this.width,
            addHeight
          );

        this.dataArr.push({
          image,
          height: preHeight
        });
      } catch (error) {
        /*
         * Disable glitch if canvas has been tainted by
         * a non-CORS external image.
         */
        this.dataArr = [];
        return;
      }

      preHeight += addHeight;
    }
  }

  addImage(t) {
    if (!this.dataArr.length) {
      return;
    }

    for (
      let i = 0;
      i < this.dataArr.length;
      i++
    ) {
      const item = this.dataArr[i];

      if (Math.random() > 0.01) {
        this.ctx.putImageData(
          item.image,

          Math.tan(
            item.height * 0.1 +
            t
          ) *
          10 *
          Math.random(),

          item.height
        );
      } else {
        const randomItem =
          this.dataArr[
          Math.floor(
            this.dataArr.length *
            Math.random()
          )
          ];

        this.ctx.putImageData(
          randomItem.image,

          this.width *
          Math.random() -
          this.width / 2,

          item.height
        );
      }
    }
  }

  draw(t) {
    this.getImageData();
    this.addImage(t);
  }
}


/* ============================================================
   MAIN GALLERY
   ============================================================ */

class Sketch {
  constructor(root) {
    this.root = root;

    this.canvasContainer =
      root.querySelector(
        ".gallery-canvas"
      );

    if (!this.canvasContainer) {
      console.error(
        "Gallery error: .gallery-canvas was not found."
      );

      return;
    }

    /*
     * Bind events once so they can also be removed later
     * if needed.
     */
    this.boundResize =
      this.onResize.bind(this);

    this.boundWheel =
      this.onWheel.bind(this);

    this.boundClick =
      this.onClick.bind(this);

    this.boundMousemove =
      this.onMousemove.bind(this);

    this.boundMouseleave =
      this.onMouseleave.bind(this);

    this.boundTouchstart =
      this.onTouchstart.bind(this);

    this.boundTouchmove =
      this.onTouchmove.bind(this);

    this.setupCanvas();

    this.setupEvents();

    this.initialize();
  }

  /* ========================================================
     CANVAS
     ======================================================== */

  setupCanvas() {
    this.canvas =
      document.createElement(
        "canvas"
      );

    this.ctx =
      this.canvas.getContext(
        "2d",
        {
          willReadFrequently: true
        }
      );

    this.canvas.setAttribute(
      "aria-label",
      "Interactive image gallery"
    );

    this.canvas.setAttribute(
      "role",
      "img"
    );

    Object.assign(
      this.canvas.style,
      {
        position: "absolute",
        inset: "0",
        width: "100%",
        height: "100%",
        display: "block",
        background: "#1a1a1a"
      }
    );

    this.canvasContainer.appendChild(
      this.canvas
    );
  }

  /* ========================================================
     EVENTS
     ======================================================== */

  setupEvents() {
    window.addEventListener(
      "resize",
      this.boundResize,
      { passive: true }
    );

    this.root.addEventListener(
      "wheel",
      this.boundWheel,
      { passive: true }
    );

    this.root.addEventListener(
      "click",
      this.boundClick
    );

    this.root.addEventListener(
      "mousemove",
      this.boundMousemove,
      { passive: true }
    );

    this.root.addEventListener(
      "mouseleave",
      this.boundMouseleave,
      { passive: true }
    );

    this.root.addEventListener(
      "touchstart",
      this.boundTouchstart,
      { passive: true }
    );

    this.root.addEventListener(
      "touchmove",
      this.boundTouchmove,
      { passive: true }
    );
  }

  /* ========================================================
     INITIALIZE
     ======================================================== */

  initialize() {
    if (this.animationId) {
      cancelAnimationFrame(
        this.animationId
      );
    }

    this.paths = imagePaths;

    this.isDisplayed = false;
    this.isDeleting = false;

    this.hasHover =
      window.matchMedia(
        "(hover: hover)"
      ).matches;

    this.setupSizes();

    this.setupShapes();

    this.focus = {
      x: 0,
      y: 0,
      s: 0
    };

    this.touchInfos = {
      mouse: {
        x: 0,
        y: 0
      },

      delta: {
        x: 0,
        y: 0
      },

      fing: {
        start: {
          x: null,
          y: null
        },

        move: {
          x: null,
          y: null
        },

        previous: {
          x: null,
          y: null
        }
      }
    };

    this.G = new Glitch(
      this.ctx,
      this.width,
      this.height,
      50,
      200
    );

    this.M =
      new DrawMainImage(
        this.ctx,
        this.width,
        this.height,
        this.root
      );

    this.render(0);
  }

  /* ========================================================
     SIZE
     ======================================================== */

  setupSizes() {
    const rect =
      this.root.getBoundingClientRect();

    this.width =
      Math.max(
        1,
        Math.round(rect.width)
      );

    this.height =
      Math.max(
        1,
        Math.round(rect.height)
      );

    this.preWidth =
      this.width;

    this.preHeight =
      this.height;

    this.canvas.width =
      this.width;

    this.canvas.height =
      this.height;
  }

  onResize() {
    const rect =
      this.root.getBoundingClientRect();

    const newWidth =
      Math.round(rect.width);

    const newHeight =
      Math.round(rect.height);

    /*
     * Ignore tiny/no-op resize events.
     */
    if (
      Math.abs(
        newWidth -
        this.preWidth
      ) < 2 &&
      Math.abs(
        newHeight -
        this.preHeight
      ) < 2
    ) {
      return;
    }

    this.initialize();
  }

  /* ========================================================
     POINTER POSITION
     ======================================================== */

  getPointerPosition(
    clientX,
    clientY
  ) {
    const rect =
      this.canvas.getBoundingClientRect();

    return {
      x:
        clientX -
        rect.left -
        rect.width / 2,

      y:
        clientY -
        rect.top -
        rect.height / 2
    };
  }

  onMousemove(e) {
    const point =
      this.getPointerPosition(
        e.clientX,
        e.clientY
      );

    this.touchInfos.mouse.x =
      point.x;

    this.touchInfos.mouse.y =
      point.y;
  }

  onMouseleave() {
    this.root.style.cursor =
      "default";
  }

  /* ========================================================
     WHEEL
     ======================================================== */

  onWheel(e) {
    /*
     * Normal page scrolling still works.
     * We're only reading wheel movement.
     */
    this.touchInfos.delta.x +=
      e.deltaX * 0.0005;

    this.touchInfos.delta.y +=
      e.deltaY * 0.0005;
  }

  /* ========================================================
     TOUCH
     ======================================================== */

  onTouchstart(e) {
    if (
      !e.targetTouches ||
      !e.targetTouches.length
    ) {
      return;
    }

    const touch =
      e.targetTouches[0];

    const point =
      this.getPointerPosition(
        touch.clientX,
        touch.clientY
      );

    this.touchInfos.mouse.x =
      point.x;

    this.touchInfos.mouse.y =
      point.y;

    this.touchInfos.fing.start.x =
      touch.clientX;

    this.touchInfos.fing.start.y =
      touch.clientY;

    this.touchInfos.fing.previous.x =
      touch.clientX;

    this.touchInfos.fing.previous.y =
      touch.clientY;
  }

  onTouchmove(e) {
    if (
      !e.targetTouches ||
      !e.targetTouches.length
    ) {
      return;
    }

    const touch =
      e.targetTouches[0];

    const point =
      this.getPointerPosition(
        touch.clientX,
        touch.clientY
      );

    this.touchInfos.mouse.x =
      point.x;

    this.touchInfos.mouse.y =
      point.y;

    const previousX =
      this.touchInfos.fing
        .previous.x ??
      touch.clientX;

    const previousY =
      this.touchInfos.fing
        .previous.y ??
      touch.clientY;

    const deltaX =
      previousX -
      touch.clientX;

    const deltaY =
      previousY -
      touch.clientY;

    this.touchInfos.delta.x +=
      deltaX * 0.003;

    this.touchInfos.delta.y +=
      deltaY * 0.003;

    this.touchInfos.fing.previous.x =
      touch.clientX;

    this.touchInfos.fing.previous.y =
      touch.clientY;
  }

  /* ========================================================
     CLICK
     ======================================================== */

  onClick(e) {
    /*
     * If an enlarged image is already open,
     * clicking closes it.
     */
    if (this.isDisplayed) {
      this.isDeleting = true;

      setTimeout(() => {
        this.isDeleting = false;
        this.isDisplayed = false;
        this.M.hideGif(true);
      }, 180);

      return;
    }

    const point =
      this.getPointerPosition(
        e.clientX,
        e.clientY
      );

    const x =
      (this.touchInfos.mouse.x =
        point.x);

    const y =
      (this.touchInfos.mouse.y =
        point.y);

    /*
     * Iterate backwards because later-rendered images
     * are visually on top.
     */
    for (
      let i =
        this.shapes.length - 1;
      i >= 0;
      i--
    ) {
      const shape =
        this.shapes[i];

      if (
        this.isHovered(
          shape,
          x,
          y
        )
      ) {
        this.isDisplayed = true;

        this.M.drawImage(
          shape.image.src
        );

        return;
      }
    }
  }

  /* ========================================================
     SHAPES
     ======================================================== */

  setupShapes() {

    const edge =
      Math.max(
        this.width,
        this.height
      );


    this.radius =
      edge / 2;


    this.numberOfShape =
      16;


    this.size =

      this.radius /

      (
        this.numberOfShape /
        6
      );


    this.shapes = [];


    /*
     * Track where each image has already
     * been positioned.
     */

    const placements = [];


    /*
     * Track how often each image has been used.
     *
     * This keeps all 59 images distributed
     * fairly evenly.
     */

    const usage =
      new Map();


    this.paths.forEach(
      (path) => {

        usage.set(
          path,
          0
        );

      }
    );


    /*
     * Minimum separation.
     *
     * 3 means an identical file cannot be
     * placed within roughly three grid positions
     * of itself.
     *
     * Increase to 4 if you want even more space.
     */

    const minimumSeparation =
      3;


    /*
     * Because the gallery wraps around like
     * a sphere, position 0 and position 15
     * should be considered neighbors.
     */

    const circularDistance =
      (
        a,
        b
      ) => {

        const difference =
          Math.abs(
            a - b
          );


        return Math.min(

          difference,

          this.numberOfShape -
          difference

        );

      };



    /* ======================================================
       CHOOSE IMAGE
    ====================================================== */

    const chooseImage =
      (
        x,
        y
      ) => {


        /*
         * Remove any image already used close
         * to this position.
         */

        let candidates =

          this.paths.filter(

            (path) => {


              return !placements.some(

                (placement) => {


                  if (
                    placement.path !==
                    path
                  ) {

                    return false;

                  }


                  const dx =
                    circularDistance(
                      x,
                      placement.x
                    );


                  const dy =
                    circularDistance(
                      y,
                      placement.y
                    );


                  /*
                   * Same image cannot be inside
                   * this neighborhood.
                   */

                  return (

                    dx <=
                    minimumSeparation &&

                    dy <=
                    minimumSeparation

                  );

                }

              );

            }

          );


        /*
         * Emergency fallback.
         *
         * Normally with 59 images this should
         * almost never be needed.
         */

        if (
          !candidates.length
        ) {

          candidates =
            [...this.paths];

        }



        /*
         * Find the images that have been used
         * the least.
         */

        const minimumUsage =
          Math.min(

            ...candidates.map(

              (path) =>
                usage.get(path) || 0

            )

          );


        /*
         * Only choose among the least-used
         * images.
         */

        candidates =

          candidates.filter(

            (path) =>

              (
                usage.get(path) ||
                0
              ) ===
              minimumUsage

          );



        /*
         * Randomly choose one of those.
         */

        const selected =

          candidates[

          Math.floor(

            Math.random() *
            candidates.length

          )

          ];



        /*
         * Record usage.
         */

        usage.set(

          selected,

          (
            usage.get(
              selected
            ) || 0
          ) + 1

        );


        placements.push({

          x: x,

          y: y,

          path:
            selected

        });


        return selected;

      };



    /* ======================================================
       CREATE SHAPES
    ====================================================== */

    let index =
      0;


    for (
      let x = 0;
      x < this.numberOfShape;
      x++
    ) {


      for (
        let y = 0;
        y < this.numberOfShape;
        y++
      ) {


        const selectedImage =
          chooseImage(
            x,
            y
          );


        const params = {

          x: x,

          y: y,

          i:
            index++,

          c:
            this.ctx,

          s:
            this.size,

          r:
            this.radius,

          n:
            this.numberOfShape,

          p:
            selectedImage

        };


        this.shapes.push(

          new Shape(
            params
          )

        );

      }

    }

  }

  /* ========================================================
     HOVER DETECTION
     ======================================================== */

  isHovered(
    shape,
    x,
    y
  ) {
    if (
      !shape ||
      shape.displayed !== true ||
      shape.ratio <= 0.05
    ) {
      return false;
    }

    const half =
      (this.size /
        2) *
      shape.ratio;

    return (
      x >
      shape.x - half &&
      x <
      shape.x + half &&
      y >
      shape.y - half &&
      y <
      shape.y + half
    );
  }

  /* ========================================================
     HOVER FRAME
     ======================================================== */

  drawFocus(
    shape,
    hover
  ) {
    /*
     * No hovered image.
     */
    if (
      !hover ||
      !shape
    ) {
      this.focus.s +=
        (0 -
          this.focus.s) *
        0.16;

      this.focus.x +=
        (this.touchInfos.mouse.x -
          this.focus.x) *
        0.16;

      this.focus.y +=
        (this.touchInfos.mouse.y -
          this.focus.y) *
        0.16;

      if (
        this.focus.s >
        0.5
      ) {
        this.ctx.save();

        const accentColor = getComputedStyle(
          document.documentElement
        ).getPropertyValue("--accent").trim();

        this.ctx.strokeStyle = accentColor;

        this.ctx.lineWidth = 1;

        this.ctx.strokeRect(
          this.focus.x -
          this.focus.s / 2,

          this.focus.y -
          this.focus.s / 2,

          this.focus.s,
          this.focus.s
        );

        this.ctx.restore();
      }

      return;
    }

    /*
     * Hovering an image.
     */
    this.focus.s +=
      (this.size *
        shape.ratio -
        this.focus.s) *
      0.16;

    this.focus.x +=
      (shape.x -
        this.focus.x) *
      0.16;

    this.focus.y +=
      (shape.y -
        this.focus.y) *
      0.16;

    this.ctx.save();

    const accentColor = getComputedStyle(
      document.documentElement
    ).getPropertyValue("--accent").trim();

    this.ctx.strokeStyle = accentColor;

    this.ctx.lineWidth =
      Math.max(
        1,
        5 * shape.ratio
      );

    this.ctx.strokeRect(
      this.focus.x -
      this.focus.s / 2,

      this.focus.y -
      this.focus.s / 2,

      this.focus.s,
      this.focus.s
    );

    this.ctx.restore();
  }

  /* ========================================================
     RESET EACH FRAME
     ======================================================== */

  resetParams() {
    this.hover = false;

    this.root.style.cursor =
      "default";
  }

  /* ========================================================
     ANIMATION LOOP
     ======================================================== */

  render(t) {
    this.resetParams();

    /*
     * Clear canvas.
     */
    this.ctx.clearRect(
      0,
      0,
      this.width,
      this.height
    );

    this.ctx.save();

    /*
     * Move canvas coordinate system so 0,0 = center.
     */
    this.ctx.translate(
      this.width / 2,
      this.height / 2
    );

    let hoveredIndex = -1;

    /*
     * Draw sphere images.
     */
    for (
      let i = 0;
      i < this.shapes.length;
      i++
    ) {
      const shape =
        this.shapes[i];

      shape.draw(
        this.touchInfos
      );

      if (
        this.hasHover &&
        this.isHovered(
          shape,
          this.touchInfos.mouse.x,
          this.touchInfos.mouse.y
        )
      ) {
        this.root.style.cursor =
          "zoom-in";

        this.hover = true;

        hoveredIndex = i;
      }
    }

    /*
     * Hover frame.
     */
    this.drawFocus(
      hoveredIndex >= 0
        ? this.shapes[
        hoveredIndex
        ]
        : null,

      this.hover
    );

    /*
     * Occasional glitch.
     *
     * Lower number = less frequent.
     */
    if (
      !this.isDisplayed &&
      Math.random() < 0.006
    ) {
      this.ctx.restore();

      this.G.draw(t);

      this.ctx.save();

      this.ctx.translate(
        this.width / 2,
        this.height / 2
      );
    }

    /*
     * Selected / enlarged image.
     */
    if (
      this.isDisplayed &&
      !this.isDeleting
    ) {
      /*
       * Dark overlay.
       */
      this.ctx.save();

      this.ctx.globalAlpha =
        0.86;

      this.ctx.fillStyle =
        "#1a1a1a";

      this.ctx.fillRect(
        -this.width / 2,
        -this.height / 2,
        this.width,
        this.height
      );

      this.ctx.restore();

      this.M.addImage(t);

      this.root.style.cursor =
        "zoom-out";
    }

    /*
     * Closing glitch animation.
     */
    if (
      this.isDeleting
    ) {
      this.M.deleteImage(t);
    }

    this.ctx.restore();

    /*
     * Continue animation.
     */
    this.animationId =
      requestAnimationFrame(
        this.render.bind(this)
      );
  }
}


/* ============================================================
   START GALLERY
   ============================================================ */

window.addEventListener(
  "load",
  async () => {

    const gallery =
      document.querySelector("#image-gallery");

    if (!gallery) {
      return;
    }

    try {

      /*
       * Detect image-1 through image-59
       * and automatically find whether each file
       * is PNG, JPG, JPEG, GIF, or WEBP.
       */
      await buildGalleryImagePaths();


      /*
       * Make sure we actually found images.
       */
      if (!imagePaths.length) {
        throw new Error(
          "No gallery images were found."
        );
      }


      console.log(
        `Gallery: ${imagePaths.length} images loaded.`
      );


      /*
       * Preload gallery images.
       */
      const loader =
        new Loading(gallery);

      await loader.initialize();


      /*
       * Start interactive gallery.
       */
      new Sketch(gallery);

    } catch (error) {

      console.error(
        "Gallery initialization error:",
        error
      );


      /*
       * Hide loader even if something unexpected happens,
       * preventing the webpage from becoming inaccessible.
       */
      const loading =
        gallery.querySelector(
          ".gallery-loading"
        );

      if (loading) {
        loading.classList.add(
          "loaded"
        );
      }

    }

  }
);

/* ============================================================
   GRAPHIC DESIGN GALLERY MODAL
============================================================ */

document.addEventListener("DOMContentLoaded", () => {

  const openGallery =
    document.querySelector("#openGraphicGallery");

  const closeGallery =
    document.querySelector("#closeGraphicGallery");

  const modal =
    document.querySelector("#graphicDesignGallery");

  const backdrop =
    modal?.querySelector(".gallery-modal-backdrop");


  if (!openGallery || !modal) {
    return;
  }


  /* ========================================================
     OPEN GALLERY
  ======================================================== */

  function openGraphicGallery(event) {

    if (event) {
      event.preventDefault();
    }

    modal.classList.add("is-open");

    modal.setAttribute(
      "aria-hidden",
      "false"
    );

    /*
     * Prevent the website behind the popup from scrolling.
     */
    document.body.style.overflow = "hidden";


    /*
     * Put keyboard focus on close button.
     */
    setTimeout(() => {

      closeGallery?.focus();

    }, 100);

  }


  /* ========================================================
     CLOSE GALLERY
  ======================================================== */

  function closeGraphicGallery() {

    modal.classList.remove("is-open");

    modal.setAttribute(
      "aria-hidden",
      "true"
    );

    /*
     * Restore website scrolling.
     */
    document.body.style.overflow = "";


    /*
     * Return keyboard focus to project card.
     */
    openGallery.focus();

  }


  /* ========================================================
     CARD CLICK
  ======================================================== */

  openGallery.addEventListener(
    "click",
    openGraphicGallery
  );


  /* ========================================================
     CLOSE BUTTON
  ======================================================== */

  closeGallery?.addEventListener(
    "click",
    closeGraphicGallery
  );


  /* ========================================================
     CLICK OUTSIDE POPUP
  ======================================================== */

  backdrop?.addEventListener(
    "click",
    closeGraphicGallery
  );


  /* ========================================================
     ESC KEY
  ======================================================== */

  document.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Escape" &&
        modal.classList.contains("is-open")
      ) {

        closeGraphicGallery();

      }

    }
  );

});