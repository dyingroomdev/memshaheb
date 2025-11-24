"use client";

import { useId, useState } from "react";

type FootnoteReferenceProps = {
  label: string;
  content: string;
};

export function FootnoteReference({ label, content }: FootnoteReferenceProps) {
  const tooltipId = useId();
  const [open, setOpen] = useState(false);

  const show = () => setOpen(true);
  const hide = () => setOpen(false);

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        className="ml-0.5 inline-flex items-center justify-center rounded-full border border-accent/40 bg-card/60 px-2 text-xs font-medium text-accent transition duration-200 hover:bg-card/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        aria-describedby={tooltipId}
        aria-label={`Footnote ${label}`}
        onFocus={show}
        onBlur={hide}
        onMouseEnter={show}
        onMouseLeave={hide}
      >
        {label}
      </button>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 top-full z-20 mt-2 w-64 -translate-x-1/2 rounded-2xl border border-accent/30 bg-card/80 p-4 text-xs text-muted shadow-glow-soft backdrop-blur transition duration-200 ${
          open ? "opacity-100" : "opacity-0"
        }`}
      >
        {content}
      </span>
    </span>
  );
}
