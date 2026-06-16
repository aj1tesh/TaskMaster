export function startAppNavigation() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("app-navigation-start"));
  }
}
