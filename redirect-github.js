// ============================================================
// GITHUB PAGES → CLOUDFLARE REDIRECT
// ============================================================

(() => {
  if (
    window.location.hostname === "jbo11.github.io" &&
    window.location.pathname.startsWith("/JBo/")
  ) {
    const newPath =
      window.location.pathname.replace(
        /^\/JBo/,
        ""
      );

    const destination =
      "https://jbbo.pages.dev" +
      newPath +
      window.location.search +
      window.location.hash;

    window.location.replace(destination);
  }
})();