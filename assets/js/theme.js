(function () {
  const storageKey = "audio-ai-theme";
  const root = document.documentElement;

  function getInitialTheme() {
    const saved = localStorage.getItem(storageKey);
    return saved === "light" || saved === "dark" ? saved : "dark";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    localStorage.setItem(storageKey, theme);
    const button = document.querySelector("[data-theme-toggle]");
    if (button) {
      const next = theme === "dark" ? "白色" : "黑色";
      button.textContent = `${theme === "dark" ? "黑色" : "白色"}模式`;
      button.setAttribute("aria-label", `切换到${next}模式`);
      button.setAttribute("aria-pressed", theme === "light" ? "true" : "false");
    }
  }

  applyTheme(getInitialTheme());

  document.addEventListener("DOMContentLoaded", () => {
    if (document.querySelector("[data-theme-toggle]")) return;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "theme-toggle";
    button.dataset.themeToggle = "";
    button.addEventListener("click", () => {
      applyTheme(root.dataset.theme === "dark" ? "light" : "dark");
    });
    document.body.appendChild(button);
    applyTheme(root.dataset.theme || getInitialTheme());
  });
})();
