export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelative(dateStr: string): string {
  const diffMs = Date.now() - new Date(dateStr).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

export type DeadlineStatus = {
  label: string;
  variant: "soft-warning" | "destructive";
};

export function getDeadlineStatus(
  startDateStr: string,
  periodMs: number,
  urgentDays = 2,
  overdueLabel = "Overdue",
): DeadlineStatus {
  const deadline = new Date(startDateStr).getTime() + periodMs;
  const msLeft = deadline - Date.now();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  if (daysLeft <= 0) {
    return { label: overdueLabel, variant: "destructive" };
  }
  if (daysLeft <= urgentDays) {
    return { label: `${daysLeft}d left`, variant: "destructive" };
  }
  return { label: `${daysLeft}d left`, variant: "soft-warning" };
}
