export default function CompetitionPage() {
  return (
    <div className="space-y-5 py-6">
      <section className="rounded-3xl border border-border bg-surface p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-muted">
          Competition
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-text-primary">
          대회
        </h1>
        <p className="mt-2 text-sm text-text-muted">
          대회 정보와 진행 현황을 보여줄 페이지입니다.
        </p>
      </section>

      <section className="min-h-96 rounded-3xl border border-border bg-surface-muted" />
    </div>
  );
}
