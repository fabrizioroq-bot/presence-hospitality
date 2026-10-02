import Image from "next/image";
import type { Photo } from "@/content/photos";
import { cn } from "@/lib/cn";

/**
 * A hospitality-world photograph (warm, natural, no tech effects): rounded, lazy-loaded, responsive.
 * The frame sets the ratio (pass an aspect-* class); the image covers it.
 */
export function EditorialPhoto({
  photo,
  alt,
  sizes,
  className,
  position = "50% 50%",
  priority = false,
}: {
  photo: Photo;
  alt: string;
  sizes: string;
  className?: string;
  /** object-position, to keep the subject in frame when the ratio crops. */
  position?: string;
  /** Near the top of the page (likely LCP): load eagerly with high priority. */
  priority?: boolean;
}) {
  return (
    <figure className={cn("relative overflow-hidden rounded-xl bg-mist-surface shadow-soft", className)}>
      <Image
        src={photo.src}
        alt={alt}
        width={photo.width}
        height={photo.height}
        sizes={sizes}
        quality={75}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        className="absolute inset-0 h-full w-full object-cover"
        style={{ objectPosition: position }}
      />
    </figure>
  );
}
