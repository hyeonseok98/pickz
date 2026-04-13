import { AppShell } from "@/components/layout/app-shell";

export default function Page() {
  return (
    <AppShell contentClassName="grid grid-cols-12 gap-5 py-6">
      <section id="home" className="col-span-12 h-[88px] rounded-[28px] border border-border bg-surface" />
      <section className="col-span-12 min-h-[240px] rounded-[28px] border border-border bg-surface-muted" />
      <section className="col-span-7 min-h-[280px] rounded-[28px] border border-border bg-surface" />
      <section className="col-span-5 min-h-[280px] rounded-[28px] border border-border bg-surface" />
      <section className="col-span-4 min-h-[220px] rounded-[28px] border border-border bg-surface-muted" />
      <section className="col-span-4 min-h-[220px] rounded-[28px] border border-border bg-surface-muted" />
      <section className="col-span-4 min-h-[220px] rounded-[28px] border border-border bg-surface-muted" />
    </AppShell>
  );
}
