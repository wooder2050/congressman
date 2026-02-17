"use client";

import { Suspense, type ReactNode } from "react";
import { ErrorBoundary, type FallbackProps } from "react-error-boundary";

function DefaultErrorHandler({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <p className="mb-2 text-lg font-bold text-(--color-text-primary)">문제가 발생했습니다</p>
      <p className="mb-4 text-sm text-(--color-text-tertiary)">
        {error instanceof Error ? error.message : "알 수 없는 오류"}
      </p>
      <button
        onClick={resetErrorBoundary}
        className="rounded-lg bg-(--color-primary) px-6 py-3 text-base font-semibold text-(--color-text-inverse) transition-colors hover:bg-(--color-primary-hover)"
      >
        다시 시도
      </button>
    </div>
  );
}

interface CongressWrapperProps {
  children: ReactNode;
  fallback: ReactNode;
  errorFallback?: (props: FallbackProps) => ReactNode;
}

export default function CongressWrapper({
  children,
  fallback,
  errorFallback,
}: CongressWrapperProps) {
  return (
    <ErrorBoundary FallbackComponent={errorFallback ?? DefaultErrorHandler}>
      <Suspense fallback={fallback}>{children}</Suspense>
    </ErrorBoundary>
  );
}
