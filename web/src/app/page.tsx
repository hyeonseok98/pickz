"use client";

import { useEffect, useState } from "react";

type ThemeMode = "light" | "dark";

function getInitialThemeMode(): ThemeMode {
  if (typeof window === "undefined") {
    return "light";
  }

  const savedThemeMode = window.localStorage.getItem("theme-mode");

  if (savedThemeMode === "light" || savedThemeMode === "dark") {
    return savedThemeMode;
  }

  const prefersDarkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;

  return prefersDarkMode ? "dark" : "light";
}

export default function Page() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(getInitialThemeMode);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themeMode);
    window.localStorage.setItem("theme-mode", themeMode);
  }, [themeMode]);

  const handleThemeToggle = () => {
    setThemeMode((previousThemeMode) => {
      return previousThemeMode === "light" ? "dark" : "light";
    });
  };

  return (
    <main className="min-h-screen bg-background text-text-primary">
      <section className="mx-auto flex max-w-[1200px] flex-col gap-8 px-6 py-10">
        <header className="flex items-center justify-between">
          <div className="flex flex-col gap-2">
            <span className="text-sm text-text-secondary">pick:z</span>
            <h1 className="text-3xl font-semibold">홈</h1>
            <p className="text-sm text-text-muted">
              semantic token 기반 다크모드 테스트 화면입니다.
            </p>
          </div>

          <button
            type="button"
            onClick={handleThemeToggle}
            className="flex cursor-pointer items-center justify-center rounded-xl border border-border bg-surface px-4 py-2 text-sm font-medium text-text-primary transition-colors hover:bg-surface-muted"
          >
            {themeMode === "light" ? "다크모드" : "라이트모드"}
          </button>
        </header>

        <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <span className="text-sm font-semibold text-accent-primary">Featured</span>
            <h2 className="text-xl font-semibold text-text-primary">공연과 드래프트를 한 곳에서</h2>
            <p className="text-sm leading-6 text-text-secondary">
              같은 클래스만 사용하고, 토큰 값만 바뀌도록 구성한 테스트 카드입니다.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                className="cursor-pointer rounded-xl bg-accent-primary px-4 py-2 text-sm font-medium text-text-inverse transition-colors hover:bg-accent-primary-hover"
              >
                시작하기
              </button>
              <button
                type="button"
                className="cursor-pointer rounded-xl border border-border bg-surface-muted px-4 py-2 text-sm font-medium text-text-primary transition-colors"
              >
                더 보기
              </button>
            </div>
          </article>

          <article className="flex flex-col gap-4 rounded-2xl border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-text-primary">합방 예정</h2>
              <span className="rounded-full bg-surface-muted px-3 py-1 text-xs text-text-secondary">
                오늘 4건
              </span>
            </div>

            <ul className="flex flex-col gap-3">
              <li className="rounded-xl border border-border bg-surface-muted p-4">
                <p className="text-sm font-medium text-text-primary">롤 내전 5:5</p>
                <p className="mt-1 text-sm text-text-muted">Team A vs Team B · 오후 8시</p>
              </li>
              <li className="rounded-xl border border-border bg-surface-muted p-4">
                <p className="text-sm font-medium text-text-primary">토크 합방</p>
                <p className="mt-1 text-sm text-text-muted">4명 참여 · 오후 10시</p>
              </li>
            </ul>
          </article>
        </section>
      </section>
    </main>
  );
}
