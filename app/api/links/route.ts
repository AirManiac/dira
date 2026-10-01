import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  createLink,
  listLinks,
} from "@/lib/redis/links";

const createLinkSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required.")
    .max(100, "Slug must be 100 characters or fewer.")
    .regex(
      /^[a-zA-Z0-9-_]+$/,
      "Slug can only contain letters, numbers, hyphens, and underscores.",
    ),

  destination: z
    .string()
    .trim()
    .url("Destination must be a valid URL."),
});

export async function GET() {
  try {
    const links = await listLinks();

    return NextResponse.json({
      success: true,
      links,
      count: links.length,
    });
  } catch (error) {
    console.error("[links] Failed to list links:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to list links.",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while retrieving links.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();

    const result = createLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid link data.",
          issues: result.error.issues,
        },
        { status: 400 },
      );
    }

    const link = await createLink(result.data);

    return NextResponse.json(
      {
        success: true,
        link,
      },
      { status: 201 },
    );
  } catch (error) {
    if (
      error instanceof Error &&
      error.message.includes("already exists")
    ) {
      return NextResponse.json(
        {
          success: false,
          error: "Slug already exists.",
          message: error.message,
        },
        { status: 409 },
      );
    }

    console.error("[links] Failed to create link:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Failed to create link.",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred while creating the link.",
      },
      { status: 500 },
    );
  }
}