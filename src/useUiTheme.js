import { useCallback, useState } from "react";

// Тема интерфейса (тёмная/светлая) — синхронизирована с data-theme на <html> и localStorage.
export function currentUiTheme() {
  return document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light";
}

export function useUiTheme() {
  const [theme, setTheme] = useState(currentUiTheme());
  const apply = useCallback((t) => {
    document.documentElement.setAttribute("data-theme", t);
    try { localStorage.setItem("ui-theme", t); } catch (e) { /* приватный режим */ }
    setTheme(t);
  }, []);
  const toggle = useCallback(() => apply(currentUiTheme() === "dark" ? "light" : "dark"), [apply]);
  return { theme, toggle };
}
