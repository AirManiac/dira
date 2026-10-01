"use client";

import Link from "next/link";

interface LinkItem {
  id: string;
  slug: string;
  destination: string;
  active: boolean;
  createdAt: number;
  updatedAt: number;
}

interface LinkListProps {
  links: LinkItem[];
  onDelete?: (slug: string) => void;
}

export function LinkList({
  links,
  onDelete,
}: LinkListProps) {
  async function handleDelete(slug: string) {
    if (onDelete) {
      onDelete(slug);
    }
  }

  return (
    <section className="flex min-h-0 flex-1 flex-col py-6 sm:py-7">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-[#6d9b82]">
            Links
          </p>

          <p className="mt-1 text-xs text-[#777771]">
            Every redirect is measurable.
          </p>
        </div>

        <span className="font-mono text-[9px] uppercase tracking-[0.1em] text-[#555550]">
          {links.length.toString().padStart(2, "0")} total
        </span>
      </div>

      <div className="mt-5 min-h-0 flex-1">
        {links.length === 0 ? (
          <div className="flex min-h-40 items-center justify-center border-y border-[#292927]">
            <div className="text-center">
              <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-[#555550]">
                No links yet
              </p>

              <p className="mt-2 text-xs text-[#777771]">
                Create your first tracked link above.
              </p>
            </div>
          </div>
        ) : (
          <div className="border-t border-[#292927]">
            <div className="hidden grid-cols-[minmax(180px,1fr)_minmax(220px,1.4fr)_90px_100px_70px] gap-4 border-b border-[#292927] px-3 py-2.5 sm:grid">
              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#555550]">
                Link
              </span>

              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#555550]">
                Destination
              </span>

              <span className="font-mono text-[8px] uppercase tracking-[0.12em] text-[#555550]">
                Status
              </span>

              <span className="text-right font-mono text-[8px] uppercase tracking-[0.12em] text-[#555550]">
                Clicks
              </span>

              <span />
            </div>

            <div>
              {links.map((link) => (
                <article
                  key={link.id}
                  className="group grid gap-3 border-b border-[#292927] px-3 py-4 transition-colors duration-200 hover:bg-[#111110] sm:grid-cols-[minmax(180px,1fr)_minmax(220px,1.4fr)_90px_100px_70px] sm:items-center sm:gap-4"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/links/${encodeURIComponent(link.slug)}`}
                      className="font-mono text-xs text-[#f2f1ed] transition-colors duration-200 hover:text-[#8eae9c]"
                    >
                      /{link.slug}
                    </Link>

                    <p className="mt-1 truncate font-mono text-[9px] text-[#555550] sm:hidden">
                      {link.destination}
                    </p>
                  </div>

                  <a
                    href={link.destination}
                    target="_blank"
                    rel="noreferrer"
                    title={link.destination}
                    className="hidden min-w-0 truncate font-mono text-[10px] text-[#777771] transition-colors duration-200 hover:text-[#b5b5af] sm:block"
                  >
                    {link.destination}
                  </a>

                  <div>
                    <span className="inline-flex items-center gap-1.5 font-mono text-[8px] uppercase tracking-[0.08em]">
                      <span
                        aria-hidden="true"
                        className={[
                          "size-1 rounded-full",
                          link.active
                            ? "bg-[#6d9b82]"
                            : "bg-[#555550]",
                        ].join(" ")}
                      />

                      <span
                        className={
                          link.active
                            ? "text-[#6d9b82]"
                            : "text-[#555550]"
                        }
                      >
                        {link.active
                          ? "Active"
                          : "Paused"}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end">
                    <span className="font-mono text-xs tabular-nums text-[#f2f1ed]">
                      0
                    </span>

                    <span className="ml-3 font-mono text-[8px] uppercase tracking-[0.08em] text-[#555550] sm:hidden">
                      clicks
                    </span>
                  </div>

                  <div className="flex items-center justify-start sm:justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        handleDelete(link.slug)
                      }
                      className="font-mono text-[8px] uppercase tracking-[0.1em] text-[#555550] opacity-100 transition-colors duration-200 hover:text-[#a64a43] sm:opacity-0 sm:group-hover:opacity-100"
                      aria-label={`Delete /${link.slug}`}
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}