"use client";

import {
  FormEvent,
  useState,
} from "react";

interface CreatedLink {
  id: string;
  slug: string;
  destination: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

interface CreateLinkFormProps {
  onCreated?: (link: CreatedLink) => void;
}

export function CreateLinkForm({
  onCreated,
}: CreateLinkFormProps) {
  const [destination, setDestination] = useState("");
  const [slug, setSlug] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(
    null,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isCreating) {
      return;
    }

    const normalizedDestination =
      destination.trim();

    const normalizedSlug = slug.trim();

    if (!normalizedDestination) {
      setError("Enter a destination URL.");
      return;
    }

    if (!normalizedSlug) {
      setError("Enter a slug.");
      return;
    }

    setIsCreating(true);
    setError(null);

    try {
      const response = await fetch("/api/links", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          destination: normalizedDestination,
          slug: normalizedSlug,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to create link.",
        );
      }

      setDestination("");
      setSlug("");

      onCreated?.(data.link);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to create link.",
      );
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="border-b border-[#292927] py-6 sm:py-7">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6d9b82]">
              Create link
            </p>

            <p className="mt-1 text-xs text-[#777771]">
              Turn any URL into a tracked short link.
            </p>
          </div>

          <span className="hidden font-mono text-[9px] uppercase tracking-[0.1em] text-[#555550] sm:block">
            POST /api/links
          </span>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-2 sm:flex-row"
        >
          <div className="flex min-w-0 flex-1 items-center border border-[#353532] bg-[#111110] transition-colors focus-within:border-[#666660]">
            <span className="hidden shrink-0 px-3 font-mono text-[10px] text-[#555550] sm:block">
              URL
            </span>

            <input
              type="url"
              value={destination}
              onChange={(event) =>
                setDestination(event.target.value)
              }
              placeholder="https://example.com/article"
              disabled={isCreating}
              autoComplete="off"
              spellCheck={false}
              className="min-w-0 flex-1 bg-transparent px-3 py-3 font-mono text-xs text-[#f2f1ed] outline-none placeholder:text-[#4f4f4b] disabled:opacity-50 sm:py-3.5"
              aria-label="Destination URL"
            />
          </div>

          <div className="flex min-w-0 items-center border border-[#353532] bg-[#111110] transition-colors focus-within:border-[#666660] sm:w-52">
            <span className="shrink-0 pl-3 font-mono text-[10px] text-[#555550]">
              /
            </span>

            <input
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(event.target.value)
              }
              placeholder="github"
              disabled={isCreating}
              autoComplete="off"
              spellCheck={false}
              pattern="[a-zA-Z0-9-_]+"
              className="min-w-0 flex-1 bg-transparent px-2 py-3 font-mono text-xs text-[#f2f1ed] outline-none placeholder:text-[#4f4f4b] disabled:opacity-50 sm:py-3.5"
              aria-label="Link slug"
            />
          </div>

          <button
            type="submit"
            disabled={
              isCreating ||
              !destination.trim() ||
              !slug.trim()
            }
            className="shrink-0 border border-[#f2f1ed] bg-[#f2f1ed] px-6 py-3 font-mono text-[9px] font-medium uppercase tracking-[0.12em] text-[#0d0d0c] transition-opacity duration-200 hover:opacity-75 disabled:cursor-not-allowed disabled:opacity-30 sm:py-3.5"
          >
            {isCreating ? "Creating..." : "Create link"}
          </button>
        </form>

        {error ? (
          <div className="flex items-start gap-2 pt-1">
            <span
              aria-hidden="true"
              className="mt-1.5 size-1 shrink-0 rounded-full bg-[#a64a43]"
            />

            <p className="font-mono text-[10px] leading-5 text-[#a64a43]">
              {error}
            </p>
          </div>
        ) : null}
      </div>
    </section>
  );
}