import { Suspense } from "react";
import { AuthShell } from "@/components/AuthShell";
import { ResetForm } from "./ResetForm";

export default function Reset() {
  return (
    <AuthShell title="Choose a new password" sub="You got here from the link in your email.">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
