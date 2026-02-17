"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

interface MetricHintProps {
  text: string;
}

export default function MetricHint({ text }: MetricHintProps) {
  const [open, setOpen] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  const updatePosition = useCallback(() => {
    if (!btnRef.current) return;
    const rect = btnRef.current.getBoundingClientRect();
    setPos({
      top: rect.top - 8,
      left: rect.left + rect.width / 2,
    });
  }, []);

  useEffect(() => {
    if (!open) return;
    updatePosition();

    function handleClickOutside(e: MouseEvent) {
      if (
        btnRef.current?.contains(e.target as Node) ||
        tooltipRef.current?.contains(e.target as Node)
      )
        return;
      setOpen(false);
    }

    window.addEventListener("scroll", updatePosition, true);
    window.addEventListener("resize", updatePosition);
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      window.removeEventListener("scroll", updatePosition, true);
      window.removeEventListener("resize", updatePosition);
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, [open, updatePosition]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="ml-0.5 inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full bg-(--color-bg-tertiary) text-[10px] leading-none font-bold text-(--color-text-tertiary) transition-colors hover:bg-(--color-bg-hover) hover:text-(--color-text-secondary)"
        aria-label="지표 설명"
      >
        ?
      </button>
      {open &&
        pos &&
        createPortal(
          <span
            ref={tooltipRef}
            role="tooltip"
            className="fixed z-9999 w-56 rounded-lg bg-(--color-text-primary) px-3 py-2 text-xs leading-relaxed font-normal text-(--color-bg-primary) shadow-lg"
            style={{
              top: pos.top,
              left: pos.left,
              transform: "translate(-50%, -100%)",
            }}
          >
            {text}
            <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-(--color-text-primary)" />
          </span>,
          document.body,
        )}
    </>
  );
}
