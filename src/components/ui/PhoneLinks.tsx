import { getTranslations } from "next-intl/server";
import { site } from "@/content/site";
import { cn } from "@/lib/cn";

const LABEL = { sales: "phoneSales", support: "phoneSupport" } as const;

/** Sales + support numbers, each with its label ("Sales +31 6 …"). Styling comes from the caller. */
export async function PhoneLinks({
  className,
  itemClassName,
  labelClassName,
  linkClassName,
  as: List = "span",
}: {
  className?: string;
  itemClassName?: string;
  labelClassName?: string;
  linkClassName?: string;
  as?: "span" | "ul";
}) {
  const c = await getTranslations("common");
  const Item = List === "ul" ? "li" : "span";
  return (
    <List className={cn("flex flex-col gap-1", className)}>
      {site.phones.map((p) => (
        <Item key={p.key} className={cn("flex flex-wrap gap-x-2", itemClassName)}>
          <span className={labelClassName}>{c(LABEL[p.key])}</span>
          <a href={p.href} className={linkClassName}>
            {p.display}
          </a>
        </Item>
      ))}
    </List>
  );
}
