"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { cn } from "@/utils";
import { z } from "zod";
import { useMemo, useState } from "react";

function SearchIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <circle cx="8.5" cy="8.5" r="5.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="m13 13 4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path d="M15 10H5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path
        d="m9 6-4 4 4 4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="size-4" aria-hidden="true">
      <path
        d="M16.5 10a6.5 6.5 0 1 1-1.9-4.6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12.5 3.5h3.7v3.7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const streamerSearchItemSchema = z.object({
  id: z.number().int().nonnegative(),
  channelId: z.string().min(1),
  channelName: z.string().min(1),
  profileImageUrl: z.string().min(1),
});

const streamerSearchResponseSchema = z.array(streamerSearchItemSchema);

type StreamerSearchItem = z.infer<typeof streamerSearchItemSchema>;

function getApiBaseUrlConfigurationError(value: string) {
  if (value.length === 0) {
    return "NEXT_PUBLIC_API_BASE_URL 환경 변수가 없습니다.";
  }

  try {
    new URL(value);

    return null;
  } catch {
    return "NEXT_PUBLIC_API_BASE_URL 값이 올바른 URL 형식이 아닙니다.";
  }
}

function createApiUrl(baseUrl: string, pathname: string) {
  return new URL(pathname.replace(/^\/+/, ""), `${baseUrl.replace(/\/+$/, "")}/`);
}

function createStreamerSearchUrl(baseUrl: string, keyword: string) {
  const url = createApiUrl(baseUrl, "streamers/search");
  url.searchParams.set("keyword", keyword);

  return url;
}

function createLoginUrl(baseUrl: string) {
  return createApiUrl(baseUrl, "auths/login");
}

function createLogoutUrl(baseUrl: string) {
  return createApiUrl(baseUrl, "auths/logout");
}

