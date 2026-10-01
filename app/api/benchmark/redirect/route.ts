import { NextRequest, NextResponse } from "next/server";

import { lookupRedirect } from "@/lib/edge/lookup";

type BenchmarkResult = {
  iterations: number;
  slug: string;
  average: number;
  min: number;
  max: number;
  p50: number;
  p95: number;
  p99: number;
};

function percentile(values: number[], percentile: number): number {
  const index = Math.ceil((percentile / 100) * values.length) - 1;

  return values[Math.max(0, index)];
}

export async function GET(request: NextRequest) {
  const slug = request.nextUrl.searchParams.get("slug") ?? "github";

  const requestedIterations = Number(
    request.nextUrl.searchParams.get("iterations") ?? 100,
  );

  const iterations = Math.min(
    Math.max(Math.floor(requestedIterations), 1),
    10_000,
  );

  try {
    // Warm-up request.
    await lookupRedirect(slug);

    const timings: number[] = [];

    for (let i = 0; i < iterations; i++) {
      const start = performance.now();

      const link = await lookupRedirect(slug);

      const elapsed = performance.now() - start;

      if (!link) {
        return NextResponse.json(
          {
            error: "Link not found",
            message: `No active link exists for slug "${slug}".`,
          },
          { status: 404 },
        );
      }

      timings.push(elapsed);
    }

    timings.sort((a, b) => a - b);

    const total = timings.reduce(
      (sum, timing) => sum + timing,
      0,
    );

    const result: BenchmarkResult = {
      iterations,
      slug,

      average: total / timings.length,
      min: timings[0],
      max: timings[timings.length - 1],

      p50: percentile(timings, 50),
      p95: percentile(timings, 95),
      p99: percentile(timings, 99),
    };

    return NextResponse.json({
      success: true,
      benchmark: result,
    });
  } catch (error) {
    console.error("[benchmark/redirect] Failed:", error);

    return NextResponse.json(
      {
        error: "Redirect benchmark failed",
        message:
          error instanceof Error
            ? error.message
            : "Unknown error",
      },
      { status: 500 },
    );
  }
}