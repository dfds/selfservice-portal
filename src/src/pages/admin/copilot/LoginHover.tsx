import React from "react";
import { Link } from "react-router-dom";
import {
  useCopilotUserSearch,
  useGraphDisplayName,
  useGraphPhoto,
} from "@/state/remote/queries/copilot";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserAvatar } from "@/components/ui/UserAvatar";

function LoginCard({ login }: { login: string }) {
  const search = useCopilotUserSearch(login);
  const match = search.data?.items.find(
    (u) => u.login.toLowerCase() === login.toLowerCase(),
  );
  const email = match?.primaryEmail ?? "";
  const graphName = useGraphDisplayName(email);
  const photo = useGraphPhoto(email);
  const name = graphName.data || match?.name;
  const loading = search.isFetching && !match;
  return (
    <div className="flex items-start gap-3">
      <UserAvatar
        name={name || login}
        pictureUrl={photo.data ?? undefined}
        size="lg"
      />
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="truncate text-[0.8125rem] font-medium text-primary">
          {name || (loading ? "Looking up…" : `@${login}`)}
        </span>
        <span className="truncate font-mono text-[0.6875rem] text-secondary">
          @{login}
        </span>
        <span className="truncate text-[0.75rem] text-secondary">
          {email || (loading ? "" : "No DFDS email")}
        </span>
        <Link
          to={`/copilot?user=${encodeURIComponent(login)}`}
          className="mt-1 text-[0.75rem] text-action hover:underline"
        >
          Open Copilot usage
        </Link>
      </div>
    </div>
  );
}

export function LoginHover({
  login,
  children,
}: {
  login: string;
  children: React.ReactNode;
}) {
  if (!login) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="inline-flex min-w-0 max-w-full">{children}</span>
      </TooltipTrigger>
      <TooltipContent
        side="top"
        className="w-[280px] border border-card bg-surface p-3 text-primary shadow-overlay"
      >
        <LoginCard login={login} />
      </TooltipContent>
    </Tooltip>
  );
}
