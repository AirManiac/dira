import { NextResponse } from "next/server";

import { redis } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";

export async function GET() {
  const link = {
    id: crypto.randomUUID(),
    slug: "github",
    destination: "https://github.com",
    active: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await redis.set(redisKeys.link(link.slug), link);

  return NextResponse.json({
    success: true,
    link,
  });
}