import { redis } from "@/lib/redis/client";
import { redisKeys } from "@/lib/redis/keys";
import type { ClickEvent } from "@/types/click";

/**

* Record a real click event.
*
* Synthetic Day 2 analytics are generated in memory
* and are intentionally not persisted to Redis.
  */
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

/**

* Retrieve a single real click event.
  */
  export async function getClick(
  id: string,
  ): Promise<ClickEvent | null> {
  return redis.get<ClickEvent>(
  redisKeys.click(id),
  );
  }
