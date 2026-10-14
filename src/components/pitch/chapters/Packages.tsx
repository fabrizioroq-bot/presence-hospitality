import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { PackageRing, type PackageStrings } from "../PackageRing";
import { SlideHeadline } from "../SlideHeadline";

const CHAPTER = 5;

/** Chapter 6 (charcoal). Builds: Night-Only → Day + Evening → 24/7 Premium with the add-ons. */
export async function Packages() {
  const t = await getTranslations({ locale: "en", namespace: "pitch.packages" });
  const strings: PackageStrings = {
    items: t.raw("items") as PackageStrings["items"],
    bands: t.raw("bands") as PackageStrings["bands"],
    startHere: t("startHere"),
    illustrative: t("illustrative"),
    ringLabel: t("ringLabel"),
  };
  return (
    <div className="flex h-full flex-col gap-[calc(var(--slide-u)*2.4)]">
      <SlideHeadline raw={t.raw("title")} className="text-slide-title" />
      <div data-build="0" style={{ "--d": "300ms" } as CSSProperties} className="flex-1">
        <PackageRing strings={strings} chapter={CHAPTER} />
      </div>
    </div>
  );
}
