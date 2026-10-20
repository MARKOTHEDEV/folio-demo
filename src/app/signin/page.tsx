import { AuthShell } from "@/components/AuthShell";
import { PasswordForm } from "@/components/PasswordForm";

export default function SignIn() {
  return (
    <AuthShell title="Sign in to Folio" sub="With your password, or we can email you a code.">
      <PasswordForm />
    </AuthShell>
  );
}
