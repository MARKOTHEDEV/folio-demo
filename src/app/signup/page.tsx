import { AuthShell } from "@/components/AuthShell";
import { StartForm } from "@/components/StartForm";

export default function SignUp() {
  return (
    <AuthShell title="Create your Folio account" sub="We'll email you a 6-digit code — no password to remember.">
      <StartForm withName />
    </AuthShell>
  );
}
