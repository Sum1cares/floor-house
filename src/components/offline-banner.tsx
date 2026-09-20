import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [online, setOnline] = useState(true);

  useEffect(() => {
    const sync = () => setOnline(typeof navigator === "undefined" ? true : navigator.onLine);
    sync();
    window.addEventListener("online", sync);
    window.addEventListener("offline", sync);
    let handle: { remove: () => Promise<void> } | undefined;
    void import("@capacitor/network")
      .then(({ Network }) => Network.addListener("networkStatusChange", (s) => setOnline(s.connected)))
      .then((h) => {
        handle = h;
      })
      .catch(() => undefined);
    return () => {
      window.removeEventListener("online", sync);
      window.removeEventListener("offline", sync);
      void handle?.remove();
    };
  }, []);

  if (online) return null;

  return (
    <p
      role="status"
      className="sticky top-0 z-[70] border-b border-border bg-elevated px-3 py-2 text-center text-xs text-fg"
    >
      You are offline. The house needs a connection — vaults, markets, and the tape stay on the floor.
    </p>
  );
}
