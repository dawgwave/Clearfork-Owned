import { join } from "path";

/** Root for user uploads (Docker: volume at /app/uploads). */
export function getUploadRoot(): string {
  const env = process.env.UPLOAD_DIR?.trim();
  if (env) return env;
  return join(/* turbopackIgnore: true */ process.cwd(), "uploads");
}

export function getBlogUploadDir(): string {
  return join(getUploadRoot(), "blog");
}

/** Public URL path (same origin) for a file stored under blog/. */
export function publicUrlForBlogFile(filename: string): string {
  return `/uploads/blog/${filename}`;
}
