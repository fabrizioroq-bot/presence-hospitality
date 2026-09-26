import { AuthCard } from "@/components/dashboard/AuthCard";
import { SetPasswordForm } from "@/components/dashboard/AuthForms";
import { requireUser } from "@/lib/dashboard/auth";

export const metadata = { title: "Set your password" };

export default async function SetPasswordPage() {
  const { user } = await requireUser();
  return (
    <AuthCard title="Set your password" lead={`For ${user.email}.`}>
      <SetPasswordForm />
    </AuthCard>
  );
}
