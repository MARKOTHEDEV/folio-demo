import { AuthShell } from "@/components/AuthShell";
import { VerifyForm } from "./VerifyForm";

export default async function Verify({ searchParams }: PageProps<"/verify">) {
  const { email } = await searchParams;
  const to = typeof email === "string" ? email : "";
  return (
    <AuthShell title="Check your email" sub={to ? <>We sent a code to <strong className="text-ink">{to}</strong>.</> : "We sent you a code."}>
      <VerifyForm />
    </AuthShell>
  );
}
