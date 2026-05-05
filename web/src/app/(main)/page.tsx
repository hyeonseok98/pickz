export default function Page() {
  return (
    <div className="grid grid-cols-12 gap-5 py-6">
      <section id="home" className="col-span-12 h-22 rounded-7 border border-border bg-surface" />
      <section className="col-span-12 min-h-60 rounded-7 border border-border bg-surface-muted" />
      <section className="col-span-7 min-h-70 rounded-7 border border-border bg-surface" />
      <section className="col-span-5 min-h-70 rounded-7 border border-border bg-surface" />
      <section className="col-span-4 min-h-55 rounded-7 border border-border bg-surface-muted" />
      <section className="col-span-4 min-h-55 rounded-7 border border-border bg-surface-muted" />
      <section className="col-span-4 min-h-55 rounded-7 border border-border bg-surface-muted" />
    </div>
  );
}
