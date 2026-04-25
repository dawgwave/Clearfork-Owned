export function youtubeThumbFromId(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

/** Extract 11-char YouTube video id from embed id, watch URL, or youtu.be */
export function normalizeYouTubeId(input: string): string {
  const s = input.trim();
  if (!s) return "";
  if (/^[\w-]{11}$/.test(s)) return s;
  const u = s.startsWith("http")
    ? s
    : "https://www.youtube.com/" + s.replace(/^\//, "");
  let parsed: URL;
  try {
    parsed = new URL(u);
  } catch {
    return "";
  }
  const h = parsed.hostname.replace(/^www\./, "");
  if (h === "youtu.be") {
    const p = parsed.pathname.split("/").filter(Boolean)[0] || "";
    return p.length >= 11 ? p.slice(0, 11) : "";
  }
  if (h.includes("youtube.com")) {
    const v = parsed.searchParams.get("v");
    if (v && v.length >= 11) return v.slice(0, 11);
    const path = parsed.pathname;
    const embed = path.match(/\/embed\/([\w-]+)/);
    if (embed?.[1] && embed[1].length >= 11) return embed[1].slice(0, 11);
    const shortP = path.match(/\/shorts\/([\w-]+)/);
    if (shortP?.[1] && shortP[1].length >= 11) return shortP[1].slice(0, 11);
  }
  return "";
}
