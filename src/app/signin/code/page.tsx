import { AuthShell } from "@/components/AuthShell";
import { StartForm } from "@/components/StartForm";

export default function SignInWithCode() {
  return (
    <AuthShell title="Sign in with a code" sub="We'll email you a 6-digit code.">
      <StartForm withName={false} />
    </AuthShell>
  );
}
