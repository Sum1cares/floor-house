/** Map a deep-link URL (https host or custom scheme) onto an in-house path. */
export function pathFromAppUrl(raw: string): string | null {
  try {
    const url = new URL(raw);
    if (url.protocol === "https:" || url.protocol === "http:") {
      return `${url.pathname || "/"}${url.search}${url.hash}`;
    }
    const host = url.hostname || "";
    let path = url.pathname || "";
    if (!path || path === "/") path = host ? `/${host}` : "/";
    else if (host) path = `/${host}${path.startsWith("/") ? path : `/${path}`}`;
    if (!path.startsWith("/")) path = `/${path}`;
    path = path.replace(/\/{2,}/g, "/");
    return `${path}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

export async function bootNativeShell() {
  if (typeof window === "undefined") return;
  try {
    const { Capacitor } = await import("@capacitor/core");
    if (!Capacitor.isNativePlatform()) return;
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    const { SplashScreen } = await import("@capacitor/splash-screen");
    const { App } = await import("@capacitor/app");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#0a0a0b" }).catch(() => undefined);
    await SplashScreen.hide();
    await App.addListener("backButton", ({ canGoBack }) => {
      if (canGoBack) window.history.back();
      else void App.exitApp();
    });
    await App.addListener("appUrlOpen", ({ url }) => {
      const path = pathFromAppUrl(url);
      if (path && path !== window.location.pathname + window.location.search + window.location.hash) {
        window.location.assign(path);
      }
    });
  } catch {
    /* web preview — plugins absent */
  }
}
