import { Container } from "@/components/layout/container";
import { MenuSidebarExample } from "@/components/sidebar";

export default function Page() {
  return (
    <main
      id="home"
      className="min-h-screen bg-[linear-gradient(180deg,#ffffff_0%,#f6f8fc_100%)] text-text-primary"
    >
      <MenuSidebarExample />

      <div className="min-w-0 pl-70">
        <Container>
          <section className="flex min-h-screen flex-col py-6" aria-label="빈 콘텐츠 영역">
            <header className="flex h-16 items-start justify-end border-b border-[#111111]/8 pb-5">
              <button
                type="button"
                className="inline-flex h-10 items-center justify-center rounded-full border border-[#111111]/10 bg-[#111111] px-5 text-sm font-medium text-white transition-colors hover:bg-[#222222]"
              >
                로그인
              </button>
            </header>

            <div className="grid flex-1 grid-cols-12 gap-5 py-6">
              <section className="col-span-12 h-[88px] rounded-[28px] border border-[#111111]/8 bg-white" />
              <section className="col-span-12 min-h-[240px] rounded-[28px] border border-[#111111]/8 bg-[#fafafa]" />
              <section className="col-span-7 min-h-[280px] rounded-[28px] border border-[#111111]/8 bg-white" />
              <section className="col-span-5 min-h-[280px] rounded-[28px] border border-[#111111]/8 bg-white" />
              <section className="col-span-4 min-h-[220px] rounded-[28px] border border-[#111111]/8 bg-[#fafafa]" />
              <section className="col-span-4 min-h-[220px] rounded-[28px] border border-[#111111]/8 bg-[#fafafa]" />
              <section className="col-span-4 min-h-[220px] rounded-[28px] border border-[#111111]/8 bg-[#fafafa]" />
            </div>
          </section>
        </Container>
      </div>
    </main>
  );
}
