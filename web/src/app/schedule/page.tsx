import { AppShell } from "@/components/layout/app-shell";

export default function SchedulePage() {
  return (
    <AppShell contentClassName="space-y-5">
      <section className="rounded-3xl border border-border bg-surface p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
          Schedule
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
          일정
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          합방과 경기 일정을 정리할 페이지입니다.
        </p>
      </section>

      <section className="min-h-96 rounded-3xl border border-border bg-surface-muted" />
    </AppShell>
  );
}
