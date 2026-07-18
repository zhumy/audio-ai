(function () {
  const storageKey = "audio-ai-theme";
  const root = document.documentElement;

  function getInitialTheme() {
    const requested = new URLSearchParams(window.location.search).get("theme");
    if (requested === "light" || requested === "dark") return requested;
    const saved = localStorage.getItem(storageKey);
    return saved === "light" || saved === "dark" ? saved : "dark";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
    const button = document.querySelector("[data-theme-toggle]");
    if (button) {
      const next = theme === "dark" ? "白色" : "黑色";
      button.textContent = `切换为${next}模式`;
      button.setAttribute("aria-label", `切换到${next}模式`);
      button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    }
  }

  applyTheme(getInitialTheme());

  document.addEventListener("DOMContentLoaded", () => {
    let button = document.querySelector("[data-theme-toggle]");
    if (!button) {
      button = document.createElement("button");
      button.type = "button";
      button.className = "theme-toggle";
      button.dataset.themeToggle = "";
    }
    // Keep the fixed theme control outside navigation containers that collapse
    // on narrow screens, so the control remains reachable on every viewport.
    if (button.parentElement !== document.body) document.body.appendChild(button);
    button.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
    applyTheme(root.dataset.theme || getInitialTheme());
  });
})();
