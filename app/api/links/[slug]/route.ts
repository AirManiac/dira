import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  deleteLink,
  getLinkBySlug,
  updateLink,
} from "@/lib/redis/links";

const updateLinkSchema = z
  .object({
    destination: z
      .string()
      .trim()
      .url("Destination must be a valid URL.")
      .optional(),

    active: z.boolean().optional(),
  })
  .refine(
    (data) =>
      data.destination !== undefined ||
      data.active !== undefined,
    {
      message: "At least one field must be provided.",
    },
  );

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  _request: NextRequest,
  context: RouteContext,
) {
  const { slug } = await context.params;

  try {
    const link = await getLinkBySlug(slug);

    if (!link) {
      return NextResponse.json(
        {
          success: false,
          error: "Link not found.",
          message: `No active link exists for slug "${slug}".`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      link,
    });
  } catch (error) {
    console.error(
      `[links/${slug}] Failed to retrieve link:`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to retrieve link.",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: RouteContext,
) {
  const { slug } = await context.params;

  try {
    const body: unknown = await request.json();

    const result = updateLinkSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid update data.",
          issues: result.error.issues,
        },
        { status: 400 },
      );
    }

    const link = await updateLink(
      slug,
      result.data,
    );

    if (!link) {
      return NextResponse.json(
        {
          success: false,
          error: "Link not found.",
          message: `No link exists for slug "${slug}".`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      link,
    });
  } catch (error) {
    console.error(
      `[links/${slug}] Failed to update link:`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to update link.",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  context: RouteContext,
) {
  const { slug } = await context.params;

  try {
    const deleted = await deleteLink(slug);

    if (!deleted) {
      return NextResponse.json(
        {
          success: false,
          error: "Link not found.",
          message: `No link exists for slug "${slug}".`,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      message: `Link "${slug}" deleted successfully.`,
    });
  } catch (error) {
    console.error(
      `[links/${slug}] Failed to delete link:`,
      error,
    );

    return NextResponse.json(
      {
        success: false,
        error: "Failed to delete link.",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred.",
      },
      { status: 500 },
    );
  }
}