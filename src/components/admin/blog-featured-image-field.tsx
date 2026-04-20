"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const fileInputClass = cn(
  "block w-full min-w-0 text-sm text-foreground",
  "rounded-md border border-input bg-background px-3 py-2 shadow-sm",
  "file:mr-3 file:inline-flex file:h-9 file:cursor-pointer file:items-center file:rounded-md file:border-0 file:bg-primary file:px-4 file:text-sm file:font-medium file:text-primary-foreground file:shadow-sm hover:file:bg-primary/90",
  "disabled:cursor-not-allowed disabled:opacity-50",
);

type Props = {
  value: string;
  onChange: (url: string) => void;
  disabled?: boolean;
};

export function BlogFeaturedImageField({ value, onChange, disabled }: Props) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function uploadFile(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/admin/blogs/upload-image", {
        method: "POST",
        body: fd,
        credentials: "include",
      });
      const data = (await res.json()) as { error?: string; url?: string };
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }
      if (data.url) {
        onChange(data.url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="blog_featured_image">Featured image</Label>
      {value ? (
        <div className="space-y-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- admin preview; may be same-origin /uploads */}
          <img
            src={value}
            alt=""
            className="max-h-48 w-full rounded-md border object-cover"
          />
          <div className="space-y-2">
            <Label
              htmlFor="blog_featured_image_replace"
              className="text-xs text-muted-foreground"
            >
              Replace with another image
            </Label>
            <input
              id="blog_featured_image_replace"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className={fileInputClass}
              disabled={disabled || uploading}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = "";
                if (f) void uploadFile(f);
              }}
            />
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-0"
            disabled={disabled || uploading}
            onClick={() => onChange("")}
          >
            Remove image
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          <input
            id="blog_featured_image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className={fileInputClass}
            disabled={disabled || uploading}
            onChange={(e) => {
              const f = e.target.files?.[0];
              e.target.value = "";
              if (f) void uploadFile(f);
            }}
          />
          {uploading && (
            <p className="text-sm text-muted-foreground">Uploading…</p>
          )}
        </div>
      )}
      {error && <p className="text-sm text-destructive">{error}</p>}
      <p className="text-xs text-muted-foreground">
        JPEG, PNG, WebP, or GIF. Max 5 MB.
      </p>
    </div>
  );
}
