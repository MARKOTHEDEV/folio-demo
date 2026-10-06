const STYLE: Record<string, string> = {
  draft: "bg-paper text-muted border-line",
  sent: "bg-amber-bg text-amber border-transparent",
  paid: "bg-mint text-green border-transparent",
};

export function StatusBadge({ status }: { status: string }) {
  return <span className={`inline-block rounded-full border px-2.5 py-0.5 text-xs font-semibold capitalize ${STYLE[status] ?? STYLE.draft}`}>{status}</span>;
}
