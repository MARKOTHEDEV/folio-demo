"use client";

import { useRef } from "react";

type Props = { value: string; onChange: (v: string) => void; disabled?: boolean; invalid?: boolean };

/** Six boxes; the page checks the code as soon as the sixth digit lands. */
export function OtpInput({ value, onChange, disabled, invalid }: Props) {
  const refs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = Array.from({ length: 6 }, (_, i) => value[i] ?? "");

  function setAt(i: number, d: string) {
    const next = digits.slice();
    next[i] = d;
    onChange(next.join("").slice(0, 6));
  }

  return (
    <div className="flex gap-2 sm:gap-3" role="group" aria-label="6-digit code">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={(el) => {
            refs.current[i] = el;
          }}
          value={d}
          disabled={disabled}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          aria-label={`Digit ${i + 1}`}
          maxLength={1}
          className={`num w-11 h-14 sm:w-13 sm:h-15 text-center text-2xl rounded-lg border bg-card outline-none transition ${
            invalid ? "border-danger" : d ? "border-green" : "border-line"
          } focus:border-green focus:shadow-[0_0_0_3px_rgba(15,122,92,0.15)]`}
          onChange={(e) => {
            const v = e.target.value.replace(/\D/g, "");
            if (v.length > 1) {
              const merged = (digits.slice(0, i).join("") + v).slice(0, 6);
              onChange(merged);
              refs.current[Math.min(merged.length, 5)]?.focus();
              return;
            }
            setAt(i, v);
            if (v && i < 5) refs.current[i + 1]?.focus();
          }}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !d && i > 0) {
              setAt(i - 1, "");
              refs.current[i - 1]?.focus();
            }
          }}
          onPaste={(e) => {
            const v = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
            if (!v) return;
            e.preventDefault();
            onChange(v);
            refs.current[Math.min(v.length, 5)]?.focus();
          }}
        />
      ))}
    </div>
  );
}
