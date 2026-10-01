import type { ReactNode } from "react";

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  children?: ReactNode;
}

export function PageIntro({
  eyebrow,
  title,
  description,
  children,
}: PageIntroProps) {
  return (
    <section className="container-shell py-20 sm:py-28 lg:py-36">
      <div className="reading-width">
        <p className="eyebrow mb-6 text-[var(--color-accent)]">
          {eyebrow}
        </p>

        <h1 className="display-heading max-w-4xl text-5xl sm:text-6xl lg:text-8xl">
          {title}
        </h1>

        <p className="mt-8 max-w-2xl text-base leading-7 text-[var(--color-ink-muted)] sm:text-lg sm:leading-8">
          {description}
        </p>

        {children ? (
          <div className="mt-8">
            {children}
          </div>
        ) : null}
      </div>
    </section>
  );
}
