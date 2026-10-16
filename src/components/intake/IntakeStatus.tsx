import { Logo } from "@/components/brand/Logo";
import { site } from "@/content/site";

/** Friendly dead end for invalid, expired or revoked links, with our contact address. */
export function IntakeStatus({ lang, title, body }: { lang: string; title: string; body: string }) {
  const [before, after] = body.split("{email}");
  return (
    <main lang={lang} className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-8 px-4 py-16 sm:px-8">
      <Logo on="light" className="h-6" />
      <div className="ui-card flex flex-col gap-4 p-6 sm:p-10">
        <h1 className="text-display-lg text-(--ph-brand-primary)">{title}</h1>
        <p className="text-body-lg text-(--ph-text-secondary)">
          {before}
          {after !== undefined && (
            <>
              <a href={`mailto:${site.email}`} className="font-semibold text-(--ph-brand-primary) underline underline-offset-4">
                {site.email}
              </a>
              {after}
            </>
          )}
        </p>
      </div>
    </main>
  );
}
