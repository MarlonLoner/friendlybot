"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import type { LodgeImageRecord } from "@/lib/types";

const fallbackImage = {
  id: "fallback-lodge-image",
  imageUrl: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  altText: "Lodge exterior",
  sortOrder: 0
};

type CarouselImage = Pick<LodgeImageRecord, "id" | "imageUrl" | "altText" | "sortOrder">;

type LodgeImageCarouselProps = {
  images: CarouselImage[];
  lodgeName: string;
  mode?: "compact" | "detail";
  showThumbnails?: boolean;
  enableLightbox?: boolean;
  className?: string;
};

export function LodgeImageCarousel({
  images,
  lodgeName,
  mode = "detail",
  showThumbnails = mode === "detail",
  enableLightbox = mode === "detail",
  className = ""
}: LodgeImageCarouselProps) {
  const galleryImages = useMemo(() => (images.length > 0 ? images : [fallbackImage]), [images]);
  const [current, setCurrent] = useState(0);
  const [pointerStart, setPointerStart] = useState<number | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const hasMultiple = galleryImages.length > 1;
  const activeImage = galleryImages[current] ?? galleryImages[0];
  const compact = mode === "compact";

  useEffect(() => {
    if (!isLightboxOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setIsLightboxOpen(false);
      if (event.key === "ArrowRight") goNext();
      if (event.key === "ArrowLeft") goPrevious();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isLightboxOpen, current, galleryImages.length]);

  function goPrevious() {
    setCurrent((value) => (value === 0 ? galleryImages.length - 1 : value - 1));
  }

  function goNext() {
    setCurrent((value) => (value + 1) % galleryImages.length);
  }

  function handlePointerEnd(clientX: number) {
    if (pointerStart === null || !hasMultiple) return;
    const distance = pointerStart - clientX;
    if (Math.abs(distance) > 36) {
      if (distance > 0) goNext();
      else goPrevious();
    }
    setPointerStart(null);
  }

  return (
    <>
      <div className={className}>
        <div
          className={`relative overflow-hidden bg-eclipse-blue ${compact ? "aspect-[4/3]" : "aspect-[16/10] rounded-lg shadow-soft"}`}
          onPointerDown={(event) => setPointerStart(event.clientX)}
          onPointerUp={(event) => handlePointerEnd(event.clientX)}
          onPointerCancel={() => setPointerStart(null)}
        >
          <img
            src={activeImage.imageUrl}
            alt={activeImage.altText ?? `${lodgeName} image ${current + 1}`}
            className="h-full w-full object-cover"
            loading={compact ? "lazy" : "eager"}
          />
          <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" aria-hidden="true" />

          {hasMultiple ? (
            <>
              <CarouselButton label="Previous image" direction="left" compact={compact} onClick={goPrevious} />
              <CarouselButton label="Next image" direction="right" compact={compact} onClick={goNext} />
              <span className="absolute bottom-3 right-3 rounded-full bg-black/55 px-2.5 py-1 text-xs font-semibold text-white">
                {current + 1} / {galleryImages.length}
              </span>
            </>
          ) : null}

          {enableLightbox ? (
            <button
              type="button"
              onClick={() => setIsLightboxOpen(true)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/60"
              aria-label="Open image gallery"
            >
              <Maximize2 className="h-4 w-4" aria-hidden="true" />
            </button>
          ) : null}
        </div>

        {showThumbnails && galleryImages.length > 1 ? (
          <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {galleryImages.map((image, index) => (
              <button
                key={`${image.id}-${index}`}
                type="button"
                onClick={() => setCurrent(index)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-md ring-2 transition ${
                  current === index ? "ring-eclipse-gold" : "ring-transparent opacity-75 hover:opacity-100"
                }`}
                aria-label={`Show ${lodgeName} image ${index + 1}`}
              >
                <img src={image.imageUrl} alt={image.altText ?? `${lodgeName} thumbnail ${index + 1}`} className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        ) : null}
      </div>

      {isLightboxOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button
            type="button"
            onClick={() => setIsLightboxOpen(false)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Close image gallery"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
          <div className="relative w-full max-w-6xl">
            <img src={activeImage.imageUrl} alt={activeImage.altText ?? `${lodgeName} image ${current + 1}`} className="max-h-[82vh] w-full rounded-lg object-contain" />
            {hasMultiple ? (
              <>
                <CarouselButton label="Previous image" direction="left" compact={false} onClick={goPrevious} />
                <CarouselButton label="Next image" direction="right" compact={false} onClick={goNext} />
                <span className="absolute bottom-4 right-4 rounded-full bg-black/55 px-3 py-1.5 text-sm font-semibold text-white">
                  {current + 1} / {galleryImages.length}
                </span>
              </>
            ) : null}
          </div>
        </div>
      ) : null}
    </>
  );
}

function CarouselButton({
  label,
  direction,
  compact,
  onClick
}: {
  label: string;
  direction: "left" | "right";
  compact: boolean;
  onClick: () => void;
}) {
  const Icon = direction === "left" ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 inline-flex -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition hover:bg-black/65 ${
        direction === "left" ? "left-3" : "right-3"
      } ${compact ? "h-8 w-8" : "h-11 w-11"}`}
      aria-label={label}
    >
      <Icon className={compact ? "h-4 w-4" : "h-5 w-5"} aria-hidden="true" />
    </button>
  );
}
