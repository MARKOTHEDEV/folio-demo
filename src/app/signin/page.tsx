import { AuthShell } from "@/components/AuthShell";
import { StartForm } from "@/components/StartForm";

export default function SignIn() {
  return (
    <AuthShell title="Sign in to Folio" sub="We'll email you a 6-digit code.">
      <StartForm withName={false} />
    </AuthShell>
  );
}
