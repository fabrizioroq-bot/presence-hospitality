import { Shell } from "@/components/dashboard/Shell";
import { requireAdmin } from "@/lib/dashboard/auth";
import { ComponentsSection } from "./ComponentsSection";
import { FoundationsSection } from "./FoundationsSection";
import { LogoSection } from "./LogoSection";

// Admin-only reference of every brand token and shared component, for the website and the pitch.
// Noindex comes from the dashboard layout. Strings are internal and intentionally not translated.
export const metadata = { title: "UI kit" };

const NAV = [
  ["logo", "Logo"],
  ["colour", "Colour"],
  ["type", "Typography"],
  ["shape", "Shape & spacing"],
  ["components", "Components"],
  ["motion", "Motion"],
] as const;

export default async function UiKitPage() {
  const { user } = await requireAdmin();
  return (
    <Shell email={user.email ?? ""} section="UI kit">
      <div className="flex flex-col gap-24">
        <header className="flex flex-col gap-6">
          <p className="text-label text-paper-500">Brand foundation</p>
          <h1 className="text-display-xl">UI kit</h1>
          <p className="max-w-[68ch] text-body-lg text-paper-300">
            The single source for the logo, tokens and shared components of the website, the sales pitch and printed
            material. Rules live in <code>.claude/skills/presence-design</code>; tokens in <code>src/styles/kit.css</code>{" "}
            and <code>globals.css</code>.
          </p>
          <nav aria-label="UI kit sections">
            <ul className="flex flex-wrap gap-2">
              {NAV.map(([id, label]) => (
                <li key={id}>
                  <a
                    href={`#${id}`}
                    className="inline-flex min-h-11 items-center rounded-pill px-4 text-body-sm font-semibold ring-1 ring-line-night hover:bg-night-800"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </header>
        <LogoSection />
        <FoundationsSection />
        <ComponentsSection />
      </div>
    </Shell>
  );
}
