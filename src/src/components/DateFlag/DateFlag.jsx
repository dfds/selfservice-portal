import React from "react";

function DateFlag({ date }) {
  const d = new Date(date);

  const day = d.toLocaleDateString(undefined, { day: "2-digit" });
  const month = d
    .toLocaleDateString(undefined, { month: "short" })
    .toUpperCase();
  const year = d.getFullYear();

  return (
    <div className="flex flex-col items-center bg-surface-subtle group-hover:bg-surface rounded-[5px] px-3 py-2 min-w-[52px] shrink-0 transition-colors ease-out-expo duration-150">
      <span className="font-mono text-[18px] font-bold leading-none text-primary">
        {day}
      </span>
      <span className="font-mono text-[9px] font-semibold tracking-[0.1em] text-muted leading-none mt-1">
        {month}
      </span>
      <span className="font-mono text-[9px] tracking-[0.04em] text-muted leading-none mt-[2px]">
        {year}
      </span>
    </div>
  );
}

export default DateFlag;
