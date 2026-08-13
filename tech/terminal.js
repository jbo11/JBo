(() => {
  const form =
    document.getElementById(
      "terminalForm"
    );
  const input =
    document.getElementById(
      "terminalInput"
    );
  const output =
    document.getElementById(
      "terminalOutput"
    );
  if (
    !form ||
    !input ||
    !output
  ) {
    return;
  }
  const commands = {
    help: () => [
      "Available commands:",
      "  about       profile summary",
      "  projects    list project archive",
      "  skills      show current stack",
      "  experience  show experience log",
      "  contact     contact information",
      "  matrix      visual easter egg",
      "  coffee      developer maintenance protocol",
      "  konami      acknowledge the unlock",
      "  clear       clear terminal",
      "  exit        return to standard profile"
    ],
    about: () => [
      "JB builds web systems, automation, internal tools, and digital operations workflows.",
      "Profile mode: technical layer behind the business-support portfolio."
    ],
    projects: () =>
      (
        window.TECH_PROJECTS ||
        []
      ).map(
        (p) =>
          `${p.number}  ${p.title}  [${p.status}]`
      ),
    skills: () => [
      "WEB        HTML / CSS / JavaScript / responsive UI",
      "COMMERCE   Shopify / Liquid / storefront management",
      "AUTOMATION Google Apps Script / spreadsheet workflows",
      "TECH OPS   hardware / networks / database sync / troubleshooting"
    ],
    experience: () => [
      "2020—NOW   Cavalini, Inc. — Shopify, internal apps, automation, technical support",
      "2019—2025  Freelance — websites, design, mobile-app project coordination",
      "2024—2026  Associate Degree — Web Software Technology"
    ],
    contact: () => [
      "EMAIL      ibo1183@gmail.com",
      "LINKEDIN   linkedin.com/in/jbbo/",
      "LOCATION   Los Angeles, CA"
    ],
    coffee: () => {
      window.TechSound?.coffee();
      return [
        "Brewing...",
        "☕ caffeine module loaded",
        "Developer performance: +50%"
      ];
    },
    konami: () => [
      "Correct.",
      "You found the hidden portfolio.",
      "↑ ↑ ↓ ↓ ← → ← → B A"
    ],
    matrix: () => {
      window.TechSound?.matrix();
      window.dispatchEvent(
        new CustomEvent(
          "tech:matrix"
        )
      );
      return [
        "Opening visual layer... press ESC to return."
      ];
    },
    exit: () => {
      window.TechSound?.shutdown();
      setTimeout(
        () =>
          window.location.assign(
            "../index.html"
          ),
        750
      );
      return [
        "Closing developer environment...",
        "Shutting down JB_TECH..."
      ];
    }
  };
  function print(
    lines,
    className = ""
  ) {
    for (
      const line
      of lines
    ) {
      const div =
        document.createElement(
          "div"
        );
      div.className =
        className;
      div.textContent =
        line;
      output.appendChild(
        div
      );
    }
    output.scrollTop =
      output.scrollHeight;
  }
  function run(raw) {
    const command =
      raw
        .trim()
        .toLowerCase();
    if (!command) return;
    print(
      [
        `jb@portfolio:~/tech$ ${raw}`
      ],
      "terminal-command"
    );
    if (
      command === "clear"
    ) {
      output.innerHTML =
        "";
      return;
    }
    if (
      commands[command]
    ) {
      window.TechSound?.success();
      print(
        commands[command](),
        "terminal-response"
      );
    } else {
      window.TechSound?.error();
      print(
        [
          `command not found: ${command}`,
          "type 'help' for available commands"
        ],
        "terminal-error"
      );
    }
  }
  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      const value =
        input.value;
      input.value =
        "";
      run(value);
    }
  );
  document
    .getElementById(
      "terminalWindow"
    )
    ?.addEventListener(
      "click",
      () => input.focus()
    );
  print(
    [
      "JB_TECH shell v1.0",
      "Access granted. Type 'help' to inspect the system.",
      ""
    ],
    "terminal-response"
  );
  // Terminal Keyboard Sounds
  input.addEventListener(
    "keydown",
    (event) => {
      if (
        event.key.length === 1
      ) {
        window.TechSound?.key();
      }
    }
  );
})();