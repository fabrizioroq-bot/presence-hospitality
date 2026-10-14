import { AuthCard } from "@/components/dashboard/AuthCard";
import { LoginForm } from "@/components/dashboard/AuthForms";
import { ClearPitchOffline } from "@/components/pitch/ClearPitchOffline";

export const metadata = { title: "Sign in" };

const ERRORS: Record<string, string> = {
  forbidden: "This account doesn't have access to the dashboard.",
  link: "That link is invalid or has expired. Ask for a new one below.",
};

export default async function LoginPage({
  searchParams,
}: PageProps<"/dashboard/login">) {
  const sp = await searchParams;
  const err = typeof sp.error === "string" ? ERRORS[sp.error] : undefined;
  return (
    <AuthCard title="Sign in" lead="Access is by invitation only.">
      <LoginForm initialError={err} />
      <ClearPitchOffline />
    </AuthCard>
  );
}
