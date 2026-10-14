import type { CSSProperties, ReactNode } from "react";
import { getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import { Card } from "@/components/ui/Card";
import { Chip, NumberBadge } from "@/components/ui/Labels";
import { cx } from "@/lib/cx";
import { SlideHeadline } from "../SlideHeadline";

type ItemId = "holobox" | "connection" | "service" | "fallback" | "dashboards";
const order = (i: number): CSSProperties => ({ "--i": i }) as CSSProperties;

/** Packets travelling both ways along a link (SVG animation, no JS; hidden for reduced motion). */
function Packets({ y, className }: { y: number; className?: string }) {
  return (
    <g className={cx("net-packets", className)}>
      {[0, 0.6, 1.2].map((delay) => (
        <circle key={`f${delay}`} r="8" fill="var(--pitch-pill-from)">
          <animateMotion dur="1.8s" begin={`-${delay}s`} repeatCount="indefinite" path={`M0 ${y} H300`} />
        </circle>
      ))}
      {[0.3, 0.9].map((delay) => (
        <circle key={`b${delay}`} r="6" fill="var(--ui-ink)">
          <animateMotion dur="2.2s" begin={`-${delay}s`} repeatCount="indefinite" path={`M300 ${y} H0`} />
        </circle>
      ))}
    </g>
  );
}

function Link({ label, redundant, failover }: { label: string; redundant?: boolean; failover?: string }) {
  return (
    <div className="flex flex-col items-center gap-2 self-center">
      <span className="text-center text-slide-small font-semibold text-ui-ink-2">{label}</span>
      <svg aria-hidden viewBox="0 0 300 120" className={cx("w-full overflow-visible", redundant && "net-redundant")}>
        <line className="net-primary" x1="0" x2="300" y1="40" y2="40" stroke="var(--ui-ink)" strokeWidth="4" />
        <Packets y={40} className="net-primary-packets" />
        {redundant && (
          <>
            <g className="net-break" opacity={0}>
              <line x1="138" x2="162" y1="28" y2="52" stroke="var(--ui-ink)" strokeWidth="4" strokeLinecap="round" />
              <line x1="162" x2="138" y1="28" y2="52" stroke="var(--ui-ink)" strokeWidth="4" strokeLinecap="round" />
            </g>
            <line className="net-backup" x1="0" x2="300" y1="84" y2="84" stroke="var(--ui-ink)" strokeWidth="3" strokeDasharray="10 8" />
            <Packets y={84} className="net-backup-packets" />
          </>
        )}
      </svg>
      {failover && (
        <span data-build="1" className="text-center text-slide-small text-ui-ink-2">
          {failover}
        </span>
      )}
    </div>
  );
}

function Node({ title, body, highlight, i }: { title: string; body: string; highlight?: boolean; i: number }) {
  return (
    <div data-build="0" style={order(i * 2)}>
      <Card variant={highlight ? "highlight" : "outline"} className="flex flex-col gap-1 p-[calc(var(--slide-u)*1.6)]">
        <h3 className="text-slide-h3">{title}</h3>
        <p className="text-slide-small text-ui-ink-2">{body}</p>
      </Card>
    </div>
  );
}

/**
 * Chapter 5. Build 1: lobby → (secure VPN, redundant internet) → Amsterdam hub → your systems, with
 * packets flowing. Build 2: the main line fails and the backup carries the traffic. Build 3: the five
 * things that are included.
 */
export async function BehindTheScenes({ locale }: { locale: Locale }) {
  const t = await getTranslations({ locale, namespace: "pitch" });
  const d = (k: string) => t(`behind.diagram.${k}`);
  const card = (id: ItemId, i: number, className: string, extra?: ReactNode) => (
    <li key={id} data-build="2" style={order(i)} className={className}>
      <Card variant={id === "dashboards" ? "highlight" : "outline"} className="flex h-full flex-col gap-[calc(var(--slide-u)*0.8)] p-[calc(var(--slide-u)*1.6)]">
        <NumberBadge n={i + 1} size="sm" />
        <h3 className="text-slide-h3">{t(`behind.items.${id}.title`)}</h3>
        <p className="text-slide-small text-ui-ink-2">{t(`behind.items.${id}.body`)}</p>
        {extra}
      </Card>
    </li>
  );

  return (
    <div className="flex h-full flex-col gap-[calc(var(--slide-u)*2.4)]">
      <SlideHeadline raw={t.raw("behind.title")} className="text-slide-title" />
      <div className="grid flex-1">
        <figure data-hide-from="2" className="col-start-1 row-start-1 self-center">
          <figcaption className="sr-only">{d("desc")}</figcaption>
          <div className="grid grid-cols-[1fr_0.9fr_1.1fr_0.7fr_1fr] items-center gap-[calc(var(--slide-u)*1.2)]">
            <Node title={d("lobby.title")} body={d("lobby.body")} i={0} />
            <div data-build="0" style={order(1)}>
              <Link label={d("link")} redundant failover={d("failover")} />
            </div>
            <Node title={d("hub.title")} body={d("hub.body")} highlight i={1} />
            <div data-build="0" style={order(3)}>
              <Link label={d("systemsLink")} />
            </div>
            <Node title={d("systems.title")} body={d("systems.body")} i={2} />
          </div>
        </figure>
        <div className="col-start-1 row-start-1 flex flex-col gap-[calc(var(--slide-u)*1.4)] self-end">
          <h3 data-build="2" className="text-slide-h3">
            {t("behind.includedTitle")}
          </h3>
          <ul className="grid grid-cols-6 gap-[calc(var(--slide-u)*1.2)]">
            {card("holobox", 0, "col-span-2")}
            {card("connection", 1, "col-span-2")}
            {card("service", 2, "col-span-2")}
            {card("fallback", 3, "col-span-2")}
            {card(
              "dashboards",
              4,
              "col-span-4",
              <ul className="flex flex-wrap gap-2">
                {(t.raw("behind.items.dashboards.kpis") as string[]).map((k) => (
                  <li key={k}>
                    <Chip className="text-slide-small">{k}</Chip>
                  </li>
                ))}
              </ul>,
            )}
          </ul>
          <div data-build="2" style={order(5)} className="flex flex-wrap items-center gap-2">
            <span className="mr-2 text-slide-small font-semibold">{t("behind.stackLabel")}</span>
            {(t.raw("solution.integrations") as string[]).map((name) => (
              <Chip key={name} className="text-slide-small">
                {name}
              </Chip>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
