export type ThemeChoice = "light" | "dark" | "system";
const THEME_KEY = "ws_theme_override";

export function systemPref(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function resolve(choice: ThemeChoice | undefined | null): "light" | "dark" {
  const c = (choice ?? "system") as ThemeChoice;
  return c === "system" ? systemPref() : c;
}

export function applyTheme(choice: ThemeChoice) {
  document.documentElement.setAttribute("data-theme", resolve(choice));
}

export function getThemeOverride(): ThemeChoice | null {
  const v = localStorage.getItem(THEME_KEY);
  return v === "light" || v === "dark" || v === "system" ? (v as ThemeChoice) : null;
}
export function setThemeOverride(choice: ThemeChoice) {
  localStorage.setItem(THEME_KEY, choice);
}
export function clearThemeOverride() {
  localStorage.removeItem(THEME_KEY);
}

export function getCurrentResolved(): "light" | "dark" {
  return (document.documentElement.getAttribute("data-theme") as "light" | "dark") || "light";
}