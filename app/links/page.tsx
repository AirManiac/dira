"use client";

import { useEffect, useState } from "react";

import { CreateLinkForm } from "@/components/links/create-link-form";
import { LinkList } from "@/components/links/link-list";
import { LinkWorkspace } from "@/components/links/link-workspace";

interface LinkItem {
  id: string;
  slug: string;
  destination: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

export default function LinksPage() {
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(
    null,
  );

  useEffect(() => {
    async function loadLinks() {
      try {
        const response = await fetch("/api/links", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message ??
              data.error ??
              "Unable to load links.",
          );
        }

        setLinks(data.links);
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : "Unable to load links.",
        );
      } finally {
        setIsLoading(false);
      }
    }

    loadLinks();
  }, []);

  function handleCreated(link: LinkItem) {
    setLinks((current) => [link, ...current]);
    setError(null);
  }

  async function handleDelete(slug: string) {
    const previousLinks = links;

    setLinks((current) =>
      current.filter((link) => link.slug !== slug),
    );

    try {
      const response = await fetch(
        `/api/links/${encodeURIComponent(slug)}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.message ??
            data.error ??
            "Unable to delete link.",
        );
      }
    } catch (error) {
      setLinks(previousLinks);

      setError(
        error instanceof Error
          ? error.message
          : "Unable to delete link.",
      );
    }
  }

  return (
    <LinkWorkspace>
      <div className="flex flex-1 flex-col">
        <CreateLinkForm onCreated={handleCreated} />

        {isLoading ? (
          <section className="flex flex-1 items-center justify-center py-12">
            <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[#555550]">
              Loading links...
            </p>
          </section>
        ) : (
          <LinkList
            links={links}
            onDelete={handleDelete}
          />
        )}

        {error ? (
          <div className="border-t border-[#292927] px-1 py-3">
            <div className="flex items-center gap-2">
              <span
                aria-hidden="true"
                className="size-1 shrink-0 rounded-full bg-[#a64a43]"
              />

              <p className="font-mono text-[9px] uppercase tracking-[0.08em] text-[#a64a43]">
                {error}
              </p>
            </div>
          </div>
        ) : null}
      </div>
    </LinkWorkspace>
  );
}