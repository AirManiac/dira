import type { ClickEvent } from "@/types/click";

export function recordClick(event: ClickEvent): void {
  void fetch("/api/clicks", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  }).catch(() => {
    // Telemetry failure must never block the redirect path.
  });
}