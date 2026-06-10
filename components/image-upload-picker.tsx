"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { ImagePlus, Trash2 } from "lucide-react";

const acceptedTypes = ["image/jpeg", "image/png", "image/webp"];
const maxFileSize = 5 * 1024 * 1024;

export type SelectedImage = {
  id: string;
  file: File;
  previewUrl: string;
};

export function ImageUploadPicker({
  images,
  onChange,
  maxImages,
  existingCount = 0
}: {
  images: SelectedImage[];
  onChange: (images: SelectedImage[]) => void;
  maxImages: number;
  existingCount?: number;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  const remaining = Math.max(0, maxImages - existingCount - images.length);
  const helperText = useMemo(() => `JPG, PNG or WebP. Max 5MB each. ${remaining} slot${remaining === 1 ? "" : "s"} available.`, [remaining]);

  useEffect(() => {
    return () => {
      images.forEach((image) => URL.revokeObjectURL(image.previewUrl));
    };
  }, []);

  function addFiles(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    setError(null);

    if (files.length > remaining) {
      setError(`You can add ${remaining} more image${remaining === 1 ? "" : "s"}.`);
      return;
    }

    const nextImages: SelectedImage[] = [];
    for (const file of files) {
      if (!acceptedTypes.includes(file.type)) {
        setError(`${file.name} is not supported. Upload JPG, PNG, or WebP images only.`);
        return;
      }

      if (file.size > maxFileSize) {
        setError(`${file.name} is too large. Maximum size is 5MB per image.`);
        return;
      }

      nextImages.push({
        id: `${file.name}-${file.size}-${crypto.randomUUID()}`,
        file,
        previewUrl: URL.createObjectURL(file)
      });
    }

    onChange([...images, ...nextImages]);
  }

  function removeImage(id: string) {
    const removed = images.find((image) => image.id === id);
    if (removed) URL.revokeObjectURL(removed.previewUrl);
    onChange(images.filter((image) => image.id !== id));
  }

  return (
    <div className="rounded-lg border border-dashed border-eclipse-gold/50 bg-eclipse-mist p-4">
      <input ref={inputRef} type="file" accept={acceptedTypes.join(",")} multiple className="hidden" onChange={addFiles} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-eclipse-ink">Upload lodge photos</p>
          <p className="mt-1 text-xs text-slate-600">{helperText}</p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={remaining === 0}
          className="inline-flex items-center justify-center gap-2 rounded-md bg-eclipse-blue px-4 py-2 text-sm font-semibold text-white transition hover:bg-eclipse-blueSoft disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ImagePlus className="h-4 w-4" aria-hidden="true" />
          Choose Images
        </button>
      </div>

      {error ? <p className="mt-3 rounded-md bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p> : null}

      {images.length > 0 ? (
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg bg-white ring-1 ring-slate-200">
              <img src={image.previewUrl} alt={image.file.name} className="aspect-square w-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(image.id)}
                className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-md bg-white/95 text-rose-600 shadow-sm transition hover:bg-rose-50"
                aria-label={`Remove ${image.file.name}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
