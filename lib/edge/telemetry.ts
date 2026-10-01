import type { ClickEvent } from "@/types/click";

export function recordClick(
  requestUrl: string,
  event: ClickEvent,
): void {
  const url = new URL("/api/clicks", requestUrl);

  void fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(event),
  }).catch((error) => {
    console.error("[telemetry] Failed to record click:", error);
  });
}