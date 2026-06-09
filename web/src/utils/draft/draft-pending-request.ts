interface ReusePendingRequestParams<T> {
  cacheKey: string;
  pendingRequests: Map<string, Promise<T>>;
  request: () => Promise<T>;
}

/** 같은 key의 진행 중 요청이 있으면 기존 Promise 재사용 */
export function reusePendingRequest<T>({
  cacheKey,
  pendingRequests,
  request,
}: ReusePendingRequestParams<T>) {
  const pendingRequest = pendingRequests.get(cacheKey);

  if (pendingRequest) {
    return pendingRequest;
  }

  const nextRequest = request().finally(() => {
    pendingRequests.delete(cacheKey);
  });

  pendingRequests.set(cacheKey, nextRequest);

  return nextRequest;
}
