import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/Breadcrumbs";

export function PageHeader({
  eyebrow,
  title,
  lede,
  children,
  crumbs,
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  children?: ReactNode;
  crumbs?: Crumb[];
}) {
  return (
    <section className="border-b border-border">
      {crumbs && <Breadcrumbs items={crumbs} />}
      <div className="mx-auto max-w-7xl px-6 pb-16 pt-10 lg:px-10 lg:pb-24 lg:pt-16">
        <p className="animate-fade-up font-eyebrow text-muted-foreground">
          {eyebrow}
        </p>
        <h1 className="animate-fade-up animate-fade-up-delay-1 mt-5 max-w-4xl font-display text-5xl leading-[1.05] md:text-6xl">
          {title}
        </h1>
        {lede && (
          <p className="animate-fade-up animate-fade-up-delay-2 mt-6 max-w-2xl text-lg text-muted-foreground">
            {lede}
          </p>
        )}
        {children && (
          <div className="animate-fade-up animate-fade-up-delay-3 mt-8">
            {children}
          </div>
        )}
      </div>
    </section>
  );
}

export function PlaceholderNote({ children }: { children: ReactNode }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-16 lg:px-10">
      <div className="rounded-lg border border-dashed border-border bg-muted/40 p-8 text-sm text-muted-foreground">
        {children}
      </div>
    </section>
  );
}
