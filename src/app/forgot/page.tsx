import { AuthShell } from "@/components/AuthShell";
import { ForgotForm } from "./ForgotForm";

export default function Forgot() {
  return (
    <AuthShell title="Forgot your password?" sub="Enter your email and we'll send you a link to choose a new one.">
      <ForgotForm />
    </AuthShell>
  );
}
