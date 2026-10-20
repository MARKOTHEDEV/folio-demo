import { AuthShell } from "@/components/AuthShell";
import { StartForm } from "@/components/StartForm";

export default function SignUp() {
  return (
    <AuthShell title="Create your Folio account" sub="Choose a password, then we'll email you a 6-digit code to confirm it's you.">
      <StartForm withName />
    </AuthShell>
  );
}
