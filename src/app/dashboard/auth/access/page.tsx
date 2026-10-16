import { redirect } from "next/navigation";
import { AuthCard } from "@/components/dashboard/AuthCard";
import { AcceptAccessForm } from "@/components/dashboard/AuthForms";
import { isLiveAccessToken } from "@/lib/dashboard/access-link";
import { ACCESS_TOKEN_FORMAT } from "@/lib/dashboard/access-token";

export const metadata = { title: "Continue", robots: { index: false } };

// Landing page of a "Generate link" email. Opening it changes nothing (previews and mail scanners
// open links too); the person is signed in only when they press Continue (acceptAccess).
export default async function AccessLinkPage({ searchParams }: PageProps<"/dashboard/auth/access">) {
  const { t } = await searchParams;
  if (typeof t !== "string" || !ACCESS_TOKEN_FORMAT.test(t) || !isLiveAccessToken(t)) {
    redirect("/dashboard/login?error=link");
  }
  return (
    <AuthCard title="You're invited" lead="Continue to choose your password for the dashboard.">
      <AcceptAccessForm token={t} />
    </AuthCard>
  );
}
