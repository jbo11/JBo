(function () {
  "use strict";

  const DEFAULT_CONFIG = {
    enabled: true,
    endpoint: "",
    heartbeatInterval: 60000,
    onlineThreshold: 120000,
    debug: false
  };

  const STORAGE_KEYS = {
    visitorId: "jbbo_visitor_id",
    sessionId: "jbbo_session_id",
    firstSeen: "jbbo_first_seen",
    visitCount: "jbbo_visit_count",
    location: "jbbo_session_location"
  };

  const PLACEHOLDER_ENDPOINT =
    "PASTE_GOOGLE_APPS_SCRIPT_EXEC_URL_HERE";

  const config = Object.assign(
    {},
    DEFAULT_CONFIG,
    window.JB_ANALYTICS_CONFIG || {}
  );

  let initialized = false;
  let visitorId = "";
  let sessionId = "";
  let isNewVisitor = false;
  let firstSeen = "";
  let landingPage = "";
  let lastSection = "";
  let heartbeatTimer = null;
  let locationPromise = null;

  function safeLog() {
    if (!config.debug) return;
    try {
      console.info.apply(console, arguments);
    } catch (error) {
      // Analytics debugging is optional.
    }
  }

  function storage(type) {
    try {
      const key = "__jb_test__";
      const store = window[type];
      store.setItem(key, "1");
      store.removeItem(key);
      return store;
    } catch (error) {
      return null;
    }
  }

  const local = storage("localStorage");
  const session = storage("sessionStorage");

  function randomId(prefix) {
    try {
      if (crypto.randomUUID) {
        return `${prefix}_${crypto.randomUUID()}`;
      }
    } catch (error) {
      // Fall back below.
    }

    return `${prefix}_${Math.random()
      .toString(16)
      .slice(2)}${Date.now().toString(16)}`;
  }

  function getOrCreateLocal(key, prefix) {
    const existing = local?.getItem(key);
    if (existing) return existing;
    const value = randomId(prefix);
    local?.setItem(key, value);
    return value;
  }

  function getOrCreateSession(key, prefix) {
    const existing = session?.getItem(key);
    if (existing) return existing;
    const value = randomId(prefix);
    session?.setItem(key, value);
    return value;
  }

  function nowIso() {
    return new Date().toISOString();
  }

  function endpointReady() {
    return Boolean(
      config.enabled &&
      config.endpoint &&
      config.endpoint !== PLACEHOLDER_ENDPOINT
    );
  }

  function normalizeReferrer(value) {
    if (!value) return "Direct";
    try {
      return new URL(value).hostname.replace(/^www\./, "");
    } catch (error) {
      return String(value).slice(0, 120);
    }
  }

  function currentPage() {
    return `${window.location.pathname}${window.location.hash || ""}`;
  }

  function activeSection() {
    return (
      document.querySelector(".page.is-active")?.id ||
      window.location.hash.slice(1) ||
      ""
    );
  }

  function deviceType() {
    const ua = navigator.userAgent || "";
    const width = window.innerWidth || 0;
    if (/Mobi|Android|iPhone|iPod/i.test(ua)) return "Mobile";
    if (/Tablet|iPad/i.test(ua) || (width >= 600 && width <= 1024)) {
      return "Tablet";
    }
    return "Desktop";
  }

  function browserName() {
    const brands = navigator.userAgentData?.brands || [];
    const brand = brands.find(
      (item) => !/Not|Chromium/i.test(item.brand)
    );
    if (brand?.brand) return brand.brand;

    const ua = navigator.userAgent || "";
    if (/Edg/i.test(ua)) return "Edge";
    if (/OPR|Opera/i.test(ua)) return "Opera";
    if (/Chrome/i.test(ua)) return "Chrome";
    if (/Safari/i.test(ua)) return "Safari";
    if (/Firefox/i.test(ua)) return "Firefox";
    return "Unknown";
  }

  function operatingSystem() {
    const platform = navigator.userAgentData?.platform || "";
    const ua = navigator.userAgent || "";
    const source = `${platform} ${ua}`;
    if (/Windows/i.test(source)) return "Windows";
    if (/Mac OS|MacIntel|Macintosh/i.test(source)) return "macOS";
    if (/iPhone|iPad|iPod/i.test(source)) return "iOS";
    if (/Android/i.test(source)) return "Android";
    if (/Linux/i.test(source)) return "Linux";
    return "Unknown";
  }

  function baseContext() {
    return {
      visitorId,
      sessionId,
      page: currentPage(),
      pageTitle: document.title || "",
      section: activeSection(),
      referrer: normalizeReferrer(document.referrer),
      landingPage,
      timezone:
        Intl.DateTimeFormat().resolvedOptions().timeZone || "",
      language: navigator.language || "",
      device: deviceType(),
      browser: browserName(),
      operatingSystem: operatingSystem(),
      screenSize: `${screen.width || ""}x${screen.height || ""}`,
      viewportSize: `${window.innerWidth || ""}x${window.innerHeight || ""}`,
      isNewVisitor,
      firstSeen,
      lastSeen: nowIso()
    };
  }

  function getCachedLocation() {
    try {
      const raw = session?.getItem(STORAGE_KEYS.location);
      return raw ? JSON.parse(raw) : null;
    } catch (error) {
      return null;
    }
  }

  function cacheLocation(location) {
    try {
      session?.setItem(
        STORAGE_KEYS.location,
        JSON.stringify(location)
      );
    } catch (error) {
      // Location cache is optional.
    }
  }

  function getLocation() {
    const cached = getCachedLocation();
    if (cached) return Promise.resolve(cached);
    if (locationPromise) return locationPromise;

    locationPromise = fetch("https://ipwho.is/", {
      signal:
        typeof AbortSignal !== "undefined" &&
        AbortSignal.timeout
          ? AbortSignal.timeout(1800)
          : undefined
    })
      .then((response) => response.json())
      .then((data) => {
        const location = data?.success === false
          ? { country: "", region: "", city: "" }
          : {
              country: data.country || "",
              region: data.region || "",
              city: data.city || ""
            };
        cacheLocation(location);
        return location;
      })
      .catch(() => ({
        country: "",
        region: "",
        city: ""
      }));

    return locationPromise;
  }

  function send(payload, preferBeacon) {
    if (!endpointReady()) {
      safeLog("JBAnalytics skipped", payload);
      return Promise.resolve(false);
    }

    const body = JSON.stringify(payload);

    if (preferBeacon && navigator.sendBeacon) {
      try {
        const blob = new Blob([body], {
          type: "text/plain;charset=UTF-8"
        });
        return Promise.resolve(
          navigator.sendBeacon(config.endpoint, blob)
        );
      } catch (error) {
        // Fall through to fetch.
      }
    }

    return fetch(config.endpoint, {
      method: "POST",
      mode: "no-cors",
      keepalive: Boolean(preferBeacon),
      headers: {
        "Content-Type": "text/plain;charset=UTF-8"
      },
      body
    })
      .then(() => true)
      .catch(() => false);
  }

  function buildPayload(action, eventName, metadata) {
    return getLocation().then((location) => ({
      action,
      event: eventName || "",
      timestamp: nowIso(),
      context: Object.assign({}, baseContext(), {
        country: location.country || "",
        region: location.region || "",
        city: location.city || ""
      }),
      metadata: sanitizeMetadata(metadata)
    }));
  }

  function sanitizeMetadata(metadata) {
    const safe = {};
    Object.entries(metadata || {}).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (/name|email|subject|message|password/i.test(key)) return;
      safe[key] = String(value).slice(0, 220);
    });
    return safe;
  }

  function track(eventName, metadata, options) {
    if (!initialized) return Promise.resolve(false);
    return buildPayload(
      "track",
      eventName,
      metadata
    ).then((payload) =>
      send(payload, options?.beacon === true)
    );
  }

  function pageView(metadata) {
    return track("PAGE_VIEW", metadata);
  }

  function sectionView(sectionId) {
    const section = sectionId || activeSection();
    if (!section || section === lastSection) {
      return Promise.resolve(false);
    }
    lastSection = section;
    return track("SECTION_VIEW", {
      section
    });
  }

  function heartbeat(options) {
    if (!initialized) return Promise.resolve(false);
    return buildPayload(
      "heartbeat",
      "",
      {}
    ).then((payload) =>
      send(payload, options?.beacon === true)
    );
  }

  function startHeartbeat() {
    stopHeartbeat();
    if (document.visibilityState !== "visible") return;
    heartbeatTimer = window.setInterval(
      () => heartbeat(),
      Math.max(60000, Number(config.heartbeatInterval) || 60000)
    );
  }

  function stopHeartbeat() {
    if (!heartbeatTimer) return;
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  function projectTitleFrom(element) {
    return (
      element?.dataset?.project ||
      element?.querySelector?.("h4, h3")?.textContent?.trim() ||
      element?.textContent?.trim()?.slice(0, 80) ||
      ""
    );
  }

  function hostnameFromHref(href) {
    try {
      return new URL(href, window.location.href)
        .hostname.replace(/^www\./, "");
    } catch (error) {
      return "";
    }
  }

  function filenameFromTarget(target) {
    const source =
      target?.currentSrc ||
      target?.src ||
      target?.dataset?.src ||
      target?.getAttribute?.("href") ||
      "";
    if (!source) return "";
    try {
      return decodeURIComponent(
        new URL(source, window.location.href)
          .pathname.split("/")
          .pop() || ""
      ).slice(0, 120);
    } catch (error) {
      return String(source).split("/").pop().slice(0, 120);
    }
  }

  function installClickTracking() {
    if (document.documentElement.dataset.analyticsClicks === "true") {
      return;
    }
    document.documentElement.dataset.analyticsClicks = "true";

    document.addEventListener(
      "click",
      (event) => {
        const galleryTrigger = event.target.closest(
          "#openGraphicGallery"
        );
        if (galleryTrigger) {
          track("GRAPHIC_GALLERY_OPEN", {
            project: "Graphic Designs"
          });
          return;
        }

        const galleryClose = event.target.closest(
          "#closeGraphicGallery, .gallery-modal-backdrop"
        );
        if (galleryClose) {
          track("GRAPHIC_GALLERY_CLOSE", {
            project: "Graphic Designs"
          });
          return;
        }

        const galleryImage = event.target.closest(
          ".interactive-gallery img, .gallery-modal img, canvas"
        );
        if (galleryImage) {
          const filename = filenameFromTarget(galleryImage);
          track("GRAPHIC_IMAGE_PREVIEW", {
            project: "Graphic Designs",
            target: filename || "canvas"
          });
          return;
        }

        const work = event.target.closest(".work");
        if (work) {
          track("PROJECT_CLICK", {
            project: projectTitleFrom(work)
          });
        }

        const projectCard = event.target.closest("[data-project]");
        if (projectCard && !work) {
          track("PROJECT_CLICK", {
            project: projectTitleFrom(projectCard)
          });
        }

        const link = event.target.closest("a[href]");
        if (!link) return;

        const href = link.getAttribute("href") || "";
        if (href.startsWith("mailto:")) {
          track("EMAIL_CLICK", {
            target: "email"
          });
          return;
        }

        if (href.startsWith("tel:")) {
          track("PHONE_CLICK", {
            target: "phone"
          });
          return;
        }

        const host = hostnameFromHref(href);
        if (!host || host === window.location.hostname) return;

        if (host.includes("linkedin.com")) {
          track("LINKEDIN_CLICK", {
            target: host
          });
        } else if (host.includes("github.com")) {
          track("GITHUB_CLICK", {
            target: host
          });
        } else {
          track("OUTBOUND_LINK", {
            target: host
          });
        }
      },
      true
    );
  }

  function init() {
    if (initialized || config.enabled === false) return;
    initialized = true;

    const existingVisitor = local?.getItem(STORAGE_KEYS.visitorId);
    isNewVisitor = !existingVisitor;
    visitorId =
      existingVisitor ||
      getOrCreateLocal(STORAGE_KEYS.visitorId, "visitor");
    sessionId = getOrCreateSession(
      STORAGE_KEYS.sessionId,
      "session"
    );

    firstSeen = local?.getItem(STORAGE_KEYS.firstSeen) || nowIso();
    local?.setItem(STORAGE_KEYS.firstSeen, firstSeen);

    const visits = Number(
      local?.getItem(STORAGE_KEYS.visitCount) || "0"
    );
    local?.setItem(
      STORAGE_KEYS.visitCount,
      String(visits + 1)
    );

    landingPage =
      session?.getItem("jbbo_landing_page") ||
      currentPage();
    session?.setItem("jbbo_landing_page", landingPage);

    installClickTracking();
    window.setTimeout(() => {
      pageView({
        visitorType: isNewVisitor ? "new" : "returning"
      });
      sectionView(activeSection());
      startHeartbeat();
    }, 0);
  }

  document.addEventListener("visibilitychange", () => {
    if (!initialized) return;
    if (document.visibilityState === "hidden") {
      heartbeat({ beacon: true });
      stopHeartbeat();
    } else {
      heartbeat();
      startHeartbeat();
    }
  });

  window.addEventListener("pagehide", () => {
    heartbeat({ beacon: true });
  });

  window.addEventListener("hashchange", () => {
    sectionView(activeSection());
  });

  window.JBAnalytics = {
    init,
    track,
    pageView,
    sectionView,
    heartbeat
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
