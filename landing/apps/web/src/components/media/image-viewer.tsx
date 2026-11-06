"use client";

import { useState } from "react";
import Image from "next/image";
import { Dialog } from "radix-ui";
import { Expand, X, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageEscape } from "./use-image-escape";

export type ViewerImage = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

export function ImageViewer({
  image,
  caption,
  label,
  sizes = "(max-width: 768px) 90vw, 800px",
}: {
  image: ViewerImage;
  caption?: string;
  label?: string;
  sizes?: string;
}) {
  const [open, setOpen] = useState(false);
  const [original, setOriginal] = useState(false);
  useImageEscape(open, setOpen);
  return (
    <Dialog.Root
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        setOriginal(false);
      }}
    >
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="image-viewer-button"
          aria-label={label || `بزرگنمایی تصویر: ${image.alt}`}
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={image.width}
            height={image.height}
            sizes={sizes}
            unoptimized={image.src.startsWith("/api/v1/admin/")}
          />
          <span className="image-viewer-expand">
            <Expand size={16} aria-hidden="true" /> بزرگنمایی
          </span>
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="image-viewer-overlay" />
        <Dialog.Content
          className="image-viewer-dialog"
          dir="rtl"
          data-image-viewer-dialog=""
          onEscapeKeyDown={(event) => {
            event.preventDefault();
          }}
        >
          <div className="image-viewer-heading">
            <div className="min-w-0">
              <Dialog.Title className="text-base font-bold">
                {image.alt}
              </Dialog.Title>
              <Dialog.Description className="mt-2 text-sm leading-7 text-muted-foreground">
                {caption ||
                  "برای خواندن جزئیات، اندازهٔ اصلی را انتخاب کنید و داخل تصویر حرکت کنید."}
              </Dialog.Description>
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="بستن تصویر">
                <X aria-hidden="true" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="flex justify-start px-5 pb-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setOriginal(!original)}
              aria-pressed={original}
            >
              {original ? (
                <Minimize2 aria-hidden="true" />
              ) : (
                <Maximize2 aria-hidden="true" />
              )}
              {original ? "جا شدن در صفحه" : "اندازهٔ اصلی"}
            </Button>
          </div>
          <div
            className="image-viewer-scroll"
            tabIndex={0}
            role="region"
            aria-label="تصویر بزرگ؛ قابل پیمایش"
            data-original={original}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              unoptimized
              className={
                original ? "image-viewer-original" : "image-viewer-fit"
              }
            />
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
