import type { AnyRouter } from "@tanstack/react-router";

// Client-side beacon: fires a pageview to /api/collect on load + every navigation.
export function buildBeaconPayload(path: string, referrer: string, isFirst: boolean): string {
  const payload: { path: string; referrer?: string } = { path };
  if (isFirst && referrer) payload.referrer = referrer;
  return JSON.stringify(payload);
}

function send(path: string, isFirst: boolean) {
  if (typeof navigator === "undefined") return;
  const body = buildBeaconPayload(path, document.referrer, isFirst);
  const blob = new Blob([body], { type: "application/json" });
  if (!navigator.sendBeacon?.("/api/collect", blob)) {
    void fetch("/api/collect", {
      method: "POST",
      body,
      keepalive: true,
      headers: { "content-type": "application/json" },
    });
  }
}

export function initAnalytics(router: AnyRouter) {
  if (typeof window === "undefined") return;
  let first = true;
  let lastPath = "";

  const track = () => {
    const path = window.location.pathname;
    if (path === lastPath) return;
    lastPath = path;
    send(path, first);
    first = false;
  };

  track();
  router.subscribe("onResolved", track);
}
