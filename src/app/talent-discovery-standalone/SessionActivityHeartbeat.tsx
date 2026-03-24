"use client";

import { useEffect } from "react";

const HEARTBEAT_THROTTLE_MS = 15_000;

export default function SessionActivityHeartbeat() {
  useEffect(() => {
    let lastSentAt = 0;

    const sendHeartbeat = () => {
      const now = Date.now();
      if (now - lastSentAt < HEARTBEAT_THROTTLE_MS) {
        return;
      }

      lastSentAt = now;

      void fetch("/api/account/session-activity", {
        method: "POST",
        cache: "no-store",
        credentials: "same-origin",
        keepalive: true,
      }).catch(() => {
        // Ignore transient network failures; the next user interaction will retry.
      });
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        sendHeartbeat();
      }
    };

    // Prime activity state when the standalone app first loads.
    sendHeartbeat();

    window.addEventListener("mousemove", sendHeartbeat, { passive: true });
    window.addEventListener("keydown", sendHeartbeat);
    window.addEventListener("click", sendHeartbeat);
    window.addEventListener("scroll", sendHeartbeat, { passive: true });
    window.addEventListener("touchstart", sendHeartbeat, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      window.removeEventListener("mousemove", sendHeartbeat);
      window.removeEventListener("keydown", sendHeartbeat);
      window.removeEventListener("click", sendHeartbeat);
      window.removeEventListener("scroll", sendHeartbeat);
      window.removeEventListener("touchstart", sendHeartbeat);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return null;
}
