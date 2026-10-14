import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { Card } from "@/components/ui/Card";
import { NumberBadge } from "@/components/ui/Labels";
import { SlideHeadline } from "../SlideHeadline";

const STEPS = ["checkin", "call", "receptionist"] as const;
/** Checklist ticks (ms after the kiosk build starts); stage/Lobby.tsx times the LED and key card to match. */
const TICKS = [600, 1300, 2000, 2700];

/**
 * Chapter 4. The camera follows the guest: 1 check-in at the kiosk (the checklist is real text pinned
 * to the 3D kiosk screen), 2 one tap on Call (ripple on the Holobox), 3 a receptionist forms, life-size.
 * The pinned panel must not sit inside a positioned wrapper: the chapter layer is its origin.
 */
export async function HowItWorks() {
  const t = await getTranslations({ locale: "en", namespace: "pitch.how" });
  const items = t.raw("kiosk.items") as string[];
  return (
    <div className="h-full">
      <div className="flex max-w-[34%] flex-col gap-[calc(var(--slide-u)*2.6)]">
        <SlideHeadline raw={t.raw("title")} className="text-slide-title" />
        <ol className="pitch-steps flex flex-col gap-[calc(var(--slide-u)*1.8)]">
          {STEPS.map((id, i) => (
            <li key={id} data-build={i} data-at={i} className="flex gap-[calc(var(--slide-u)*1.2)]">
              <NumberBadge n={i + 1} size="md" />
              <div className="flex flex-col gap-1">
                <h3 className="text-slide-h3">{t(`steps.${id}.title`)}</h3>
                <p className="text-slide-small text-ui-ink-2">{t(`steps.${id}.body`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>

      <div data-anchor="kiosk-screen" data-build="0" data-hide-from="1" className="pitch-anchor absolute top-0 left-0">
        <Card className="w-[max(13rem,calc(var(--slide-u)*13))] p-[calc(var(--slide-u)*1.2)]">
          <p className="text-slide-small font-semibold">{t("kiosk.title")}</p>
          <ul className="mt-2 flex flex-col gap-1.5">
            {items.map((item, i) => (
              <li key={item} data-build="0" style={{ "--d": `${TICKS[i]}ms` } as CSSProperties} className="flex items-center gap-2 text-slide-small">
                <svg aria-hidden viewBox="0 0 16 16" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 8.5l3 3 7-7" />
                </svg>
                {item}
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}
