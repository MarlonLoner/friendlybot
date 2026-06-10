import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { slugify } from "@/lib/search";

const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
const maxFileSize = 5 * 1024 * 1024;
const maxFiles = 12;

function safeFilename(value: string) {
  const parts = value.split(".");
  const extension = parts.length > 1 ? parts.pop() : "";
  const base = slugify(parts.join(".") || "lodge-image") || "lodge-image";
  return extension ? `${base}.${extension.toLowerCase()}` : base;
}

export async function POST(request: NextRequest) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: "Image uploads are not configured. Add BLOB_READ_WRITE_TOKEN in Vercel and local .env." },
      { status: 500 }
    );
  }

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "A multipart/form-data request is required." }, { status: 400 });
  }

  const lodgeName = String(formData.get("lodgeName") ?? "temp-lodge");
  const files = formData.getAll("files").filter((item): item is File => item instanceof File);

  if (files.length === 0) {
    return NextResponse.json({ error: "Please select at least one image to upload." }, { status: 400 });
  }

  if (files.length > maxFiles) {
    return NextResponse.json({ error: `You can upload up to ${maxFiles} images at a time.` }, { status: 400 });
  }

  for (const file of files) {
    if (!acceptedTypes.has(file.type)) {
      return NextResponse.json({ error: `${file.name} is not supported. Upload JPG, PNG, or WebP images only.` }, { status: 400 });
    }

    if (file.size > maxFileSize) {
      return NextResponse.json({ error: `${file.name} is too large. Maximum size is 5MB per image.` }, { status: 400 });
    }
  }

  const prefix = `lodges/${slugify(lodgeName) || "temp-lodge"}`;
  const uploaded = await Promise.all(
    files.map(async (file) => {
      const pathname = `${prefix}/${Date.now()}-${safeFilename(file.name)}`;
      const blob = await put(pathname, file, {
        access: "public",
        contentType: file.type,
        token: process.env.BLOB_READ_WRITE_TOKEN
      });

      return {
        url: blob.url,
        pathname: blob.pathname,
        contentType: file.type,
        size: file.size
      };
    })
  );

  return NextResponse.json({ images: uploaded });
}
