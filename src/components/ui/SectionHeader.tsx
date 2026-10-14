import type { ReactNode } from "react";
import { Logo } from "@/components/brand/Logo";
import { cx as cn } from "@/lib/cx";

/**
 * The deck's header bar: logo on the left, optional meta on the right, a hairline rule below.
 * Used by pitch chapters and printable pages; the site's navbar has its own chrome.
 */
export function SectionHeader({
  meta,
  href,
  hasRule = true,
  className,
}: {
  /** Right-hand text: chapter title, date, page number. */
  meta?: ReactNode;
  /** Makes the logo a link (e.g. to the overview). */
  href?: string;
  hasRule?: boolean;
  className?: string;
}) {
  const logo = <Logo className="h-6 lg:h-7" />;
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex min-h-11 items-center justify-between gap-6">
        {href ? (
          <a href={href} className="inline-flex min-h-11 items-center rounded-sm">
            {logo}
          </a>
        ) : (
          logo
        )}
        {meta && <div className="text-right text-body-sm font-semibold text-ui-ink-2">{meta}</div>}
      </div>
      {hasRule && <hr className="ui-rule" />}
    </div>
  );
}
