import { AuthCard } from "@/components/dashboard/AuthCard";
import { ForgotForm } from "@/components/dashboard/AuthForms";

export const metadata = { title: "Reset password" };

export default function ForgotPage() {
  return (
    <AuthCard
      title="Reset password"
      lead="We'll email you a link to choose a new password."
    >
      <ForgotForm />
    </AuthCard>
  );
}
