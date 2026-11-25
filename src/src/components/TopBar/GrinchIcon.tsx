import React from "react";

export default function GrinchIcon({ size = 18 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      aria-hidden="true"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {/* Head outline. */}
      <path
        d="M12 3.2 L11 1.6 L12.6 2.6 L13.6 1.4 L13.6 3.3 C17.6 3.9 20 7 20 11 C20 12.3 19.7 13.5 19.2 14.6 L20.6 15.3 L18.6 15.9 C17.3 18.9 14.8 21 12 21 C9.2 21 6.7 18.9 5.4 15.9 L3.4 15.3 L4.8 14.6 C4.3 13.5 4 12.3 4 11 C4 6.9 7 3.6 12 3.2 Z"
        fill="#7cb342"
        stroke="#33691e"
        strokeWidth={1.1}
      />
      {/* Brows. */}
      <path
        d="M6.6 8.4 L10.6 10 M17.4 8.4 L13.4 10"
        stroke="#1b3a10"
        strokeWidth={1.4}
        fill="none"
      />
      <ellipse cx={8.9} cy={11.4} rx={1.6} ry={1} fill="#fdd835" />
      <ellipse cx={15.1} cy={11.4} rx={1.6} ry={1} fill="#fdd835" />
      <circle cx={9.5} cy={11.5} r={0.6} fill="#b71c1c" />
      <circle cx={15.7} cy={11.5} r={0.6} fill="#b71c1c" />
      <path
        d="M11.2 13.4 Q12 14 12.8 13.4"
        stroke="#33691e"
        strokeWidth={1}
        fill="none"
      />
      {/* Grin. */}
      <path
        d="M6.6 14.6 Q11.5 19.4 17.6 13.6"
        stroke="#1b3a10"
        strokeWidth={1.3}
        fill="none"
      />
    </svg>
  );
}
