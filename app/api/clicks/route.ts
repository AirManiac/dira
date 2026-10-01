import { NextRequest, NextResponse } from "next/server";

import { clickEventSchema } from "@/lib/data/click-schema";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const result = clickEventSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          error: "Invalid click event",
          issues: result.error.issues,
        },
        { status: 400 },
      );
    }

    const event = result.data;

    console.log("[click]", event);

    return NextResponse.json(
      {
        success: true,
        id: event.id,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[clicks] Failed to process event:", error);

    return NextResponse.json(
      {
        error: "Failed to process click event",
      },
      { status: 500 },
    );
  }
}
