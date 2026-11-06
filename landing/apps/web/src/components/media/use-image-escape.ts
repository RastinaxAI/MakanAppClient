"use client";
import { useLayoutEffect } from "react";

export function useImageEscape(
  open: boolean,
  setOpen: (open: boolean) => void,
) {
  useLayoutEffect(() => {
    if (!open) return;
    const close = (event: KeyboardEvent) => {
      if (event.key !== "Escape" || event.isComposing) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      setOpen(false);
    };
    document.addEventListener("keydown", close, true);
    return () => document.removeEventListener("keydown", close, true);
  }, [open, setOpen]);
}
