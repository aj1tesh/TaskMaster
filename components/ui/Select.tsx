"use client";

import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import { createPortal } from "react-dom";
import { Check, ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  placeholder?: string;
  selectSize?: "sm" | "md";
  className?: string;
  disabled?: boolean;
  error?: string;
  "aria-label"?: string;
}

const triggerSizes = {
  sm: "h-8 px-2.5 text-xs gap-1.5",
  md: "h-10 px-3 text-sm gap-2",
};

export function Select({
  value,
  onValueChange,
  options,
  label,
  placeholder = "Select…",
  selectSize = "md",
  className = "",
  disabled = false,
  error,
  "aria-label": ariaLabel,
}: SelectProps) {
  const id = useId();
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [menuStyle, setMenuStyle] = useState<CSSProperties>({});

  const selected = options.find((o) => o.value === value);
  const display = selected?.label ?? placeholder;

  const updatePosition = useCallback(() => {
    const el = rootRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const gap = 6;
    const maxHeight = 240;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUp = spaceBelow < 160 && spaceAbove > spaceBelow;

    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      ...(openUp
        ? { bottom: window.innerHeight - rect.top + gap, maxHeight: Math.min(maxHeight, spaceAbove) }
        : { top: rect.bottom + gap, maxHeight: Math.min(maxHeight, spaceBelow) }),
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open, updatePosition]);

  useEffect(() => {
    if (!open) return;
    const idx = options.findIndex((o) => o.value === value);
    setHighlight(idx >= 0 ? idx : 0);
  }, [open, options, value]);

  useEffect(() => {
    if (!open) return;
    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (rootRef.current?.contains(target)) return;
      if (listRef.current?.contains(target)) return;
      setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    if (!open || !listRef.current) return;
    const item = listRef.current.children[highlight] as HTMLElement | undefined;
    item?.scrollIntoView({ block: "nearest" });
  }, [highlight, open]);

  function selectOption(option: SelectOption) {
    onValueChange(option.value);
    setOpen(false);
  }

  function onTriggerKeyDown(e: React.KeyboardEvent) {
    if (disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen((o) => !o);
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) setOpen(true);
      else setHighlight((i) => Math.min(i + 1, options.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) setOpen(true);
      else setHighlight((i) => Math.max(i - 1, 0));
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, options.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      const option = options[highlight];
      if (option) selectOption(option);
    }
    if (e.key === "Escape") {
      e.preventDefault();
      setOpen(false);
    }
  }

  const trigger = (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        id={id}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        onKeyDown={onTriggerKeyDown}
        className={`flex w-full items-center justify-between rounded border bg-raised text-left text-text-primary transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50 ${triggerSizes[selectSize]} ${
          open
            ? "border-accent/60 ring-1 ring-accent/40"
            : "border-border hover:border-text-muted/40"
        } ${error ? "border-red-500" : ""} ${!selected ? "text-text-muted" : ""}`}
      >
        <span className="truncate">{display}</span>
        <ChevronDown
          size={selectSize === "sm" ? 14 : 16}
          className={`shrink-0 text-text-muted transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open &&
        createPortal(
          <ul
            ref={listRef}
            role="listbox"
            tabIndex={-1}
            aria-labelledby={id}
            style={menuStyle}
            onKeyDown={onListKeyDown}
            className="animate-dropdown-in overflow-y-auto rounded border border-border bg-surface py-1 shadow-md outline-none"
          >
            {options.map((option, i) => {
              const isSelected = option.value === value;
              const isHighlighted = i === highlight;
              return (
                <li
                  key={option.value === "" ? "__empty" : option.value}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlight(i)}
                  onClick={() => selectOption(option)}
                  className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm transition-colors ${
                    isHighlighted ? "bg-raised" : ""
                  } ${isSelected ? "text-accent" : "text-text-primary"}`}
                >
                  <span className="truncate">{option.label}</span>
                  {isSelected && <Check size={14} className="ml-2 shrink-0 text-accent" />}
                </li>
              );
            })}
          </ul>,
          document.body
        )}
    </div>
  );

  if (!label && !error) return trigger;

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={id} className="text-xs text-text-muted">
          {label}
        </label>
      )}
      {trigger}
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}
