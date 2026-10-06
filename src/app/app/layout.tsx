"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/Logo";
import { api, getToken, setToken } from "@/lib/client-api";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const path = usePathname();
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/signin");
      return;
    }
    api<{ user?: { name: string } }>("/api/me").then((r) => r.ok && setName(r.data.user?.name ?? null));
  }, [router]);

  const tab = (href: string, label: string) => {
    const active = href === "/app" ? path === "/app" || path.startsWith("/app/invoices") : path.startsWith(href);
    return (
      <Link href={href} className={`px-3 py-2 rounded-lg text-sm font-semibold ${active ? "bg-mint text-green" : "text-muted hover:text-ink"}`}>
        {label}
      </Link>
    );
  };

  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b border-line bg-card">
        <div className="max-w-5xl mx-auto px-5 h-16 flex items-center gap-6">
          <Logo href="/app" />
          <nav className="flex gap-1">
            {tab("/app", "Invoices")}
            {tab("/app/clients", "Clients")}
          </nav>
          <div className="ml-auto flex items-center gap-4 text-sm">
            {name && <span className="text-muted hidden sm:inline">{name}</span>}
            <button
              className="font-semibold hover:text-green"
              onClick={() => {
                setToken(null);
                router.push("/");
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 py-8">{children}</main>
    </div>
  );
}
