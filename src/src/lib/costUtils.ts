/**
 * Returns the percentage change in average daily cost between two periods,
 * or null if there is insufficient data to compute a trend.
 */
export function computeCostTrendPct(
    current: { pv: number }[],
    previous: { pv: number }[]
): number | null {
    if (current.length === 0 || previous.length === 0) return null;
    const avgCurrent = current.reduce((acc, x) => acc + x.pv, 0) / current.length;
    const avgPrevious = previous.reduce((acc, x) => acc + x.pv, 0) / previous.length;
    if (avgPrevious <= 0) return null;
    return ((avgCurrent - avgPrevious) / avgPrevious) * 100;
}
