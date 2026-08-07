/* =========================================================
   JB TECH PROFILE — SOUND ENGINE
   Futuristic UI sound effects using Web Audio API
   ========================================================= */

(() => {
  let audioContext = null;
  let masterGain = null;

  let enabled =
    localStorage.getItem("jb-tech-sound") !== "off";

  function getContext() {
    if (!audioContext) {
      const AudioContext =
        window.AudioContext ||
        window.webkitAudioContext;

      if (!AudioContext) return null;

      audioContext = new AudioContext();

      masterGain =
        audioContext.createGain();

      masterGain.gain.value = 0.18;

      masterGain.connect(
        audioContext.destination
      );
    }

    if (
      audioContext.state === "suspended"
    ) {
      audioContext.resume();
    }

    return audioContext;
  }

  function tone({
    frequency = 440,
    duration = 0.1,
    volume = 0.2,
    type = "sine",
    delay = 0,
    endFrequency = null
  } = {}) {
    if (!enabled) return;

    const ctx = getContext();

    if (!ctx) return;

    const oscillator =
      ctx.createOscillator();

    const gain =
      ctx.createGain();

    const start =
      ctx.currentTime + delay;

    const end =
      start + duration;

    oscillator.type = type;

    oscillator.frequency.setValueAtTime(
      frequency,
      start
    );

    if (endFrequency) {
      oscillator.frequency
        .exponentialRampToValueAtTime(
          endFrequency,
          end
        );
    }

    gain.gain.setValueAtTime(
      0.0001,
      start
    );

    gain.gain
      .exponentialRampToValueAtTime(
        volume,
        start + 0.015
      );

    gain.gain
      .exponentialRampToValueAtTime(
        0.0001,
        end
      );

    oscillator.connect(gain);

    gain.connect(masterGain);

    oscillator.start(start);

    oscillator.stop(
      end + 0.02
    );
  }


  /* =====================================
     AUTHENTICATION / KONAMI SUCCESS
     ===================================== */

  function unlock() {
    tone({
      frequency: 420,
      duration: 0.12,
      volume: 0.24
    });

    tone({
      frequency: 620,
      duration: 0.12,
      volume: 0.22,
      delay: 0.13
    });

    tone({
      frequency: 920,
      duration: 0.22,
      volume: 0.28,
      delay: 0.27
    });
  }


  /* =====================================
     TECH SYSTEM BOOT
     ===================================== */

  function boot() {
    tone({
      frequency: 150,
      endFrequency: 460,
      duration: 0.65,
      volume: 0.18,
      type: "sawtooth"
    });

    tone({
      frequency: 460,
      duration: 0.15,
      volume: 0.15,
      delay: 0.6
    });

    tone({
      frequency: 720,
      duration: 0.24,
      volume: 0.18,
      delay: 0.72
    });
  }


  /* =====================================
     HOVER
     ===================================== */

  function hover() {
    tone({
      frequency: 850,
      duration: 0.025,
      volume: 0.045,
      type: "square"
    });
  }


  /* =====================================
     CLICK
     ===================================== */

  function click() {
    tone({
      frequency: 620,
      duration: 0.045,
      volume: 0.09,
      type: "triangle"
    });

    tone({
      frequency: 760,
      duration: 0.035,
      volume: 0.05,
      delay: 0.025
    });
  }


  /* =====================================
     PROJECT / MODAL OPEN
     ===================================== */

  function open() {
    tone({
      frequency: 220,
      endFrequency: 650,
      duration: 0.22,
      volume: 0.12,
      type: "sawtooth"
    });
  }


  /* =====================================
     MODAL CLOSE
     ===================================== */

  function close() {
    tone({
      frequency: 620,
      endFrequency: 180,
      duration: 0.18,
      volume: 0.1,
      type: "triangle"
    });
  }


  /* =====================================
     TERMINAL KEY
     ===================================== */

  function key() {
    const random =
      520 + Math.random() * 140;

    tone({
      frequency: random,
      duration: 0.018,
      volume: 0.025,
      type: "square"
    });
  }


  /* =====================================
     TERMINAL COMMAND SUCCESS
     ===================================== */

  function success() {
    tone({
      frequency: 620,
      duration: 0.07,
      volume: 0.1
    });

    tone({
      frequency: 850,
      duration: 0.1,
      volume: 0.12,
      delay: 0.075
    });
  }


  /* =====================================
     ERROR
     ===================================== */

  function error() {
    tone({
      frequency: 190,
      duration: 0.12,
      volume: 0.13,
      type: "square"
    });

    tone({
      frequency: 145,
      duration: 0.15,
      volume: 0.11,
      delay: 0.1,
      type: "square"
    });
  }


  /* =====================================
     MATRIX MODE
     ===================================== */

  function matrix() {
    for (
      let i = 0;
      i < 9;
      i++
    ) {
      tone({
        frequency:
          180 +
          Math.random() * 850,

        duration:
          0.03 +
          Math.random() * 0.06,

        volume: 0.04,

        delay:
          i * 0.035,

        type:
          Math.random() > 0.5
            ? "square"
            : "sawtooth"
      });
    }
  }


  /* =====================================
     COFFEE EASTER EGG
     ===================================== */

  function coffee() {
    const notes = [
      523,
      659,
      784,
      1046
    ];

    notes.forEach(
      (frequency, index) => {
        tone({
          frequency,
          duration: 0.12,
          volume: 0.1,
          delay: index * 0.1
        });
      }
    );
  }


  /* =====================================
     SHUTDOWN
     ===================================== */

  function shutdown() {
    tone({
      frequency: 740,
      endFrequency: 120,
      duration: 0.7,
      volume: 0.17,
      type: "sawtooth"
    });
  }


  /* =====================================
     SOUND SETTINGS
     ===================================== */

  function setEnabled(value) {
    enabled =
      Boolean(value);

    localStorage.setItem(
      "jb-tech-sound",
      enabled
        ? "on"
        : "off"
    );
  }

  function toggle() {
    setEnabled(!enabled);

    if (enabled) {
      success();
    }

    return enabled;
  }

  function isEnabled() {
    return enabled;
  }


  /* =====================================
     PUBLIC API
     ===================================== */

  window.TechSound = {
    unlock,
    boot,
    hover,
    click,
    open,
    close,
    key,
    success,
    error,
    matrix,
    coffee,
    shutdown,
    toggle,
    setEnabled,
    isEnabled
  };

})();