import { redis } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import type { Link } from "@/types/link";

export async function getLinkBySlug(
  slug: string,
): Promise<Link | null> {
  const link = await redis.get<Link>(redisKeys.link(slug));

  if (!link || !link.active) {
    return null;
  }

  return link;
}