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

export async function createLink(
  input: Pick<Link, "slug" | "destination">,
): Promise<Link> {
  const existing = await redis.get<Link>(
    redisKeys.link(input.slug),
  );

  if (existing) {
    throw new Error(
      `A link with the slug "${input.slug}" already exists.`,
    );
  }

  const now = Date.now();

  const link: Link = {
    id: crypto.randomUUID(),
    slug: input.slug,
    destination: input.destination,
    active: true,
    createdAt: now,
    updatedAt: now,
  };

  await redis.set(
    redisKeys.link(link.slug),
    link,
  );

  await redis.sadd(
    redisKeys.links(),
    link.slug,
  );

  return link;
}

export async function listLinks(): Promise<Link[]> {
  const slugs = await redis.smembers(
    redisKeys.links(),
  );

  if (!slugs.length) {
    return [];
  }

  const links = await Promise.all(
    slugs.map((slug) =>
      redis.get<Link>(
        redisKeys.link(String(slug)),
      ),
    ),
  );

  return links
    .filter((link): link is Link => link !== null)
    .sort((a, b) => b.createdAt - a.createdAt);
}

export async function updateLink(
  slug: string,
  updates: Partial<
    Pick<Link, "destination" | "active">
  >,
): Promise<Link | null> {
  const link = await redis.get<Link>(
    redisKeys.link(slug),
  );

  if (!link) {
    return null;
  }

  const updatedLink: Link = {
    ...link,
    ...updates,
    updatedAt: Date.now(),
  };

  await redis.set(
    redisKeys.link(slug),
    updatedLink,
  );

  return updatedLink;
}

export async function deleteLink(
  slug: string,
): Promise<boolean> {
  const deleted = await redis.del(
    redisKeys.link(slug),
  );

  if (deleted > 0) {
    await redis.srem(
      redisKeys.links(),
      slug,
    );
  }

  return deleted > 0;
}