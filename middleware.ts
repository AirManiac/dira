import { NextRequest, NextResponse } from "next/server";

import { lookupRedirect } from "@/lib/edge/lookup";
import { createRedirectResponse } from "@/lib/edge/redirect";
import { recordClick } from "@/lib/edge/telemetry";
import type { DeviceType } from "@/types/click";

function getDeviceType(userAgent: string): DeviceType {
  const ua = userAgent.toLowerCase();

  if (
    ua.includes("bot") ||
    ua.includes("crawler") ||
    ua.includes("spider") ||
    ua.includes("slurp")
  ) {
    return "bot";
  }

  if (
    ua.includes("ipad") ||
    ua.includes("tablet") ||
    ua.includes("android") && !ua.includes("mobile")
  ) {
    return "tablet";
  }

  if (
    ua.includes("mobile") ||
    ua.includes("iphone") ||
    ua.includes("ipod")
  ) {
    return "mobile";
  }

  return "desktop";
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Only handle redirect URLs.
  if (!pathname.startsWith("/r/")) {
    return NextResponse.next();
  }

  const slug = pathname.slice(3);

  if (!slug) {
    return NextResponse.next();
  }

  const startTime = performance.now();

  const link = await lookupRedirect(slug);

  if (!link) {
    return NextResponse.next();
  }

  const responseTime = performance.now() - startTime;

  const userAgent = request.headers.get("user-agent") ?? "";

  const event = {
    id: crypto.randomUUID(),

    timestamp: Date.now(),

    linkId: link.id,
    slug: link.slug,
    destination: link.destination,

    country:
      request.headers.get("x-vercel-ip-country") ?? "unknown",

    city:
      request.headers.get("x-vercel-ip-city") ?? "unknown",

    latitude: Number(
      request.headers.get("x-vercel-ip-latitude") ?? 0,
    ),

    longitude: Number(
      request.headers.get("x-vercel-ip-longitude") ?? 0,
    ),

    referrer: request.headers.get("referer"),

    userAgent,

    device: getDeviceType(userAgent),

    status: "redirect" as const,

    responseTime,
  };

  recordClick(request.url, event);

  return createRedirectResponse(link);
}

export const config = {
  matcher: ["/r/:path*"],
};
