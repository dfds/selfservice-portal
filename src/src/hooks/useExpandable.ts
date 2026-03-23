import { useState } from "react";

/**
 * Manages expand/collapse state for a lazy-loading expandable row.
 * `triggered` becomes true on first toggle and stays true, enabling
 * lazy data fetching that persists across open/close cycles.
 */
export function useExpandable(defaultExpanded = false) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const [triggered, setTriggered] = useState(defaultExpanded);

  function toggle() {
    if (!triggered) setTriggered(true);
    setExpanded((e) => !e);
  }

  return { expanded, triggered, toggle };
}
