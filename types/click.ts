export type DeviceType = "desktop" | "mobile" | "tablet" | "bot";

export type ClickStatus = "success" | "redirect" | "not_found" | "error";

export interface ClickEvent {
  id: string;

  timestamp: number;

  linkId: string;
  slug: string;
  destination: string;

  country: string;
  city: string;
  latitude: number;
  longitude: number;

  referrer: string | null;
  userAgent: string;
  device: DeviceType;

  status: ClickStatus;
  responseTime: number;
}