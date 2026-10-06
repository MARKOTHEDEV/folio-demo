import Link from "next/link";
import { Logo } from "@/components/Logo";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="max-w-5xl w-full mx-auto px-5 py-5 flex items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/signin" className="font-semibold hover:text-green">Sign in</Link>
          <Link href="/signup" className="btn btn-primary">Get started</Link>
        </nav>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-5 pt-16 pb-24 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <h1 className="text-5xl font-bold tracking-tight leading-[1.05]">Send an invoice in a minute. Know when it&apos;s paid.</h1>
          <p className="text-muted text-lg mt-5">Add a client, list the work, send it. Folio keeps the numbers right and tells you what&apos;s outstanding.</p>
          <div className="flex gap-3 mt-8">
            <Link href="/signup" className="btn btn-primary">Create your account</Link>
            <Link href="/signin" className="btn btn-ghost">Sign in</Link>
          </div>
          <p className="text-xs text-muted mt-6">A demo app. No money moves, and your invoices stay in your browser.</p>
        </div>
        <div className="panel p-6 shadow-[0_20px_60px_-30px_rgba(20,33,28,0.35)]">
          <div className="flex justify-between text-sm text-muted"><span>INV-0042</span><span className="text-amber font-semibold">Sent</span></div>
          <p className="text-sm mt-4">Billed to</p>
          <p className="font-semibold">Acme Studio</p>
          <div className="border-t border-line mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>Brand refresh</span><span className="num">$2,400.00</span></div>
            <div className="flex justify-between"><span>Website copy · 3 pages</span><span className="num">$900.00</span></div>
            <div className="flex justify-between text-muted"><span>Tax 7.5%</span><span className="num">$247.50</span></div>
          </div>
          <div className="border-t border-line mt-4 pt-4 flex justify-between font-bold text-lg"><span>Total</span><span className="num">$3,547.50</span></div>
        </div>
      </main>
    </div>
  );
}
