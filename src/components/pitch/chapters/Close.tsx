import type { CSSProperties } from "react";
import { getTranslations } from "next-intl/server";
import { site } from "@/content/site";
import { Card } from "@/components/ui/Card";
import { QrCode } from "../QrCode";
import { SlideHeadline } from "../SlideHeadline";

const delay = (ms: number): CSSProperties => ({ "--d": `${ms}ms` }) as CSSProperties;

/**
 * Chapter 8, the bookend: the Holobox from the cover returns with a receptionist in it (WebGL stage).
 * Build 1: the invitation, contacts (site.ts only: no phone, no partner names) and a QR code to the
 * website. Build 2: "thank you" while the receptionist nods.
 */
export async function Close() {
  const t = await getTranslations({ locale: "en", namespace: "pitch.close" });
  const { email, displayUrl, domainUrl, address } = site;
  return (
    <div className="flex h-full max-w-[56%] flex-col justify-end gap-[calc(var(--slide-u)*2.4)]">
      <SlideHeadline raw={t.raw("title")} className="text-slide-title" />
      <p data-build="0" style={delay(600)} className="max-w-[36ch] text-slide-lead text-ui-ink-2">
        {t("sub")}
      </p>
      <div data-build="0" style={delay(850)} className="flex items-end gap-[calc(var(--slide-u)*2.4)]">
        <Card className="pitch-qr shrink-0 p-[calc(var(--slide-u)*0.8)]">
          <QrCode value={domainUrl} label={t("qr")} className="block h-[max(8rem,calc(var(--slide-u)*11))] w-auto" />
        </Card>
        <address className="flex flex-col gap-1 text-slide-body not-italic">
          <span className="text-slide-small font-semibold text-ui-muted">{t("contactLabel")}</span>
          <a href={`mailto:${email}`} className="font-semibold underline-offset-4 hover:underline">
            {email}
          </a>
          <a href={domainUrl} className="font-semibold underline-offset-4 hover:underline">
            {displayUrl}
          </a>
          <span className="text-ui-ink-2">
            {address.street}, {address.postalCode} {address.city}
          </span>
        </address>
      </div>
      <p data-build="1" className="text-slide-h3">
        {t("thanks")}
      </p>
    </div>
  );
}
