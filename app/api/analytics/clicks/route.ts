import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { generateClicks } from "@/lib/analytics/generate-clicks";
import {
  getClickCount,
  getClicks,
  recordClick,
} from "@/lib/analytics/clicks";
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
     * Check whether the analytics dataset already exists.
     */
    const existingCount =
      await getClickCount();

    if (existingCount > 0) {
      const readStartedAt =
        performance.now();

      const clicks = await getClicks();

      const readTime =
        performance.now() - readStartedAt;

      const selectedClicks =
        clicks.slice(0, limit);

      return NextResponse.json({
        success: true,
        source: "redis",
        count: selectedClicks.length,
        totalAvailable: clicks.length,
        clicks: selectedClicks,
        generationTime: 0,
        readTime: Number(
          readTime.toFixed(2),
        ),
        apiTime: Number(
          (performance.now() - startedAt).toFixed(
            2,
          ),
        ),
      });
    }

    /*
     * Synthetic events reference real links
     * created through the link management UI.
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
     */
    const generationStartedAt =
      performance.now();

    const clicks = generateClicks({
      count: limit,
      links,
      seed: 42,
    });

    const generationTime =
      performance.now() - generationStartedAt;

    /*
     * Persist the dataset.
     *
     * This is intentionally simple for the POC.
     * We will replace the one-request-per-event
     * approach with a bulk operation if Redis
     * becomes the bottleneck.
     */
    const persistenceStartedAt =
      performance.now();

    await Promise.all(
      clicks.map((click) =>
        recordClick(click),
      ),
    );

    const persistenceTime =
      performance.now() -
      persistenceStartedAt;

    return NextResponse.json({
      success: true,
      source: "generated",
      count: clicks.length,
      totalAvailable: clicks.length,
      clicks,
      generationTime: Number(
        generationTime.toFixed(2),
      ),
      persistenceTime: Number(
        persistenceTime.toFixed(2),
      ),
      apiTime: Number(
        (performance.now() - startedAt).toFixed(
          2,
        ),
      ),
    });
  } catch (error) {
    console.error(
      "[analytics/clicks] Failed to load analytics:",
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