import { redis } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import type { ClickEvent } from "@/types/click";

export async function recordClick(
  event: ClickEvent,
): Promise<void> {
  await redis.set(
    redisKeys.click(event.id),
    event,
  );

  await redis.sadd(
    redisKeys.clicks(),
    event.id,
  );
}

export async function getClick(
  id: string,
): Promise<ClickEvent | null> {
  return redis.get<ClickEvent>(
    redisKeys.click(id),
  );
}

export async function getClicks(): Promise<
  ClickEvent[]
> {
  const ids = await redis.smembers(
    redisKeys.clicks(),
  );

  if (!ids.length) {
    return [];
  }

  const clicks = await Promise.all(
    ids.map((id) =>
      redis.get<ClickEvent>(
        redisKeys.click(String(id)),
      ),
    ),
  );

  return clicks
    .filter(
      (click): click is ClickEvent =>
        click !== null,
    )
    .sort(
      (a, b) => b.timestamp - a.timestamp,
    );
}

export async function getClicksForLink(
  slug: string,
): Promise<ClickEvent[]> {
  const clicks = await getClicks();

  return clicks.filter(
    (click) => click.slug === slug,
  );
}

export async function getClickCount(): Promise<number> {
  return redis.scard(
    redisKeys.clicks(),
  );
}

export async function deleteClick(
  id: string,
): Promise<boolean> {
  const deleted = await redis.del(
    redisKeys.click(id),
  );

  if (deleted > 0) {
    await redis.srem(
      redisKeys.clicks(),
      id,
    );
  }

  return deleted > 0;
}