async function readResponsePayload(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }

  try {
    const text = await response.text();

    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

function getApiErrorMessage(payload: unknown, fallbackMessage: string) {
  if (payload && typeof payload === "object" && "message" in payload && typeof payload.message === "string") {
    return payload.message;
  }

  return fallbackMessage;
}

function getApiErrorDetail(payload: unknown) {
  if (payload && typeof payload === "object" && "detail" in payload && typeof payload.detail === "string") {
    return payload.detail;
  }

  if (typeof payload === "string") {
    return payload;
  }

  return "";
}

async function fetchStreamerSearchResults(baseUrl: string, keyword: string) {
  if (baseUrl.length === 0) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL 환경 변수가 없습니다.");
  }

  let response: Response;

  try {
    response = await fetch(createStreamerSearchUrl(baseUrl, keyword).toString(), {
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "알 수 없는 오류";

    throw new Error(`브라우저에서 API 직접 호출에 실패했습니다. ${detail}`);
  }

  let payload: unknown = null;

  payload = await readResponsePayload(response);

  if (!response.ok) {
    const message = getApiErrorMessage(payload, "스트리머 검색 API 호출에 실패했습니다.");
    const detail = getApiErrorDetail(payload);

    throw new Error(detail ? `${message} ${detail}` : message);
  }

  return streamerSearchResponseSchema.parse(payload);
}

async function logout(baseUrl: string) {
  if (baseUrl.length === 0) {
    throw new Error("NEXT_PUBLIC_API_BASE_URL 환경 변수가 없습니다.");
  }

  let response: Response;

  try {
    response = await fetch(createLogoutUrl(baseUrl).toString(), {
      method: "POST",
      credentials: "include",
      headers: {
        Accept: "application/json",
      },
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "알 수 없는 오류";

    throw new Error(`브라우저에서 로그아웃 API 직접 호출에 실패했습니다. ${detail}`);
  }

  const payload = await readResponsePayload(response);

  if (!response.ok) {
    const message = getApiErrorMessage(payload, "로그아웃 API 호출에 실패했습니다.");
    const detail = getApiErrorDetail(payload);

    throw new Error(detail ? `${message} ${detail}` : message);
  }

  return {
    payload,
    status: response.status,
  };
}

function StatusChip({ label, tone }: { label: string; tone: "default" | "error" | "success" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold",
        tone === "success"
          ? "bg-emerald-100 text-emerald-700"
          : tone === "error"
            ? "bg-rose-100 text-rose-700"
            : "bg-surface-muted text-text-secondary",
      )}
    >
      {label}
    </span>
  );
}

function ResultCard({ streamer }: { streamer: StreamerSearchItem }) {
  return (
    <article className="flex items-center gap-4 rounded-3xl border border-border bg-surface px-4 py-4">
      <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-muted">
        {/* API 테스트 화면이라 upstream 이미지 URL 원본을 그대로 확인합니다. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={streamer.profileImageUrl}
          alt={streamer.channelName}
          className="size-full object-cover"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate text-base font-semibold text-text-primary">{streamer.channelName}</h3>
          <StatusChip label={`id ${streamer.id}`} tone="default" />
        </div>
        <p className="mt-1 text-sm text-text-secondary">@{streamer.channelId}</p>
        <p className="mt-2 truncate text-xs text-text-muted">{streamer.profileImageUrl}</p>
      </div>
    </article>
  );
}

export default function DraftApiTestPage() {
  const [keyword, setKeyword] = useState("");
  const [submittedKeyword, setSubmittedKeyword] = useState("");
  const [lastLogoutRequestedAt, setLastLogoutRequestedAt] = useState<number | null>(null);
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ?? "";
  const configurationError = getApiBaseUrlConfigurationError(apiBaseUrl);
  const loginUrl = configurationError ? "" : createLoginUrl(apiBaseUrl).toString();
  const logoutUrl = configurationError ? "" : createLogoutUrl(apiBaseUrl).toString();

  const searchQuery = useQuery({
    queryKey: ["streamer-api-test", apiBaseUrl, submittedKeyword],
    enabled: submittedKeyword.length > 0 && !configurationError,
    queryFn: () => fetchStreamerSearchResults(apiBaseUrl, submittedKeyword),
  });
  const logoutMutation = useMutation({
    mutationKey: ["auth-logout", apiBaseUrl],
    mutationFn: () => logout(apiBaseUrl),
  });

  const requestUrl = useMemo(() => {
    if (configurationError) {
      return configurationError;
    }

    if (submittedKeyword.length === 0) {
      return `${apiBaseUrl.replace(/\/+$/, "")}/streamers/search?keyword=...`;
    }

    const url = createStreamerSearchUrl(apiBaseUrl, submittedKeyword);

    return url.toString();
  }, [apiBaseUrl, configurationError, submittedKeyword]);

  const hasResults = (searchQuery.data?.length ?? 0) > 0;
  const lastSearchUpdated =
    searchQuery.dataUpdatedAt > 0
      ? new Date(searchQuery.dataUpdatedAt).toLocaleTimeString("ko-KR", { hour12: false })
      : null;
  const lastLogoutUpdated =
    lastLogoutRequestedAt
      ? new Date(lastLogoutRequestedAt).toLocaleTimeString("ko-KR", { hour12: false })
      : null;
  const logoutResponsePreview = useMemo(() => {
    if (!logoutMutation.isSuccess) {
      return "로그아웃 호출 결과가 여기에 표시됩니다.";
    }

    if (logoutMutation.data.payload === null) {
      return "응답 본문 없음";
    }

    return JSON.stringify(logoutMutation.data.payload, null, 2);
  }, [logoutMutation.data, logoutMutation.isSuccess]);

  return (
    <main className="min-h-[calc(100dvh-var(--header-height))] bg-background px-6 py-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
        <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Link
                href="/draft"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-2 text-xs font-semibold text-text-secondary transition-colors hover:text-text-primary"
              >
                <ArrowLeftIcon />
                드래프트로 돌아가기
              </Link>

              <p className="mt-4 text-xs font-bold tracking-[0.16em] text-violet-600 uppercase">
                API TEST
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] text-text-primary">API 연동 확인</h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-text-secondary">
                인증과 스트리머 검색을 브라우저에서 `NEXT_PUBLIC_API_BASE_URL` 기준으로 직접 테스트합니다.
              </p>
            </div>

            <div className="grid gap-3 rounded-3xl border border-border bg-surface-muted px-4 py-4 text-sm lg:min-w-[320px]">
              <div>
                <p className="text-xs font-semibold text-text-muted">Target Server</p>
                <p className="mt-1 break-all font-semibold text-text-primary">
                  {configurationError ? "미설정" : apiBaseUrl}
                </p>
              </div>
              <div>
                <p className="text-xs font-semibold text-text-muted">Upstream Endpoint</p>
                <p className="mt-1 break-all font-medium text-text-secondary">GET /streamers/search</p>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Auth API Test</h2>
              <p className="mt-1 text-sm text-text-secondary">
                로그인은 브라우저를 네이버 인증 페이지로 이동시키고, 로그아웃은 현재 브라우저 쿠키로 직접 호출합니다.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-5 xl:grid-cols-2">
            <article className="rounded-3xl border border-border bg-surface-muted px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">GET /auths/login</p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    버튼을 누르면 네이버 로그인 인증 화면으로 이동합니다. 성공 후에는 백엔드에 설정된 redirect URL로 이동합니다.
                  </p>
                </div>
                <StatusChip label="redirect" tone="default" />
              </div>

              <div className="mt-4 rounded-3xl border border-border bg-surface px-4 py-4">
                <p className="text-xs font-semibold text-text-muted">Request URL</p>
                <p className="mt-1 break-all text-sm text-text-secondary">
                  {configurationError ? configurationError : loginUrl}
                </p>
              </div>

              <button
                type="button"
                disabled={Boolean(configurationError)}
                onClick={() => {
                  if (configurationError) {
                    return;
                  }

                  window.location.assign(loginUrl);
                }}
                className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl bg-slate-950 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                네이버 로그인 이동
              </button>
            </article>

            <article className="rounded-3xl border border-border bg-surface-muted px-5 py-5">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-text-primary">POST /auths/logout</p>
                  <p className="mt-1 text-sm leading-6 text-text-secondary">
                    현재 브라우저에 저장된 `pickz.co.kr` 인증 쿠키를 포함해 로그아웃을 직접 호출합니다.
                  </p>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <StatusChip
                  label={
                    logoutMutation.isError
                      ? "호출 실패"
                      : logoutMutation.isPending
                        ? "호출 중"
                        : logoutMutation.isSuccess
                          ? "호출 성공"
                          : "대기 중"
                  }
                  tone={
                    logoutMutation.isError
                      ? "error"
                      : logoutMutation.isSuccess
                        ? "success"
                        : "default"
                  }
                />
                {logoutMutation.isSuccess ? (
                  <StatusChip label={`status ${logoutMutation.data.status}`} tone="default" />
                ) : null}
                {lastLogoutUpdated ? <StatusChip label={`updated ${lastLogoutUpdated}`} tone="default" /> : null}
              </div>

              <div className="mt-4 rounded-3xl border border-border bg-surface px-4 py-4">
                <p className="text-xs font-semibold text-text-muted">Request URL</p>
                <p className="mt-1 break-all text-sm text-text-secondary">
                  {configurationError ? configurationError : logoutUrl}
                </p>
              </div>

              <button
                type="button"
                disabled={Boolean(configurationError) || logoutMutation.isPending}
                onClick={() => {
                  if (configurationError) {
                    return;
                  }

                  setLastLogoutRequestedAt(Date.now());
                  logoutMutation.mutate();
                }}
                className="mt-4 flex h-12 w-full cursor-pointer items-center justify-center rounded-2xl border border-border bg-surface text-sm font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                로그아웃 호출
              </button>

              <div className="mt-4 rounded-3xl border border-border bg-slate-950 px-4 py-4">
                <p className="text-xs font-semibold text-slate-400">Response</p>
                <pre className="mt-2 overflow-auto text-xs leading-6 text-slate-100">
                  {logoutMutation.isError ? logoutMutation.error.message : logoutResponsePreview}
                </pre>
              </div>
            </article>
          </div>
        </section>

        <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-text-primary">Streamer Search Test</h2>
              <p className="mt-1 text-sm text-text-secondary">
                검색어를 입력하면 브라우저에서 `GET /streamers/search`를 직접 호출합니다.
              </p>
            </div>
          </div>

          {configurationError ? (
            <div className="mb-4 rounded-3xl border border-rose-200 bg-rose-50 px-4 py-4 text-sm text-rose-700">
              {configurationError} `web/.env.local`에 `NEXT_PUBLIC_API_BASE_URL`을 설정하세요.
            </div>
          ) : null}

          <form
            className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_auto]"
            onSubmit={(event) => {
              event.preventDefault();

              if (configurationError) {
                return;
              }

              const normalizedKeyword = keyword.trim();

              if (normalizedKeyword.length === 0) {
                return;
              }

              if (normalizedKeyword === submittedKeyword) {
                void searchQuery.refetch();
                return;
              }

              setSubmittedKeyword(normalizedKeyword);
            }}
          >
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-text-primary">keyword</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <SearchIcon />
                </span>
                <input
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                  }}
                  placeholder="예: 녹두로"
                  className="h-12 w-full rounded-2xl border border-border bg-surface px-4 pl-11 text-sm text-text-primary outline-none transition focus:border-violet-300"
                />
              </div>
            </label>

            <button
              type="submit"
              disabled={Boolean(configurationError) || keyword.trim().length === 0 || searchQuery.isFetching}
              className="h-12 rounded-2xl bg-slate-950 px-5 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              조회하기
            </button>

            <button
              type="button"
              onClick={() => {
                setKeyword("");
                setSubmittedKeyword("");
              }}
              className="h-12 rounded-2xl border border-border bg-surface px-5 text-sm font-semibold text-text-secondary"
            >
              초기화
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <StatusChip
              label={
                searchQuery.isError
                  ? "호출 실패"
                  : searchQuery.isFetching
                    ? "호출 중"
                    : searchQuery.isSuccess
                      ? "호출 성공"
                      : "대기 중"
              }
              tone={searchQuery.isError ? "error" : searchQuery.isSuccess ? "success" : "default"}
            />
            {submittedKeyword ? <StatusChip label={`keyword ${submittedKeyword}`} tone="default" /> : null}
            {searchQuery.isSuccess ? (
              <StatusChip label={`results ${searchQuery.data?.length ?? 0}`} tone="default" />
            ) : null}
            {lastSearchUpdated ? <StatusChip label={`updated ${lastSearchUpdated}`} tone="default" /> : null}
            {submittedKeyword ? (
              <button
                type="button"
                onClick={() => {
                  void searchQuery.refetch();
                }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface-muted px-3 py-1.5 text-xs font-semibold text-text-secondary"
              >
                <RefreshIcon />
                다시 호출
              </button>
            ) : null}
          </div>

          <div className="mt-4 rounded-3xl border border-border bg-surface-muted px-4 py-4">
            <p className="text-xs font-semibold text-text-muted">Request URL</p>
            <p className="mt-1 break-all text-sm text-text-secondary">{requestUrl}</p>
          </div>
        </section>

        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_minmax(360px,0.8fr)]">
          <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-text-primary">검색 결과</h2>
                <p className="mt-1 text-sm text-text-secondary">
                  API에서 받은 스트리머 목록을 카드 형태로 그대로 보여줍니다.
                </p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {submittedKeyword.length === 0 ? (
                <div className="rounded-3xl border border-dashed border-border px-5 py-12 text-center text-sm text-text-secondary">
                  검색어를 입력한 뒤 조회를 실행하세요.
                </div>
              ) : searchQuery.isFetching ? (
                <div className="rounded-3xl border border-dashed border-border px-5 py-12 text-center text-sm text-text-secondary">
                  응답을 불러오는 중입니다.
                </div>
              ) : searchQuery.isError ? (
                <div className="rounded-3xl border border-rose-200 bg-rose-50 px-5 py-12 text-center text-sm text-rose-700">
                  {searchQuery.error.message}
                </div>
              ) : hasResults ? (
                searchQuery.data?.map((streamer) => (
                  <ResultCard key={streamer.id} streamer={streamer} />
                ))
              ) : (
                <div className="rounded-3xl border border-dashed border-border px-5 py-12 text-center text-sm text-text-secondary">
                  검색 결과가 없습니다.
                </div>
              )}
            </div>
          </section>

          <section className="rounded-[28px] border border-border bg-surface p-6 shadow-sm">
            <h2 className="text-xl font-bold text-text-primary">Raw JSON</h2>
            <p className="mt-1 text-sm text-text-secondary">
              프록시 응답을 그대로 확인할 수 있게 JSON도 함께 노출합니다.
            </p>

            <pre className="mt-4 max-h-[640px] overflow-auto rounded-3xl bg-slate-950 px-4 py-4 text-xs leading-6 text-slate-100">
              {JSON.stringify(searchQuery.data ?? [], null, 2)}
            </pre>
          </section>
        </div>
      </div>
    </main>
  );
}
