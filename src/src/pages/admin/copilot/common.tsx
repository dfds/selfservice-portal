import React from "react";
import { Link } from "react-router-dom";
import { type CopilotEnvelope } from "@/state/remote/queries/copilot";
import { InfoAlert } from "@/components/ui/InfoAlert";
import { Skeleton } from "@/components/ui/skeleton";

function httpStatus(error: unknown): number | undefined {
  return (error as any)?.data?.status;
}

export function unavailable<T>(q: {
  data?: CopilotEnvelope<T>;
  isFetched: boolean;
}): boolean {
  return q.isFetched && q.data?.meta?.copilotAvailable === false;
}

type AdminQuery<T> = {
  data?: CopilotEnvelope<T>;
  isFetched: boolean;
  isError: boolean;
  error: unknown;
};

export function hasData<T>(q: AdminQuery<T>): boolean {
  return (
    (q.isFetched || q.data !== undefined) &&
    !q.isError &&
    !unavailable(q) &&
    q.data?.data != null
  );
}

export function QueryState<T>({
  query,
  height = 160,
  children,
}: {
  query: AdminQuery<T>;
  height?: number;
  children: (data: T) => React.ReactNode;
}) {
  // Placeholder data from a previous key counts as loaded.
  if (!query.isFetched && query.data === undefined) {
    return <Skeleton className="w-full" style={{ height }} />;
  }
  if (query.isError) {
    const status = httpStatus(query.error);
    return (
      <InfoAlert variant="error">
        {status === 403
          ? "You lack the copilot/read-all permission."
          : `copilot-insights answered ${status ?? "with an error"}.`}
      </InfoAlert>
    );
  }
  if (unavailable(query) || query.data?.data == null) {
    return (
      <InfoAlert variant="warning">copilot-insights is unavailable.</InfoAlert>
    );
  }
  return <>{children(query.data.data)}</>;
}

export function LoginLink({ login }: { login: string }) {
  return (
    <Link
      to={`/copilot?user=${encodeURIComponent(login)}`}
      className="text-action hover:underline"
    >
      {login}
    </Link>
  );
}

// Primitive props let React.memo skip table and chart renders costing ~100ms per tab switch.
export type RangedProps = { scope: string; from: string; to: string };

export function seatsParams(scope: string, inactiveDays = 0) {
  return { scope, limit: 5000, inactiveDays: inactiveDays || undefined };
}
