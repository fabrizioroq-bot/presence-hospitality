import { redirect } from "next/navigation";
import { AuthCard } from "@/components/dashboard/AuthCard";
import { AcceptLinkForm } from "@/components/dashboard/AuthForms";

export const metadata = { title: "Continue", robots: { index: false } };

const COPY = {
  invite: { title: "You're invited", lead: "Continue to choose your password for the dashboard." },
  recovery: { title: "Reset your password", lead: "Continue to choose a new password." },
} as const;

export default async function AcceptLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ token_hash?: string; type?: string }>;
}) {
  const { token_hash: tokenHash, type } = await searchParams;
  if (!tokenHash || (type !== "invite" && type !== "recovery")) redirect("/dashboard/login?error=link");
  return (
    <AuthCard title={COPY[type].title} lead={COPY[type].lead}>
      <AcceptLinkForm tokenHash={tokenHash} type={type} />
    </AuthCard>
  );
}
