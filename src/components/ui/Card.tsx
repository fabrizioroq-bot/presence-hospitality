import type { HTMLAttributes, ReactNode } from "react";
import { cx as cn } from "@/lib/cx";

type CardProps = {
  as?: "div" | "article" | "li" | "section";
  /** "highlight": the gradient fill. Use at most one per group. */
  variant?: "outline" | "highlight";
  className?: string;
  children: ReactNode;
} & Omit<HTMLAttributes<HTMLElement>, "className" | "children">;

/** Outlined card (kit.css .ui-card): radius 24, translucent fill, 1px (site) / 1.5px (pitch) line. */
export function Card({ as: Tag = "div", variant = "outline", className, children, ...rest }: CardProps) {
  return (
    <Tag
      className={cn("ui-card", className)}
      data-variant={variant === "highlight" ? "highlight" : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Equal columns inside a card, separated by dividers; stacked below lg. */
export function CardColumns({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("ui-card-cols", className)}>{children}</div>;
}
