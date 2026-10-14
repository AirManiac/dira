import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { generateClicks } from "@/lib/analytics/generate-clicks";
import { listLinks } from "@/lib/redis/links";

export const dynamic = "force-dynamic";

const querySchema = z.object({
limit: z.coerce
.number()
.int()
.min(1)
.max(100_000)
.default(100_000),
});

export async function GET(
request: NextRequest,
) {
const startedAt = performance.now();

try {
/*
* Validate query parameters.
*/
const result = querySchema.safeParse({
limit:
request.nextUrl.searchParams.get(
"limit",
) ?? undefined,
});

if (!result.success) {
  return NextResponse.json(
    {
      success: false,
      error: "Invalid query parameters.",
      issues: result.error.issues,
    },
    { status: 400 },
  );
}

const { limit } = result.data;

/*
 * Synthetic analytics data is intentionally
 * generated in memory for Day 2.
 *
 * Redis is only used to retrieve the real
 * links that the synthetic events reference.
 *
 * This prevents 100k+ analytics reads/writes
 * from consuming the Redis command quota.
 */
const links = await listLinks();

if (links.length === 0) {
  return NextResponse.json(
    {
      success: false,
      error: "No links available.",
      message:
        "Create at least one link before generating analytics data.",
    },
    { status: 400 },
  );
}

/*
 * Generate a deterministic dataset.
 *
 * Using the same seed means repeated requests
 * produce the same synthetic dataset structure
 * without needing to persist it.
 */
const generationStartedAt =
  performance.now();

const clicks = generateClicks({
  count: limit,
  links,
  seed: 42,
});

const generationTime =
  performance.now() -
  generationStartedAt;

/*
 * The dataset is intentionally NOT persisted.
 *
 * Day 2 is measuring browser-side processing:
 *
 * 1. JSON transfer
 * 2. Worker loading
 * 3. Worker filtering
 * 4. Worker sorting
 * 5. Virtualized rendering
 *
 * Persisting 100k synthetic events would add
 * Redis throughput to the experiment and consume
 * a large number of Redis commands.
 */
return NextResponse.json({
  success: true,
  source: "generated",
  count: clicks.length,
  totalAvailable: clicks.length,
  clicks,
  generationTime: Number(
    generationTime.toFixed(2),
  ),
  persistenceTime: 0,
  readTime: 0,
  apiTime: Number(
    (performance.now() - startedAt).toFixed(
      2,
    ),
  ),
});

} catch (error) {
console.error(
"[analytics/clicks] Failed to generate analytics:",
error,
);

return NextResponse.json(
  {
    success: false,
    error:
      "Failed to load analytics data.",
    message:
      error instanceof Error
        ? error.message
        : "An unexpected error occurred.",
    apiTime: Number(
      (performance.now() - startedAt).toFixed(
        2,
      ),
    ),
  },
  { status: 500 },
);

}
}
