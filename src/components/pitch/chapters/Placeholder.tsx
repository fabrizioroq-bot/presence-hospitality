import { SlideHeadline } from "../SlideHeadline";

/** Temporary chapter body (title only) until the chapter is built in its phase. */
export function Placeholder({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex h-full flex-col justify-end gap-[calc(var(--slide-u)*1.6)]">
      <SlideHeadline raw={title} className="text-slide-title" />
      <p data-build="0" className="text-slide-body text-ui-muted">
        {note}
      </p>
    </div>
  );
}
