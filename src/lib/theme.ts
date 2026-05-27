export type ThemeMode = "light" | "dark" | "system";

const THEME_STORAGE_KEY = "loom-theme";

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  return (localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode) ?? "system";
}

export function setStoredTheme(mode: ThemeMode) {
  localStorage.setItem(THEME_STORAGE_KEY, mode);
  applyTheme(mode);
  window.dispatchEvent(new Event("theme-change"));
}

export function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  if (mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function getThemeLabel(mode: ThemeMode): string {
  if (mode === "light") return "라이트";
  if (mode === "dark") return "다크";
  return "시스템 설정";
}
