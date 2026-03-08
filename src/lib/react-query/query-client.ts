import { isServer, QueryClient } from "@tanstack/react-query";

export function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1분
        gcTime: 5 * 60 * 1000, // 5분
        retry: 1,
        refetchOnWindowFocus: false,

        // 네트워크 복구 시 최신화
        refetchOnReconnect: true,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

let browserQueryClient: QueryClient | undefined;

export function getQueryClient() {
  // 서버 환경: 요청마다 분리된 QueryClient가 필요하기에 매번 새로 생성
  if (isServer) {
    return makeQueryClient();
  }

  // 브라우저 환경: 최초 1회 생성 후 재사용
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }

  return browserQueryClient;
}
