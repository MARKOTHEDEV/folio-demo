import Link from "next/link";

export function Logo({ href = "/" }: { href?: string }) {
  return (
    <Link href={href} className="text-xl font-bold tracking-tight">
      folio<span className="text-green">.</span>
    </Link>
  );
}
