/** Mime types and extensions accepted for quote declarations upload (matches source UI). */
const ALLOWED_MIME = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
]);

export function isAllowedQuoteUploadFile(file: Pick<File, "name" | "type">): boolean {
  const t = file.type?.trim();
  if (t && ALLOWED_MIME.has(t)) return true;
  const name = file.name.toLowerCase();
  return name.endsWith(".pdf") || name.endsWith(".docx") || name.endsWith(".doc");
}
