import { Suspense } from "react";
import { AuthShell } from "@/components/AuthShell";
import { ResetForm } from "./ResetForm";

export default function Reset() {
  return (
    <AuthShell title="Choose a new password" sub="Enter the code we emailed you, then your new password.">
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
