import { Logo } from "./Logo";

export function AuthShell({ title, sub, children }: { title: string; sub?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex-1 flex flex-col items-center px-5 py-10">
      <Logo />
      <div className="panel w-full max-w-md p-8 mt-10">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {sub && <p className="text-muted mt-2 text-sm">{sub}</p>}
        <div className="mt-6">{children}</div>
      </div>
    </div>
  );
}
